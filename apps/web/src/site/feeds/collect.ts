import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { TYPES, LISTING_REVALIDATE_SECONDS, type ArticleType } from '@/site/articles/config'
import { listingWhere, sortFor, type Doc } from '@/site/articles/where'
import { getServerSideURL } from '@/utilities/getURL'

import { toFeedItem } from './item'
import { buildFeed } from './rss'

export const FEED_LENGTH = 30
export const SITE_NAME = 'University of Swat'
export const feedPath = (type: ArticleType) => `/${TYPES[type].path}/feed.xml`

async function feedUncached(type: ArticleType): Promise<string> {
  const cfg = TYPES[type]
  const base = getServerSideURL().replace(/\/+$/, '')
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: cfg.collection,
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: FEED_LENGTH,
    sort: sortFor(cfg, 'current'),
    where: listingWhere(cfg, { view: 'current', year: undefined }, new Date()),
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      ...(cfg.hasExcerpt ? { excerpt: true } : {}),
      ...(cfg.kind === 'event' ? { startsAt: true, venue: true } : {}),
      governance: { expireAt: true, source: true },
    } as never,
  })
  const items = (res.docs as unknown as Doc[]).flatMap((d) => toFeedItem(type, d, base) ?? [])
  return buildFeed({
    title: `${cfg.label} - ${SITE_NAME}`,
    link: `${base}/${cfg.path}`,
    selfLink: `${base}${feedPath(type)}`,
    description: `${cfg.label} from the ${SITE_NAME}.`,
    language: 'en',
    items,
  })
}

export const feedXml = (type: ArticleType): Promise<string> =>
  unstable_cache(feedUncached, ['feeds', type], { revalidate: LISTING_REVALIDATE_SECONDS, tags: [`list:${type}`] })(type)

export const feedResponse = async (type: ArticleType): Promise<Response> =>
  new Response(await feedXml(type), {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': `public, s-maxage=${LISTING_REVALIDATE_SECONDS}, stale-while-revalidate=${LISTING_REVALIDATE_SECONDS}`,
    },
  })
