import type { EventItem, Feed, FeedItem, NewsItem } from '../content/types'
import type { ListItem } from '../articles/where'

/* Pure mapping from published CMS list items to the shapes the home page reads (content/types.ts).
   Nothing here opens the CMS, so unit tests can use it. */

export const HOME_FEED_ITEMS = 3
export const HOME_NEWS_ITEMS = 4
export const HOME_EVENT_ITEMS = 4

export const articleHref = (path: string, slug: string) => `/${path}/${encodeURIComponent(slug)}`

export const toFeedItem = (path: string, i: ListItem): FeedItem => ({
  id: `${path}-${i.id}`,
  title: i.title,
  href: articleHref(path, i.slug),
  ...(i.publishedAt ? { dateISO: i.publishedAt } : {}),
})

export const toNewsItem = (i: ListItem): NewsItem => ({
  id: `news-${i.id}`,
  title: i.title,
  href: articleHref('news', i.slug),
  ...(i.publishedAt ? { dateISO: i.publishedAt } : {}),
})

export const toEventItem = (i: ListItem): EventItem => ({
  id: `events-${i.id}`,
  title: i.title,
  href: articleHref('events', i.slug),
  ...(i.venue ? { venue: i.venue } : {}),
  ...(i.startsAt ? { dateISO: i.startsAt, startISO: i.startsAt } : {}),
})

/**
 * The CMS wins when it has anything to show; otherwise the section keeps the sourced items from
 * content/*.ts, so the home page never goes blank before the CMS holds published records.
 */
export function pick<T>(fromCms: T[], fallback: T[]): T[] {
  return fromCms.length ? fromCms : fallback
}

export function mergeFeeds(staticFeeds: Feed[], cms: Record<Feed['id'], FeedItem[]>): Feed[] {
  return staticFeeds.map((f) =>
    cms[f.id].length ? { ...f, viewAllHref: `/${f.id}`, items: cms[f.id] } : f,
  )
}
