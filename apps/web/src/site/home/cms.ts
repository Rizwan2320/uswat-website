import { listArticles } from '../articles/queries'
import type { ArticleType } from '../articles/config'
import type { EventItem, Feed, NewsItem } from '../content/types'

import {
  HOME_EVENT_ITEMS,
  HOME_FEED_ITEMS,
  HOME_NEWS_ITEMS,
  mergeFeeds,
  pick,
  toEventItem,
  toFeedItem,
  toNewsItem,
} from './map'

/**
 * Home page sections read from the CMS through the same cached list reads as the list pages
 * (300 s, tag `list:{type}`), so the two cannot disagree. Any failure (no database at build time)
 * falls back to the sourced items in content/*.ts rather than breaking the home page.
 */
const current = async (type: ArticleType) => {
  try {
    return (await listArticles(type, { page: 1, view: 'current' })).items
  } catch {
    return []
  }
}

export async function homeFeeds(staticFeeds: Feed[]): Promise<Feed[]> {
  const [notices, jobs, tenders] = await Promise.all([current('notices'), current('jobs'), current('tenders')])
  return mergeFeeds(staticFeeds, {
    notices: notices.slice(0, HOME_FEED_ITEMS).map((i) => toFeedItem('notices', i)),
    jobs: jobs.slice(0, HOME_FEED_ITEMS).map((i) => toFeedItem('jobs', i)),
    tenders: tenders.slice(0, HOME_FEED_ITEMS).map((i) => toFeedItem('tenders', i)),
  })
}

export async function homeNews(staticNews: NewsItem[]): Promise<NewsItem[]> {
  return pick((await current('news')).slice(0, HOME_NEWS_ITEMS).map(toNewsItem), staticNews)
}

export async function homeEvents(staticEvents: EventItem[]): Promise<EventItem[]> {
  return pick((await current('events')).slice(0, HOME_EVENT_ITEMS).map(toEventItem), staticEvents)
}
