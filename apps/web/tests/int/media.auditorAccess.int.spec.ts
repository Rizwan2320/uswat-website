// @vitest-environment node
/**
 * Slice 3an: the auditor only reads. Media's own config says "any signed-in person", but the
 * governance plugin replaces that with the role table in staffAccess.ts. This pins the result the
 * admin screens depend on (no upload form, "Not allowed" instead), so a change to either side shows up.
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
import { as, can, getTestPayload, makeUser, uniq } from '../helpers/governance'

let payload: Payload
let auditor: User, editor: User

async function png() {
  const data = await sharp(randomBytes(40 * 30 * 3), { raw: { width: 40, height: 30, channels: 3 } })
    .png()
    .toBuffer()
  return { data, mimetype: 'image/png', name: `${uniq('img')}.png`, size: data.length }
}

beforeAll(async () => {
  payload = await getTestPayload()
  auditor = await makeUser(payload, 'auditor', [])
  editor = await makeUser(payload, 'editor', ['dcst'])
})

describe('media access for the auditor (3an)', () => {
  it('the auditor cannot upload, edit or delete media; an editor can upload', async () => {
    const upload = async (who: User) =>
      payload.create({
        collection: 'media',
        data: { alt: 'a test picture' } as never,
        file: await png(),
        ...as(who),
      })
    expect(await can(() => upload(auditor))).toBe(false)
    const made = await upload(editor)
    expect(made.id).toBeTruthy()
    expect(
      await can(() =>
        payload.update({ collection: 'media', id: made.id, data: { alt: 'x' } as never, ...as(auditor) }),
      ),
    ).toBe(false)
    expect(
      await can(() => payload.delete({ collection: 'media', id: made.id, ...as(auditor) })),
    ).toBe(false)
  })

  it('the auditor can still read media', async () => {
    const found = await payload.find({ collection: 'media', limit: 1, ...as(auditor) })
    expect(Array.isArray(found.docs)).toBe(true)
  })

  it('the real config says the auditor may not create, and an editor may', async () => {
    const mediaConfig = payload.collections.media.config
    const access = mediaConfig.access.create as (a: { req: unknown }) => boolean | Promise<boolean>
    const fake = (user: User) => ({ req: { user: { ...user, collection: 'users' } } })
    expect(await access(fake(auditor))).toBe(false)
    expect(await access(fake(editor))).toBe(true)
  })
})
