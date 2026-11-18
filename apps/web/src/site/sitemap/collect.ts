import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

import { CONTENT_SOURCES, SITEMAP_REVALIDATE_SECONDS, listEntries, toEntries, type Entry, type Source } from './entries'

/** Published records of one collection. Anonymous read rules apply, so a draft is never returned. */
export async function publishedEntries({ collection, path }: Source): Promise<Entry[]> {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: collection as never,
    overrideAccess: false,
    draft: false,
    depth: 0,
    limit: 5000,
    pagination: false,
    select: { slug: true, updatedAt: true, governance: { source: true } } as never,
  })
  return toEntries(getServerSideURL(), path, res.docs as unknown as Record<string, unknown>[], new Date().toISOString())
}

async function contentUncached(): Promise<Entry[]> {
  const parts = await Promise.all(CONTENT_SOURCES.map(publishedEntries))
  return [...listEntries(getServerSideURL(), new Date().toISOString()), ...parts.flat()]
}

export const contentSitemap = unstable_cache(contentUncached, ['content-sitemap'], {
  revalidate: SITEMAP_REVALIDATE_SECONDS,
  tags: ['content-sitemap'],
})
