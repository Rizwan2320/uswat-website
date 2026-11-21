// @vitest-environment node
/**
 * Slice 3af: a picture that a record still uses cannot be deleted (docs/briefs/p3af-media-delete-guard.md).
 * Real Postgres, access enforced the way the admin does it.
 */
import { randomBytes } from 'node:crypto'

import type { Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

let payload: Payload
let admin: User

async function picture(): Promise<number> {
  const data = await sharp(randomBytes(40 * 30 * 3), {
    raw: { width: 40, height: 30, channels: 3 },
  })
    .png()
    .toBuffer()
  const m = (await payload.create({
    collection: 'media',
    data: { alt: 'A test picture' } as never,
    file: { data, mimetype: 'image/png', name: `${uniq('img')}.png`, size: data.length },
    ...system,
  })) as { id: number }
  return m.id
}

const person = (photo: number) =>
  payload.create({
    collection: 'people',
    draft: true,
    data: {
      name: uniq('person'),
      photo,
      governance: { ownerOffice: 'Registrar', source: 'https://example.test/s' },
    } as never,
    ...system,
  }) as Promise<{ id: number }>

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await makeUser(payload, 'platformAdmin')
})

describe('deleting a picture', () => {
  it('is refused while a person still shows it, and the message counts them', async () => {
    const id = await picture()
    await person(id)
    let message = ''
    let status = 0
    let code = ''
    try {
      await payload.delete({ collection: 'media', id, ...as(admin) })
    } catch (e) {
      const err = e as { message: string; status?: number; data?: { code?: string } }
      message = err.message
      status = err.status ?? 0
      code = err.data?.code ?? ''
    }
    expect(code).toBe('IN_USE')
    expect(status).toBe(409)
    expect(message).toMatch(/1 Person/)
    // Still there.
    const still = await payload.findByID({ collection: 'media', id, overrideAccess: true })
    expect(still.id).toBe(id)
  })

  it('is refused for the system actor too', async () => {
    const id = await picture()
    await person(id)
    expect(await refusal(() => payload.delete({ collection: 'media', id, ...system }))).toBe(
      'IN_USE',
    )
  })

  it('works for a picture nothing uses (control)', async () => {
    const id = await picture()
    await payload.delete({ collection: 'media', id, ...as(admin) })
    await expect(
      payload.findByID({ collection: 'media', id, overrideAccess: true }),
    ).rejects.toBeTruthy()
  })

  it('works once the record no longer shows the picture', async () => {
    const id = await picture()
    const p = await person(id)
    expect(await refusal(() => payload.delete({ collection: 'media', id, ...system }))).toBe(
      'IN_USE',
    )
    await payload.update({
      collection: 'people',
      id: p.id,
      draft: true,
      data: { photo: null } as never,
      ...system,
    })
    await payload.delete({ collection: 'media', id, ...system })
    await expect(
      payload.findByID({ collection: 'media', id, overrideAccess: true }),
    ).rejects.toBeTruthy()
  })
})
