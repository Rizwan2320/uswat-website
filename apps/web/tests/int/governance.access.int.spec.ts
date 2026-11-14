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

  it('deleting a draft that was never published (3q)', async () => {
    const fresh = async (by: User, gov = {}) => (await draft(by, gov)).id
    const del = (user: User, id: number) => () =>
      payload.delete({ collection: 'pages', id, ...as(user) })

    expect(await can(del(admin, await fresh(admin))), 'platformAdmin').toBe(true)
    expect(await can(del(manager, await fresh(admin))), 'siteManager').toBe(true)
    expect(
      await can(del(manager, await fresh(admin, { riskClass: 'high_impact' }))),
      'siteManager, high-impact draft',
    ).toBe(true)

    const reg = () => fresh(admin, { ownerOffice: 'Registrar' })
    expect(await can(del(editorReg, await reg())), 'editor, own office').toBe(true)
    expect(await can(del(approverReg, await reg())), 'approver, own office').toBe(true)
    expect(await refusal(del(approverLib, await reg())), 'approver, other office').toBe(
      'OWNER_OUT_OF_SCOPE',
    )
    expect(
      await refusal(del(editorReg, await fresh(admin, { ownerOffice: 'Library' }))),
      'editor, other office',
    ).toBe('OWNER_OUT_OF_SCOPE')

    expect(
      await can(del(contributor, await fresh(contributor, { ownerOffice: null }))),
      'author',
    ).toBe(true)
    expect(
      await refusal(del(otherContributor, await fresh(contributor, { ownerOffice: null }))),
    ).toBe('NOT_YOUR_DRAFT')
    expect(await refusal(del(contributor, await reg())), 'contributor, someone else').toBe(
      'NOT_YOUR_DRAFT',
    )
    expect(await can(del(auditor, await reg())), 'auditor').toBe(false)
  })

  it('deleting anything that has left Draft stays with admins (3q)', async () => {
    const sendOn = async (status: 'in_review' | 'approved', gov = {}) => {
      const id = (await draft(admin, { ownerOffice: 'Registrar', ...gov })).id
      await payload.update({
        collection: 'pages',
        id,
        draft: true,
        data: { governance: { status } },
        ...as(manager),
      })
      return id
    }
    const del = (user: User, id: number) => () =>
      payload.delete({ collection: 'pages', id, ...as(user) })

    for (const status of ['in_review', 'approved'] as const) {
      const id = await sendOn(status)
      for (const [name, user] of [
        ['approver', approverReg],
        ['editor', editorReg],
        ['contributor', contributor],
      ] as const) {
        expect(await refusal(del(user, id)), `${name}, ${status}`).toBe('DELETE_FORBIDDEN')
      }
      // The auditor is turned away earlier, by the access rule, with Payload's own code.
      expect(await can(del(auditor, id)), `auditor, ${status}`).toBe(false)
      expect(await can(del(manager, id)), `siteManager, ${status}`).toBe(true)
    }
    const hi = await sendOn('in_review', { riskClass: 'high_impact' })
    expect(await refusal(del(manager, hi)), 'siteManager, high-impact, in review').toBe(
      'DELETE_FORBIDDEN',
    )
    expect(await can(del(admin, hi)), 'platformAdmin, high-impact, in review').toBe(true)
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
