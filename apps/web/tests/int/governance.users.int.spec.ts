// @vitest-environment node
/** Accounts: the first user is the platform admin; roles and offices are admin-only; the last admin stays. */
import type { Payload, PayloadRequest } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { User } from '../../src/payload-types'
import { Users } from '../../src/collections/Users'
import { as, can, getTestPayload, makeUser, uniq } from '../helpers/governance'

let payload: Payload
let admin: User, manager: User, auditor: User, editor: User, other: User

const beforeChange = Users.hooks!.beforeChange![0]!
const beforeDelete = Users.hooks!.beforeDelete![0]!

/** A request whose database reports a given number of users or other admins. */
const fakeReq = (count: number, user?: Record<string, unknown>) =>
  ({
    user,
    payloadAPI: 'REST',
    payload: {
      count: vi.fn().mockResolvedValue({ totalDocs: count }),
      findByID: vi.fn().mockResolvedValue({ role: 'platformAdmin' }),
    },
  }) as unknown as PayloadRequest

describe('Users, roles and offices', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[admin, manager, auditor, editor, other] = await Promise.all([
      makeUser(payload, 'platformAdmin'),
      makeUser(payload, 'siteManager'),
      makeUser(payload, 'auditor'),
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'editor', ['Library']),
    ])
  })

  it('the very first account becomes platform admin, whatever role it asks for', async () => {
    const out = await beforeChange({
      data: { email: 'first@example.test', role: 'contributor' },
      operation: 'create',
      req: fakeReq(0),
      originalDoc: undefined,
      collection: Users as never,
      context: {},
    } as never)
    expect(out).toMatchObject({ role: 'platformAdmin' })
  })

  it('trusted server code keeps the role it asks for, even on an empty database', async () => {
    const out = await beforeChange({
      data: { email: 'svc@example.test', role: 'editor' },
      operation: 'create',
      req: { ...fakeReq(0), payloadAPI: 'local' } as PayloadRequest,
      originalDoc: undefined,
      collection: Users as never,
      context: {},
    } as never)
    expect(out).toMatchObject({ role: 'editor' })
  })

  it('later sign-ups by anyone but a platform admin are contributors with no offices', async () => {
    const out = await beforeChange({
      data: { email: 'late@example.test', role: 'platformAdmin', offices: ['registrar'] },
      operation: 'create',
      req: fakeReq(5, { id: 9, role: 'editor', offices: [] }),
      originalDoc: undefined,
      collection: Users as never,
      context: {},
    } as never)
    expect(out).toMatchObject({ role: 'contributor', offices: [] })
  })

  it('the last platform admin cannot be demoted or deleted', async () => {
    await expect(
      beforeChange({
        data: { role: 'editor' },
        originalDoc: { id: 1, role: 'platformAdmin' },
        operation: 'update',
        req: fakeReq(0, { id: 1, role: 'platformAdmin', offices: [] }),
        collection: Users as never,
        context: {},
      } as never),
    ).rejects.toMatchObject({ data: { code: 'LAST_ADMIN' } })
    await expect(
      beforeDelete({ id: 1, req: fakeReq(0), collection: Users as never, context: {} } as never),
    ).rejects.toMatchObject({
      data: { code: 'LAST_ADMIN' },
    })
    // With another admin around, both are fine.
    await expect(
      beforeDelete({ id: 1, req: fakeReq(1), collection: Users as never, context: {} } as never),
    ).resolves.not.toThrow()
  })

  it('a person cannot change their own role or offices, but can change their name', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: editor.id,
      data: { name: uniq('renamed'), role: 'platformAdmin', offices: ['library', 'finance'] },
      ...as(editor),
    })
    expect(updated.role).toBe('editor')
    expect(updated.offices).toEqual(['registrar'])
    expect(updated.name).toMatch(/^renamed/)
  })

  it('a platform admin can change roles and offices; offices are stored normalised', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: other.id,
      data: { role: 'approver', offices: ['  Library ', 'LIBRARY', 'Finance Office'] },
      ...as(admin),
    })
    expect(updated.role).toBe('approver')
    expect(updated.offices).toEqual(['library', 'finance office'])
  })

  it('only a platform admin can create or delete accounts', async () => {
    const data = () => ({
      email: `${uniq('new')}@example.test`,
      password: 'a-long-enough-password',
    })
    expect(
      await can(() => payload.create({ collection: 'users', data: data(), ...as(admin) })),
    ).toBe(true)
    for (const u of [manager, editor, auditor]) {
      expect(await can(() => payload.create({ collection: 'users', data: data(), ...as(u) }))).toBe(
        false,
      )
    }
    const victim = await makeUser(payload, 'contributor')
    expect(
      await can(() => payload.delete({ collection: 'users', id: victim.id, ...as(manager) })),
    ).toBe(false)
    expect(
      await can(() => payload.delete({ collection: 'users', id: victim.id, ...as(admin) })),
    ).toBe(true)
  })

  it('the staff directory is not open to everyone', async () => {
    const read = (u: User, id: number) => () =>
      payload.findByID({ collection: 'users', id, ...as(u) })
    expect(await can(read(editor, editor.id))).toBe(true)
    expect(await can(read(editor, other.id))).toBe(false)
    for (const u of [admin, manager, auditor]) expect(await can(read(u, other.id))).toBe(true)
  })
})
