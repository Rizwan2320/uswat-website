import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'

import { currentWhere } from '@/governance/lifecycle'
import { previewReadOptions } from '@/governance/preview'

import { LISTING_REVALIDATE_SECONDS, PER_PAGE, PREBUILD_COUNT, TYPES, type ArticleType } from './config'
import type { ListingParams } from './params'
import { listingWhere, s, selectFor, sortFor, toItem, type Doc, type ListItem, type Listing } from './where'

export type { ListItem, Listing } from './where'

/**
 * Public reads for the five article types. Every read is made without a user, so the collections' own
 * rules apply (published records only). Listings are cached for LISTING_REVALIDATE_SECONDS under the tag
 * `list:{type}`; the post types have no revalidation hooks yet, so that time is the bound on staleness.
 */

async function payloadInstance(): Promise<Payload> {
  return getPayload({ config: configPromise })
}

async function listUncached(type: ArticleType, p: ListingParams): Promise<Listing> {
  const cfg = TYPES[type]
  const now = new Date()
  const payload = await payloadInstance()
  const res = await payload.find({
    collection: cfg.collection,
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: PER_PAGE,
    page: p.page,
    sort: sortFor(cfg, p.view),
    where: listingWhere(cfg, p, now),
    select: selectFor(cfg),
  })
  return {
    items: (res.docs as unknown as Doc[]).map((d) => toItem(cfg, d, now)),
    page: res.page ?? p.page,
    totalPages: res.totalPages ?? 1,
    totalDocs: res.totalDocs ?? 0,
  }
}

export const listArticles = (type: ArticleType, p: ListingParams): Promise<Listing> =>
  unstable_cache(listUncached, ['articles', 'list', type, p.view, String(p.year ?? ''), String(p.page)], {
    revalidate: LISTING_REVALIDATE_SECONDS,
    tags: [`list:${type}`],
  })(type, p)

/** First and last year with a published record, for the year filter. */
async function yearsUncached(type: ArticleType): Promise<{ first: number; last: number } | null> {
  const cfg = TYPES[type]
  const payload = await payloadInstance()
  const read = (sort: string) =>
    payload.find({
      collection: cfg.collection,
      draft: false,
      overrideAccess: false,
      depth: 0,
      limit: 1,
      pagination: false,
      sort,
      where: { publishedAt: { exists: true } },
      select: { publishedAt: true } as never,
    })
  const [a, b] = await Promise.all([read('publishedAt'), read('-publishedAt')])
  const first = s((a.docs[0] as Doc | undefined)?.publishedAt)
  const last = s((b.docs[0] as Doc | undefined)?.publishedAt)
  return first && last ? { first: new Date(first).getUTCFullYear(), last: new Date(last).getUTCFullYear() } : null
}

export const yearRange = (type: ArticleType) =>
  unstable_cache(yearsUncached, ['articles', 'years', type], {
    revalidate: LISTING_REVALIDATE_SECONDS,
    tags: [`list:${type}`],
  })(type)

/** The article for this address. Draft mode is only a cookie: who may see a draft comes from the login on this request. */
export async function getArticle(
  type: ArticleType,
  slug: string,
  args: { draftModeOn: boolean; headers: Headers },
): Promise<Doc | null> {
  const cfg = TYPES[type]
  const payload = await payloadInstance()
  const where = { slug: { equals: slug } }
  const read = await previewReadOptions(payload, args.draftModeOn, args.headers)
  if (read.draft) {
    const draft = await payload.find({ collection: cfg.collection, limit: 1, pagination: false, where, depth: 1, ...read })
    if (draft.docs[0]) return draft.docs[0] as unknown as Doc
  }
  const live = await payload.find({
    collection: cfg.collection,
    draft: false,
    limit: 1,
    pagination: false,
    overrideAccess: false,
    where,
    depth: 1,
  })
  return (live.docs[0] as unknown as Doc | undefined) ?? null
}

async function othersUncached(type: ArticleType, excludeId: number | string): Promise<ListItem[]> {
  const cfg = TYPES[type]
  const now = new Date()
  const payload = await payloadInstance()
  const res = await payload.find({
    collection: cfg.collection,
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 3,
    pagination: false,
    sort: sortFor(cfg, 'current'),
    where: { and: [currentWhere(now, cfg.current), { id: { not_equals: excludeId } }] },
    select: selectFor(cfg),
  })
  return (res.docs as unknown as Doc[]).map((d) => toItem(cfg, d, now))
}

/** "More from this section": the newest other current records of the same type (not tag-based). */
export const otherArticles = (type: ArticleType, excludeId: number | string) =>
  unstable_cache(othersUncached, ['articles', 'others', type, String(excludeId)], {
    revalidate: LISTING_REVALIDATE_SECONDS,
    tags: [`list:${type}`],
  })(type, excludeId)

/** Slugs to prebuild: the newest PREBUILD_COUNT. Empty if the database cannot be reached at build time. */
export async function newestSlugs(type: ArticleType): Promise<{ slug: string }[]> {
  try {
    const cfg = TYPES[type]
    const payload = await payloadInstance()
    const res = await payload.find({
      collection: cfg.collection,
      draft: false,
      overrideAccess: false,
      depth: 0,
      limit: PREBUILD_COUNT,
      pagination: false,
      sort: ['-publishedAt', '-id'],
      select: { slug: true } as never,
    })
    return (res.docs as unknown as Doc[]).flatMap((d) => (s(d.slug) ? [{ slug: s(d.slug)! }] : []))
  } catch {
    return []
  }
}
