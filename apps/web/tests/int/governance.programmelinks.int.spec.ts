// @vitest-environment node
/**
 * Slice 3y: a programme has an apply link, and its three link fields accept only safe addresses
 * (docs/briefs/p3y-programme-apply-link.md).
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, can, getTestPayload, makeUser, uniq } from '../helpers/governance'

let payload: Payload
let admin: User, editor: User

const gov = () => ({ ownerOffice: 'Registrar', source: 'https://example.test/source' })
type Prog = { id: number; applyUrl?: string | null; governance?: Record<string, unknown> }

const make = (extra: Record<string, unknown> = {}) =>
  payload.create({
    collection: 'programmes',
    draft: true,
    data: { name: uniq('programme'), governance: gov(), ...extra } as never,
    ...as(editor),
  }) as Promise<Prog>

/** Draft > in review (editor) > approved and verified (admin): the route the workflow requires. */
async function approve(id: number) {
  await payload.update({
    collection: 'programmes',
    id,
    draft: true,
    data: { governance: { status: 'in_review' } } as never,
    ...as(editor),
  })
  return payload.update({
    collection: 'programmes',
    id,
    draft: true,
    data: {
      governance: {
        status: 'approved',
        verificationStatus: 'verified',
        reviewDueAt: '2027-06-30T00:00:00.000Z',
      },
    } as never,
    ...as(admin),
  }) as Promise<Prog>
}

const publish = (id: number) =>
  payload.update({
    collection: 'programmes',
    id,
    data: { _status: 'published', governance: { status: 'published' } } as never,
    ...as(admin),
  })

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await makeUser(payload, 'platformAdmin')
  editor = await makeUser(payload, 'editor', ['registrar'])
})

describe('programme apply link', () => {
  it('stores and returns the apply link, and an empty one is fine', async () => {
    const p = await make({ applyUrl: 'https://example.test/apply/bs-cs' })
    const row = (await payload.findByID({
      collection: 'programmes',
      id: p.id,
      depth: 0,
      draft: true,
      ...as(admin),
    })) as Prog
    expect(row.applyUrl).toBe('https://example.test/apply/bs-cs')
    expect((await make()).applyUrl ?? null).toBeNull()
  })

  it('keeps the apply link in saved versions', async () => {
    const p = await make({ applyUrl: 'https://example.test/apply/v' })
    const v = await payload.findVersions({
      collection: 'programmes',
      where: { parent: { equals: p.id } },
      depth: 0,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    expect((v.docs[0] as unknown as { version: Prog }).version.applyUrl).toBe(
      'https://example.test/apply/v',
    )
  })

  it.each(['applyUrl', 'feeLink', 'curriculumUrl'])(
    'refuses an unsafe address in %s when published, and accepts safe ones',
    async (field) => {
      const bad = await make({ [field]: 'javascript:alert(1)' })
      await approve(bad.id)
      expect(await can(() => publish(bad.id))).toBe(false)

      for (const good of [
        'https://example.test/x',
        '/admissions',
        'mailto:admissions@example.test',
      ]) {
        const ok = await make({ [field]: good })
        await approve(ok.id)
        expect(await can(() => publish(ok.id)), good).toBe(true)
      }
      const empty = await make()
      await approve(empty.id)
      expect(await can(() => publish(empty.id))).toBe(true)
    },
  )

  it('counts a changed apply link as a content edit: approval is withdrawn; an unchanged one is not', async () => {
    const p = await make({ applyUrl: 'https://example.test/a' })
    expect((await approve(p.id)).governance).toMatchObject({ status: 'approved' })
    const edit = async (applyUrl: string) =>
      (await payload.update({
        collection: 'programmes',
        id: p.id,
        draft: true,
        data: { applyUrl } as never,
        ...as(editor),
      })) as Prog
    expect((await edit('https://example.test/a')).governance).toMatchObject({ status: 'approved' })
    expect((await edit('https://example.test/b')).governance).toMatchObject({
      status: 'draft',
      verificationStatus: 'unverified',
    })
  })
})
