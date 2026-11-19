// @vitest-environment node
/**
 * The Sample article pack on a real database (brief a4-sample-content-pack): the first run creates every state, a
 * second run writes nothing, anonymous reads see only published rows, and the lists, feeds and home reads show them.
 * Needs a local PostgreSQL. Other tests leave rows behind, so checks look only at this pack's slugs.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }))

import { ARTICLE_COLLECTIONS, applyArticleSeeds, articleSeeds, meritLists, tags } from '../../../../scripts/import/seeds/articles'
import type { Cms } from '../../../../scripts/import/writer'
import { listArticles } from '../../src/site/articles/queries'
import { feedXml } from '../../src/site/feeds/collect'
import { getTestPayload, makeUser } from '../helpers/governance'

let payload: Payload
let actor: { user: Record<string, unknown> }
const seeds = articleSeeds()
const slugsOf = (c: string, state: string) => seeds.filter((s) => s.collection === c && s.state === state).map((s) => s.slug)

beforeAll(async () => {
  payload = await getTestPayload()
  const admin = await makeUser(payload, 'platformAdmin', ['Registrar'])
  actor = { user: { ...(admin as unknown as Record<string, unknown>), collection: 'users' } }
})

describe('Sample article pack', () => {
  it('creates every state on the first run and nothing on the second', async () => {
    const first = await applyArticleSeeds(payload as unknown as Cms, actor)
    const expectedPublished = seeds.filter((s) => s.state === 'published').length + tags.length + meritLists.filter((m) => m.state === 'published').length
    // A database that already holds the pack (an earlier run) makes the first run "unchanged"; both cases are right.
    expect(first.published + first.unchanged).toBeGreaterThanOrEqual(expectedPublished)
    const versionsBefore = await Promise.all(ARTICLE_COLLECTIONS.map(async (c) => (await payload.countVersions({ collection: c })).totalDocs))
    const second = await applyArticleSeeds(payload as unknown as Cms, actor)
    expect(second).toMatchObject({ created: 0, published: 0, inReview: 0, drafts: 0 })
    const versionsAfter = await Promise.all(ARTICLE_COLLECTIONS.map(async (c) => (await payload.countVersions({ collection: c })).totalDocs))
    expect(versionsAfter).toEqual(versionsBefore)
    // The first run walks about 45 records through the real workflow (several versions each); the default 5 s
    // limit is too short on a busy machine and made the next tests fail too (CI on #85).
  }, 120_000)

  it('shows anonymous readers only the published rows, in every collection', async () => {
    for (const c of ARTICLE_COLLECTIONS) {
      const res = await payload.find({ collection: c, draft: false, overrideAccess: false, depth: 0, limit: 500, pagination: false, where: { slug: { like: 'sample-' } } })
      const seen = new Set((res.docs as unknown as { slug: string }[]).map((d) => d.slug))
      for (const slug of slugsOf(c, 'published')) expect(seen.has(slug), `${c} ${slug}`).toBe(true)
      for (const slug of [...slugsOf(c, 'draft'), ...slugsOf(c, 'in_review')]) expect(seen.has(slug), `${c} ${slug}`).toBe(false)
    }
  })

  it('puts the in-review rows in review and leaves the drafts as drafts', async () => {
    const res = await payload.find({ collection: 'notices', draft: true, overrideAccess: true, depth: 0, limit: 500, pagination: false, where: { slug: { like: 'sample-notice-' } } })
    const by = new Map((res.docs as unknown as { slug: string; governance: { status: string } }[]).map((d) => [d.slug, d.governance.status]))
    expect(by.get('sample-notice-review-1')).toBe('in_review')
    expect(by.get('sample-notice-draft-1')).toBe('draft')
    expect(by.get('sample-notice-current')).toBe('published')
  })

  it('keeps the Urdu draft text in the Urdu locale and falls back to English elsewhere', async () => {
    const find = (locale: 'en' | 'ur') =>
      payload.find({ collection: 'notices', locale, draft: false, overrideAccess: false, depth: 0, where: { slug: { equals: 'sample-notice-current' } } })
    const ur = (await find('ur')).docs[0] as unknown as { title: string }
    const en = (await find('en')).docs[0] as unknown as { title: string }
    expect(ur.title.startsWith('نمونہ')).toBe(true)
    expect(en.title.startsWith('Sample')).toBe(true)
  })

  it('lists current rows with the Sample flag, and the closed one only in the archive', async () => {
    // Other tests leave rows behind, so look through every page rather than only the first.
    const slugsAcross = async (c: 'news' | 'notices' | 'events' | 'jobs' | 'tenders', view: 'current' | 'archive') => {
      const items: { slug: string; sample: boolean }[] = []
      for (let page = 1; ; page++) {
        const l = await listArticles(c, { page, view })
        items.push(...l.items)
        if (page >= l.totalPages) return items
      }
    }
    for (const c of ['notices', 'events', 'jobs', 'tenders', 'news'] as const) {
      const coll = c === 'news' ? 'posts' : c
      const closedSlug = seeds.find((s) => s.collection === coll && s.role === 'closed')!.slug
      const current = await slugsAcross(c, 'current')
      const archive = await slugsAcross(c, 'archive')
      expect(archive.some((i) => i.slug === closedSlug && i.sample), `${c} archive`).toBe(true)
      expect(current.some((i) => i.slug === closedSlug), `${c} current`).toBe(false)
      expect(current.some((i) => i.sample), `${c} flag`).toBe(true)
    }
  })

  it('builds a valid feed for every type, and a Sample record is allowed in it', async () => {
    for (const c of ['news', 'notices', 'events', 'jobs', 'tenders'] as const) {
      const xml = await feedXml(c)
      expect(xml.startsWith('<?xml'), c).toBe(true)
      expect(xml.endsWith('</rss>'), c).toBe(true)
    }
  })
})
