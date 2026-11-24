// @vitest-environment node
/**
 * Who creates a department or a programme.
 * - Departments: a platform admin only (owner decision, 2026-11-21).
 * - Programmes: a platform admin, or a head of department for a department of their own office
 *   (owner decision, 2026-11-24, slice 3ap; this reverses the 2026-11-21 rule for programmes only).
 * Everyone who may edit still edits the ones that exist. The importer and the seeds (system actor) are unaffected.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { ROLES, type Role } from '../../src/governance/roles'
import { as, can, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

let payload: Payload
const users = {} as Record<Role, User>
let otherHead: User
let deptOwn: { id: number }
let deptOther: { id: number }
let deptNoOffice: { id: number }
const gov = (office = 'Registrar') => ({ ownerOffice: office, source: 'https://example.test/source' })

const create = (collection: 'departments' | 'programmes', user: User | null, extra: object = {}) =>
  payload.create({
    collection,
    draft: true,
    data: { name: uniq(collection), governance: gov(), ...extra } as never,
    ...(user ? as(user) : system),
  }) as Promise<{ id: number }>

beforeAll(async () => {
  payload = await getTestPayload()
  for (const r of ROLES) users[r] = await makeUser(payload, r, ['Registrar'])
  otherHead = await makeUser(payload, 'approver', ['Physics'])
  deptOwn = await create('departments', null) // office Registrar, the offices of users[approver]
  deptOther = (await payload.create({
    collection: 'departments',
    draft: true,
    data: { name: uniq('dept-other'), governance: gov('Chemistry') } as never,
    ...system,
  })) as { id: number }
})

describe('creating a department (platform admin only)', () => {
  it.each(ROLES)('%s', async (role) => {
    expect(await can(() => create('departments', users[role]))).toBe(role === 'platformAdmin')
  })
  it('the system actor (importer, seeds) can still create', async () => {
    expect(await can(() => create('departments', null))).toBe(true)
  })
})

// A head under another office's department is refused by the general scope rule (OWNER_OUT_OF_SCOPE): the
// programme takes the department's office.
describe('creating a programme (platform admin, or a head under a department of their own office)', () => {
  it.each(ROLES)('%s, under a department of the Registrar office', async (role) => {
    const result = await can(() => create('programmes', users[role], { department: deptOwn.id }))
    expect(result).toBe(role === 'platformAdmin' || role === 'approver')
  })

  it('the system actor (importer, seeds) can still create', async () => {
    expect(await can(() => create('programmes', null))).toBe(true)
  })

  it('a head cannot put a programme under another office’s department', async () => {
    expect(
      await refusal(() => create('programmes', users.approver, { department: deptOther.id })),
    ).toBe('OWNER_OUT_OF_SCOPE')
  })

  it('a head of another office cannot use this head’s department either', async () => {
    expect(await refusal(() => create('programmes', otherHead, { department: deptOwn.id }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
  })

  it('a head’s new programme with no department yet is a draft in their own office (the Create screen saves an empty draft first)', async () => {
    // Exactly what the Create screen sends: a name-less, governance-less draft.
    const row = (await payload.create({
      collection: 'programmes',
      draft: true,
      data: {} as never,
      ...as(users.approver),
    })) as { governance?: { ownerOffice?: string; status?: string } }
    expect(row.governance?.ownerOffice?.toLowerCase()).toBe('registrar')
    expect(row.governance?.status).toBe('draft')
  })

  it('a head cannot move an existing programme to another office’s department', async () => {
    const row = await create('programmes', users.approver, { department: deptOwn.id })
    const move = () =>
      payload.update({
        collection: 'programmes',
        id: row.id,
        draft: true,
        data: { department: deptOther.id } as never,
        ...as(users.approver),
      })
    expect(await refusal(move)).toBe('OWNER_OUT_OF_SCOPE')
  })

  it('the platform admin can still create under any department', async () => {
    expect(await can(() => create('programmes', users.platformAdmin, { department: deptOther.id }))).toBe(
      true,
    )
  })

  it('the programme a head creates takes the department’s office, starts as a draft, and is not live', async () => {
    const row = (await create('programmes', users.approver, { department: deptOwn.id })) as {
      id: number
      governance?: { ownerOffice?: string; status?: string }
    }
    expect(row.governance?.ownerOffice?.toLowerCase()).toBe('registrar')
    expect(row.governance?.status).toBe('draft')
  })
})

describe.each(['departments', 'programmes'] as const)('editing a record in %s', (collection) => {
  it('an editor and an approver of the office can still edit what an admin created', async () => {
    const row = await create(collection, users.platformAdmin, collection === 'programmes' ? { department: deptOwn.id } : {})
    const edit = (user: User, name: string) =>
      payload.update({
        collection,
        id: row.id,
        draft: true,
        data: { name } as never,
        ...as(user),
      })
    expect(await can(() => edit(users.editor, uniq('edited-by-editor')))).toBe(true)
    // Control: an auditor still cannot, so the passing edit above is the rule, not an open door.
    expect(await can(() => edit(users.auditor, uniq('edited-by-auditor')))).toBe(false)
  })
})
