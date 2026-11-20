// @vitest-environment node
/**
 * Sample media and pages on a real database (brief p4-sample-media-pages). Needs a local PostgreSQL.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }))

import { applyMediaSeeds } from '../../../../scripts/import/seeds/media'
import { applyPageSeeds, pages } from '../../../../scripts/import/seeds/pages'
import { placeholderImages } from '../../../../scripts/import/seeds/placeholders'
import type { Cms } from '../../../../scripts/import/writer'
import { renderPng } from '../../scripts/renderPng'
import { getTestPayload, makeUser } from '../helpers/governance'

let payload: Payload
let cms: Cms
let actor: { user: Record<string, unknown> }

beforeAll(async () => {
  payload = await getTestPayload()
  cms = payload as unknown as Cms
  actor = { user: { ...(await makeUser(payload, 'platformAdmin', ['Registrar'])), collection: 'users' } }
}, 60_000)

describe('Sample media', () => {
  it('stores the placeholder images once, owned, with English and Urdu alt text, and creates nothing the second time', async () => {
    const first = await applyMediaSeeds(cms, actor, renderPng)
    expect(first.created + first.unchanged).toBe(placeholderImages.length)
    const second = await applyMediaSeeds(cms, actor, renderPng)
    expect(second.created).toBe(0)
    expect(second.unchanged).toBe(placeholderImages.length)
    const res = await payload.find({ collection: 'media', depth: 0, limit: 50, overrideAccess: true, where: { sourceUrl: { like: 'https://sample.invalid/seed/media/' } } })
    expect(res.totalDocs).toBe(placeholderImages.length)
    for (const m of res.docs as unknown as { alt: string; rightsStatus: string; mimeType: string; width: number; credit: string }[]) {
      expect(m.rightsStatus).toBe('owned')
      expect(m.mimeType).toBe('image/png')
      expect(m.width).toBe(1200)
      expect(m.alt).toMatch(/[؀-ۿ]/)
      expect(m.credit).toContain('Sample')
    }
  }, 120_000)
})

describe('Sample pages', () => {
  it('publishes the four pages, readable anonymously at their slugs, and creates nothing the second time', async () => {
    await applyPageSeeds(cms, actor)
    const second = await applyPageSeeds(cms, actor)
    expect(second).toMatchObject({ created: 0, published: 0, inReview: 0, drafts: 0, unchanged: pages.length })
    for (const p of pages) {
      const res = await payload.find({ collection: 'pages', draft: false, overrideAccess: false, depth: 0, limit: 1, where: { slug: { equals: p.slug } } })
      expect((res.docs[0] as unknown as { title: string } | undefined)?.title, p.slug).toBe(p.title)
    }
  }, 120_000)
})
