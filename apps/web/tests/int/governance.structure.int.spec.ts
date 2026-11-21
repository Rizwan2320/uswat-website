// @vitest-environment node
/**
 * Only a platform admin creates a department or a programme (owner decision, 2026-11-21).
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
import { as, can, getTestPayload, makeUser, system, uniq } from '../helpers/governance'

let payload: Payload
const users = {} as Record<Role, User>
const gov = () => ({ ownerOffice: 'Registrar', source: 'https://example.test/source' })

const create = (collection: 'departments' | 'programmes', user: User | null) =>
  payload.create({
    collection,
    draft: true,
    data: { name: uniq(collection), governance: gov() } as never,
    ...(user ? as(user) : system),
  }) as Promise<{ id: number }>

beforeAll(async () => {
  payload = await getTestPayload()
  for (const r of ROLES) users[r] = await makeUser(payload, r, ['Registrar'])
})

describe.each(['departments', 'programmes'] as const)('creating a record in %s', (collection) => {
  it.each(ROLES)('%s', async (role) => {
    const result = await can(() => create(collection, users[role]))
    expect(result).toBe(role === 'platformAdmin')
  })

  it('the system actor (importer, seeds) can still create, so the sample pack keeps loading', async () => {
    expect(await can(() => create(collection, null))).toBe(true)
  })

  it('an editor and an approver of the office can still edit and publish what an admin created', async () => {
    const row = await create(collection, users.platformAdmin)
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
