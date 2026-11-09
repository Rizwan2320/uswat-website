// @vitest-environment node
/**
 * CMS-05: every write leaves an audit entry with who, when and what changed; the log is append-only.
 */
import { REST_PATCH } from '@payloadcms/next/routes'
import type { Payload, Where } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import config from '../../src/payload.config'
import type { User } from '../../src/payload-types'
import {
  PASSWORD,
  as,
  can,
  getTestPayload,
  makeUser,
  pageData,
  refusal,
  system,
  uniq,
} from '../helpers/governance'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

let payload: Payload
let admin: User, auditor: User, editor: User, approver: User

const entries = async (where: Where) =>
  (
    await payload.find({
      collection: 'audit-logs',
      where,
      sort: 'createdAt',
      limit: 50,
      overrideAccess: true,
      depth: 0,
    })
  ).docs
const forRecord = (collection: string, id: string | number) =>
  entries({ and: [{ collection: { equals: collection } }, { recordId: { equals: String(id) } }] })

describe('CMS-05 audit log', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[admin, auditor, editor, approver] = await Promise.all([
      makeUser(payload, 'platformAdmin'),
      makeUser(payload, 'auditor'),
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
    ])
  })

  it('records create, update, status transition, publish and delete with user, time and diff', async () => {
    const before = Date.now()
    const p = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData(),
      ...as(editor),
    })
    await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { governance: { status: 'in_review' } },
      ...as(editor),
    })
    await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { governance: { status: 'approved', verificationStatus: 'verified' } },
      ...as(approver),
    })
    await payload.update({
      collection: 'pages',
      id: p.id,
      data: { _status: 'published' },
      ...as(approver),
    })
    await payload.delete({ collection: 'pages', id: p.id, ...as(admin) })

    const log = await forRecord('pages', p.id)
    expect(log.map((e) => e.action)).toEqual(['create', 'update', 'update', 'update', 'delete'])

    const [created, submitted, approvedEntry, published, deleted] = log
    expect(created).toMatchObject({
      actorKind: 'user',
      actorId: String(editor.id),
      actorRole: 'editor',
    })
    expect(new Date(created!.createdAt).getTime()).toBeGreaterThanOrEqual(before - 1000)
    expect(JSON.stringify(created!.changes)).toContain(p.title)

    expect(submitted).toMatchObject({
      transitionFrom: 'draft',
      transitionTo: 'in_review',
      actorRole: 'editor',
    })
    expect(Object.keys(submitted!.changes as object)).toContain('governance.status')

    expect(approvedEntry).toMatchObject({
      transitionFrom: 'in_review',
      transitionTo: 'approved',
      actorId: String(approver.id),
      actorRole: 'approver',
    })
    expect(Object.keys(approvedEntry!.changes as object)).toEqual(
      expect.arrayContaining(['governance.status', 'governance.verificationStatus']),
    )

    expect(published).toMatchObject({
      transitionFrom: 'approved',
      transitionTo: 'published',
      actorRole: 'approver',
    })
    expect(deleted).toMatchObject({
      action: 'delete',
      actorId: String(admin.id),
      actorRole: 'platformAdmin',
    })
  })

  it('records logins', async () => {
    await payload.login({ collection: 'users', data: { email: editor.email, password: PASSWORD } })
    const logins = await entries({
      and: [{ action: { equals: 'login' } }, { recordId: { equals: String(editor.id) } }],
    })
    expect(logins.length).toBeGreaterThan(0)
    expect(logins[0]).toMatchObject({
      collection: 'users',
      actorId: String(editor.id),
      actorRole: 'editor',
    })
  })

  it('records changes made by the system, labelled as the system', async () => {
    const p = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({ origin: 'importer' }),
      ...system,
    })
    const [created] = await forRecord('pages', p.id)
    expect(created).toMatchObject({ actorKind: 'system', actorId: null, actorRole: null })
  })

  it('never stores passwords, hashes or tokens', async () => {
    const u = await makeUser(payload, 'editor')
    await payload.update({
      collection: 'users',
      id: u.id,
      data: { password: 'another-long-password-1' },
      overrideAccess: true,
    })
    const log = await forRecord('users', u.id)
    expect(log.length).toBeGreaterThanOrEqual(2)
    const dump = JSON.stringify(log)
    expect(dump).not.toContain(PASSWORD)
    expect(dump).not.toContain('another-long-password-1')
    expect(dump).not.toMatch(/"(hash|salt)":"[^"]{8,}/)
  })

  it('does not record autosaves', async () => {
    const p = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData(),
      ...as(editor),
    })
    const { token } = await payload.login({
      collection: 'users',
      data: { email: editor.email, password: PASSWORD },
    })
    const patch = (query: string) =>
      REST_PATCH(config)(
        new Request(`http://localhost:3000/api/pages/${p.id}${query}`, {
          method: 'PATCH',
          headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: uniq('typing') }),
        }),
        { params: Promise.resolve({ slug: ['pages', String(p.id)] }) },
      )
    const n = (await forRecord('pages', p.id)).length
    expect((await patch('?draft=true&autosave=true')).status).toBe(200)
    expect((await forRecord('pages', p.id)).length).toBe(n)
    expect((await patch('?draft=true')).status).toBe(200)
    expect((await forRecord('pages', p.id)).length).toBe(n + 1)
  })

  it('is append-only: no write through the API, and server code cannot edit or delete entries either', async () => {
    const [entry] = await entries({ action: { equals: 'create' } })
    expect(entry).toBeTruthy()
    for (const user of [admin, auditor, editor]) {
      expect(
        await can(() =>
          payload.create({
            collection: 'audit-logs',
            data: { action: 'create', collection: 'x', actorKind: 'user' },
            ...as(user),
          }),
        ),
      ).toBe(false)
      expect(
        await can(() =>
          payload.update({
            collection: 'audit-logs',
            id: entry!.id,
            data: { collection: 'tampered' },
            ...as(user),
          }),
        ),
      ).toBe(false)
      expect(
        await can(() => payload.delete({ collection: 'audit-logs', id: entry!.id, ...as(user) })),
      ).toBe(false)
    }
    expect(
      await refusal(() =>
        payload.update({
          collection: 'audit-logs',
          id: entry!.id,
          data: { collection: 'tampered' },
          overrideAccess: true,
        }),
      ),
    ).toBe('AUDIT_APPEND_ONLY')
    expect(
      await refusal(() =>
        payload.delete({ collection: 'audit-logs', id: entry!.id, overrideAccess: true }),
      ),
    ).toBe('AUDIT_APPEND_ONLY')
    expect(
      (await payload.findByID({ collection: 'audit-logs', id: entry!.id, overrideAccess: true }))
        .collection,
    ).not.toBe('tampered')
  })

  it('can be read by platform admin, site manager and auditor only', async () => {
    const manager = await makeUser(payload, 'siteManager')
    const contributor = await makeUser(payload, 'contributor')
    const read = (user: User | null) => () =>
      payload.find({
        collection: 'audit-logs',
        limit: 1,
        ...(user ? as(user) : { overrideAccess: false }),
      })
    expect(await can(read(admin))).toBe(true)
    expect(await can(read(manager))).toBe(true)
    expect(await can(read(auditor))).toBe(true)
    for (const u of [editor, approver, contributor, null]) expect(await can(read(u))).toBe(false)
  })

  it('an auditor can read every record and change none', async () => {
    const p = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({ ownerOffice: 'Library' }),
      ...as(admin),
    })
    expect(
      await can(() => payload.findByID({ collection: 'pages', id: p.id, ...as(auditor) })),
    ).toBe(true)
    expect(
      await can(() =>
        payload.update({
          collection: 'pages',
          id: p.id,
          draft: true,
          data: { title: uniq('x') },
          ...as(auditor),
        }),
      ),
    ).toBe(false)
  })
})
