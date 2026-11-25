// @vitest-environment node
/**
 * A department owns itself (slice 3aq): when its owner office is empty or the admin's placeholder
 * ("IT Directorate"), its English name becomes the owner office. A real office is never touched.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, system, uniq } from '../helpers/governance'

let payload: Payload
let admin: User
// Owner offices are stored in lower case (governance layer), so everything is compared in lower case.
const office = (d: unknown) =>
  (d as { governance?: { ownerOffice?: string } }).governance?.ownerOffice
const low = (s: string) => s.toLowerCase()

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await makeUser(payload, 'platformAdmin', [])
})

describe('a department owns itself by default', () => {
  it('an admin-made department with a name and no typed office gets its own name as the office', async () => {
    const name = uniq('Department of Physics')
    const d = await payload.create({
      collection: 'departments',
      draft: true,
      data: { name } as never,
      ...as(admin),
    })
    expect(office(d)).toBe(low(name))
  })

  it('the empty first draft (no name yet) keeps the placeholder, then takes the name on the next save', async () => {
    const first = (await payload.create({
      collection: 'departments',
      draft: true,
      data: {} as never,
      ...as(admin),
    })) as { id: number }
    expect(office(first)).toBe('it directorate')
    const name = uniq('Department of Chemistry')
    const second = await payload.update({
      collection: 'departments',
      id: first.id,
      draft: true,
      data: { name } as never,
      ...as(admin),
    })
    expect(office(second)).toBe(low(name))
  })

  it('a real office typed on the department is never changed', async () => {
    const d = await payload.create({
      collection: 'departments',
      draft: true,
      data: { name: uniq('Department of Biology'), governance: { ownerOffice: 'Biology Office' } } as never,
      ...as(admin),
    })
    expect(office(d)).toBe('biology office')
  })

  it('a later rename keeps the office, so accounts that matched it keep matching', async () => {
    const name = uniq('Department of Maths')
    const d = (await payload.create({
      collection: 'departments',
      draft: true,
      data: { name } as never,
      ...as(admin),
    })) as { id: number }
    const renamed = await payload.update({
      collection: 'departments',
      id: d.id,
      draft: true,
      data: { name: uniq('Department of Mathematics') } as never,
      ...as(admin),
    })
    expect(office(renamed)).toBe(low(name))
  })

  it('a save in Urdu does not set the office from the Urdu name', async () => {
    const d = (await payload.create({
      collection: 'departments',
      draft: true,
      data: {} as never,
      ...as(admin),
    })) as { id: number }
    const ur = await payload.update({
      collection: 'departments',
      id: d.id,
      locale: 'ur',
      draft: true,
      data: { name: 'شعبہ طبیعیات' } as never,
      ...as(admin),
    })
    expect(office(ur)).toBe('it directorate')
  })

  it('the system actor (importer, seeds) is treated the same', async () => {
    const name = uniq('Department of Zoology')
    const d = await payload.create({
      collection: 'departments',
      draft: true,
      data: { name } as never,
      ...system,
    })
    expect(office(d)).toBe(low(name))
  })
})
