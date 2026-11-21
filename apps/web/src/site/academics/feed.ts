import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'

import { currentWhere } from '@/governance/lifecycle'

import { LISTING_REVALIDATE_SECONDS, TYPES, type ArticleType } from '../articles/config'
import { selectFor, sortFor, toItem, type Doc, type ListItem } from '../articles/where'

/**
 * What a department shows under "News, events and notices": the current published records whose tags include a tag
 * with the same slug as the department (for DCST the tag `dcst`). No schema change; an editor tags an item in the CMS.
 * Reads are made without a user, so only published records come back. Any failure gives empty lists.
 */
export const FEED_TYPES = ['news', 'events', 'notices'] as const satisfies readonly ArticleType[]
export const FEED_ITEMS = 3

export type DepartmentFeed = Record<(typeof FEED_TYPES)[number], ListItem[]>
export const emptyFeed = (): DepartmentFeed => ({ news: [], events: [], notices: [] })

/** The read itself, given a Payload instance (the integration test calls this one). */
export async function readFeed(payload: Payload, tagSlug: string): Promise<DepartmentFeed> {
  const out = emptyFeed()
  try {
    const tag = await payload.find({
      collection: 'article-tags',
      draft: false,
      overrideAccess: false,
      depth: 0,
      limit: 1,
      pagination: false,
      where: { slug: { equals: tagSlug } },
    })
    const tagId = tag.docs[0]?.id
    if (tagId === undefined) return out
    const now = new Date()
    await Promise.all(
      FEED_TYPES.map(async (type) => {
        const cfg = TYPES[type]
        const res = await payload.find({
          collection: cfg.collection,
          draft: false,
          overrideAccess: false,
          depth: 0,
          limit: FEED_ITEMS,
          pagination: false,
          sort: sortFor(cfg, 'current'),
          where: { and: [currentWhere(now, cfg.current), { tags: { in: [tagId] } }] },
          select: selectFor(cfg),
        })
        out[type] = (res.docs as unknown as Doc[]).map((d) => toItem(cfg, d, now))
      }),
    )
  } catch {
    return emptyFeed()
  }
  return out
}

const feedUncached = async (tagSlug: string) => readFeed(await getPayload({ config: configPromise }), tagSlug)

export const departmentFeed = (tagSlug: string): Promise<DepartmentFeed> =>
  tagSlug
    ? unstable_cache(feedUncached, ['academics', 'feed', tagSlug], {
        revalidate: LISTING_REVALIDATE_SECONDS,
        tags: FEED_TYPES.map((t) => `list:${t}`),
      })(tagSlug)
    : Promise.resolve(emptyFeed())
