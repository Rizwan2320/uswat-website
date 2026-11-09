/**
 * CMS-02: role matrix. Real PostgreSQL, Local API with the access layer enforced.
 * Rows are roles, columns are actions on a draft Page owned by the Registrar.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import type { User } from '../../src/payload-types'
import {
  as,
  can,
  getTestPayload,
  makeUser,
  pageData,
  refusal,
  system,
  uniq,
} from '../helpers/governance'

let payload: Payload
let admin: User, manager: User, approverReg: User, approverLib: User, editorReg: User
let contributor: User, otherContributor: User, auditor: User
let pReg: number, pLib: number, pByContributor: number

const draft = (user: User, gov = {}) =>
  payload.create({ collection: 'pages', draft: true, data: pageData(gov), ...as(user) })

describe('CMS-02 role matrix on Pages', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[admin, manager, approverReg, approverLib, editorReg, contributor, otherContributor, auditor] =
      await Promise.all([
        makeUser(payload, 'platformAdmin'),
        makeUser(payload, 'siteManager'),
        makeUser(payload, 'approver', ['Registrar']),
        makeUser(payload, 'approver', ['Library']),
        makeUser(payload, 'editor', ['Registrar']),
        makeUser(payload, 'contributor'),
        makeUser(payload, 'contributor'),
        makeUser(payload, 'auditor'),
      ])
    pReg = (await draft(admin, { ownerOffice: 'Registrar' })).id
    pLib = (await draft(admin, { ownerOffice: 'Library' })).id
    pByContributor = (await draft(contributor, { ownerOffice: null })).id
  })

  const read = (user: User | null, id: number) => () =>
    payload.findByID({
      collection: 'pages',
      id,
      ...(user ? as(user) : { overrideAccess: false, context: system.context }),
    })

  it('reading an unpublished record', async () => {
    const table: [string, User | null, boolean, boolean, boolean][] = [
      // role, user, Registrar page, Library page, page by the contributor
      ['platformAdmin', admin, true, true, true],
      ['siteManager', manager, true, true, true],
      ['approver (Registrar)', approverReg, true, false, false],
      ['approver (Library)', approverLib, false, true, false],
      ['editor (Registrar)', editorReg, true, false, false],
      ['contributor (author)', contributor, false, false, true],
      ['contributor (someone else)', otherContributor, false, false, false],
      ['auditor', auditor, true, true, true],
      ['anonymous', null, false, false, false],
    ]
    for (const [name, user, reg, lib, own] of table) {
      expect(await can(read(user, pReg)), `${name} reads Registrar page`).toBe(reg)
      expect(await can(read(user, pLib)), `${name} reads Library page`).toBe(lib)
      expect(await can(read(user, pByContributor)), `${name} reads contributor page`).toBe(own)
    }
  })

  it('creating a draft', async () => {
    const table: [string, User, boolean][] = [
      ['platformAdmin', admin, true],
      ['siteManager', manager, true],
      ['approver (own office)', approverReg, true],
      ['editor (own office)', editorReg, true],
      ['contributor', contributor, true],
      ['auditor', auditor, false],
    ]
    for (const [name, user, allowed] of table) {
      expect(await can(() => draft(user)), name).toBe(allowed)
    }
    expect(
      await can(() =>
        payload.create({
          collection: 'pages',
          draft: true,
          data: pageData(),
          overrideAccess: false,
        }),
      ),
      'anonymous',
    ).toBe(false)
  })

  it('editors and approvers can only create for their own office', async () => {
    expect(await refusal(() => draft(editorReg, { ownerOffice: 'Library' }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
    expect(await refusal(() => draft(approverLib, { ownerOffice: 'Registrar' }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
    expect(await refusal(() => draft(editorReg, { ownerOffice: null }))).toBe('OWNER_OUT_OF_SCOPE')
    // Office names compare trimmed and case-insensitively.
    expect(await can(() => draft(editorReg, { ownerOffice: '  registrar ' }))).toBe(true)
  })

  it('editing an unpublished record', async () => {
    const edit = (user: User, id: number) => () =>
      payload.update({
        collection: 'pages',
        id,
        draft: true,
        data: { title: uniq('edited') },
        ...as(user),
      })
    const table: [string, User, boolean][] = [
      ['platformAdmin', admin, true],
      ['siteManager', manager, true],
      ['approver (own office)', approverReg, true],
      ['approver (other office)', approverLib, false],
      ['editor (own office)', editorReg, true],
      ['contributor (not the author)', contributor, false],
      ['auditor', auditor, false],
    ]
    for (const [name, user, allowed] of table) {
      expect(await can(edit(user, pReg)), name).toBe(allowed)
    }
    expect(await can(edit(contributor, pByContributor)), 'contributor edits own draft').toBe(true)
  })

  it('a contributor loses access once the record leaves draft', async () => {
    const id = (await draft(contributor, { ownerOffice: null })).id
    await payload.update({
      collection: 'pages',
      id,
      draft: true,
      data: { governance: { status: 'in_review' } },
      ...as(manager),
    })
    expect(
      await can(() =>
        payload.update({
          collection: 'pages',
          id,
          draft: true,
          data: { title: uniq('late') },
          ...as(contributor),
        }),
      ),
    ).toBe(false)
  })

  it('deleting', async () => {
    const fresh = async (gov = {}) => (await draft(admin, gov)).id
    const del = (user: User, id: number) => () =>
      payload.delete({ collection: 'pages', id, ...as(user) })

    expect(await can(del(admin, await fresh())), 'platformAdmin').toBe(true)
    expect(await can(del(manager, await fresh())), 'siteManager, standard record').toBe(true)
    expect(
      await can(del(manager, await fresh({ riskClass: 'high_impact' }))),
      'siteManager, high-impact',
    ).toBe(false)
    expect(
      await can(del(admin, await fresh({ riskClass: 'high_impact' }))),
      'platformAdmin, high-impact',
    ).toBe(true)
    for (const [name, user] of [
      ['approver', approverReg],
      ['editor', editorReg],
      ['contributor', contributor],
      ['auditor', auditor],
    ] as const) {
      expect(await can(del(user, await fresh())), name).toBe(false)
    }
  })

  it('risk class: a contributor cannot create a low-risk record, and nobody but a reviewer can lower it', async () => {
    const low = await draft(contributor, { ownerOffice: null, riskClass: 'low' })
    expect(low.governance?.riskClass).toBe('standard')

    const hi = await draft(admin, { ownerOffice: 'Registrar', riskClass: 'high_impact' })
    const lower = (user: User) => () =>
      payload.update({
        collection: 'pages',
        id: hi.id,
        draft: true,
        data: { governance: { riskClass: 'standard' } },
        ...as(user),
      })
    expect(await refusal(lower(editorReg))).toBe('RISK_LOWER_FORBIDDEN')
    expect(await refusal(lower(manager))).toBe('RISK_LOWER_FORBIDDEN')
    expect(await can(lower(approverReg))).toBe(true)
  })

  it('pinning is for reviewers', async () => {
    const pin = (user: User) => () =>
      payload.update({
        collection: 'pages',
        id: pReg,
        draft: true,
        data: { governance: { pinned: true } },
        ...as(user),
      })
    expect(await refusal(pin(editorReg))).toBe('PIN_FORBIDDEN')
    expect(await can(pin(approverReg))).toBe(true)
  })
})
