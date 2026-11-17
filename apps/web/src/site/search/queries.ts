import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { PER_PAGE, toHit, type Hit, type SearchParams } from './shape'

export type Found = { hits: Hit[]; total: number; totalPages: number; page: number }

/**
 * Searches the `search` collection, which holds only published records (drafts are not synced and
 * unpublishing removes the entry). No user is passed, so the collection's own read rule applies.
 * Matching is a case-insensitive "contains" on title, description and slug; the full-text index the plan
 * names needs a migration and is a P3 decision.
 */
export async function searchSite({ q, page }: SearchParams): Promise<Found> {
  if (!q) return { hits: [], total: 0, totalPages: 0, page }
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'search',
    overrideAccess: false,
    depth: 0,
    limit: PER_PAGE,
    page,
    sort: 'title',
    where: {
      or: [
        { title: { like: q } },
        { 'meta.title': { like: q } },
        { 'meta.description': { like: q } },
        { slug: { like: q } },
      ],
    },
  })
  const hits = (res.docs as unknown as Record<string, unknown>[]).flatMap((d) => toHit(d as never) ?? [])
  return { hits, total: res.totalDocs, totalPages: res.totalPages, page }
}
