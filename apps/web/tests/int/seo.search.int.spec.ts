// @vitest-environment node
/**
 * Slice 3h: search, redirects and SEO fields on the public content types (FR-09, CMS-07, MIG-02).
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { runLifecycleSweep } from '../../src/governance/sweep'
import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

let payload: Payload
let editor: User, approver: User, manager: User

const gov = (extra: Record<string, unknown> = {}) => ({
  ownerOffice: 'Registrar',
  source: 'https://example.test/source',
  ...extra,
})
const notice = (
  title: string,
  g: Record<string, unknown> = {},
  extra: Record<string, unknown> = {},
) =>
  payload.create({
    collection: 'notices',
    draft: true,
    data: { title, excerpt: 'Sample', ...extra, governance: gov(g) } as never,
    ...as(editor),
  }) as Promise<{ id: number }>
const step = (id: number, user: User, governance: Record<string, unknown>) =>
  payload.update({
    collection: 'notices',
    id,
    draft: true,
    data: { governance } as never,
    ...as(user),
  })
const approve = async (id: number) => {
  await step(id, editor, { status: 'in_review' })
  await step(id, approver, { status: 'approved', verificationStatus: 'verified' })
}
const publish = (id: number) =>
  payload.update({
    collection: 'notices',
    id,
    data: { _status: 'published', governance: {} } as never,
    ...as(approver),
  })
const inSearch = async (id: number) =>
  (
    await payload.find({
      collection: 'search',
      where: {
        and: [{ 'doc.relationTo': { equals: 'notices' } }, { 'doc.value': { equals: id } }],
      },
      overrideAccess: true,
      depth: 0,
    })
  ).totalDocs

describe('search coverage', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, approver, manager] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
      makeUser(payload, 'siteManager'),
    ])
  })

  it('indexes a published notice with its SEO title, not a draft, and drops it when unpublished', async () => {
    const n = await notice(uniq('findme'), {}, { meta: { title: 'Fee schedule 2027' } })
    expect(await inSearch(n.id)).toBe(0)
    await approve(n.id)
    expect(await inSearch(n.id)).toBe(0)
    await publish(n.id)
    expect(await inSearch(n.id)).toBe(1)
    const hit = (
      await payload.find({
        collection: 'search',
        where: { 'doc.value': { equals: n.id } },
        overrideAccess: true,
        depth: 0,
      })
    ).docs[0] as { meta?: { title?: string } }
    expect(hit.meta?.title).toBe('Fee schedule 2027')
    await payload.update({
      collection: 'notices',
      id: n.id,
      data: { _status: 'draft' } as never,
      ...as(approver),
    })
    expect(await inSearch(n.id)).toBe(0)
  })

  it('removes an archived notice from search when the sweep archives it', async () => {
    const n = await notice(uniq('expiring'), { expireAt: '2026-12-01T00:00:00.000Z' })
    await approve(n.id)
    await publish(n.id)
    expect(await inSearch(n.id)).toBe(1)
    await runLifecycleSweep(payload, {
      now: new Date('2027-01-01T00:00:00.000Z'),
      collections: ['notices'],
      context: system.context,
    } as never)
    const row = await payload.findByID({
      collection: 'notices',
      id: n.id,
      overrideAccess: true,
      depth: 0,
    })
    expect((row as { governance?: { status?: string } }).governance?.status).toBe('archived')
    expect(await inSearch(n.id)).toBe(0)
  })
})

describe('redirects to the new content types', () => {
  it('a site manager can point an old address at a notice; an editor cannot', async () => {
    const n = await notice(uniq('target'))
    const make = (user: User, from: string) =>
      payload.create({
        collection: 'redirects',
        data: {
          from,
          to: { type: 'reference', reference: { relationTo: 'notices', value: n.id } },
        } as never,
        ...as(user),
      })
    const made = await make(manager, `/old/${uniq('page')}`)
    expect(made.id).toBeDefined()
    expect(await refusal(() => make(editor, `/old/${uniq('page')}`))).not.toBeNull()
  })
})

describe('SEO image', () => {
  it('an image in the SEO group is held to the same alt and rights rules at publish', async () => {
    const { default: sharp } = await import('sharp')
    const { randomBytes } = await import('node:crypto')
    const data = await sharp(randomBytes(16 * 16 * 3), {
      raw: { width: 16, height: 16, channels: 3 },
    })
      .png()
      .toBuffer()
    const img = await payload.create({
      collection: 'media',
      data: {} as never,
      file: { data, mimetype: 'image/png', name: `${uniq('og')}.png`, size: data.length },
      ...system,
    })
    const n = await notice(uniq('share'), {}, { meta: { image: img.id } })
    await approve(n.id)
    expect(await refusal(() => publish(n.id))).toBe('MEDIA_ALT_MISSING')
    await payload.update({
      collection: 'media',
      id: img.id,
      data: { alt: 'Gate', rightsStatus: 'owned' } as never,
      ...as(approver),
    })
    expect(await refusal(() => publish(n.id))).toBeNull()
  })
})
