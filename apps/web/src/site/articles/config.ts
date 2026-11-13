import { NOTICE_LISTING } from '@/collections/Notices'
import type { CurrentListingOptions } from '@/governance/lifecycle'

/**
 * The five article types (Addendum section 5, routes 10 and 11). News is the `posts` collection for now
 * (docs/briefs/p3d-post-types.md): its body field is `content`, and it has no excerpt or attachments field.
 */
export const ARTICLE_TYPES = ['news', 'notices', 'events', 'jobs', 'tenders'] as const
export type ArticleType = (typeof ARTICLE_TYPES)[number]

export type TypeConfig = {
  path: ArticleType
  collection: 'posts' | 'notices' | 'events' | 'jobs' | 'tenders'
  label: string
  singular: string
  bodyField: 'content' | 'body'
  hasExcerpt: boolean
  hasAttachments: boolean
  /** Only events have a start; for jobs and tenders `governance.expireAt` is the closing date. */
  kind: 'article' | 'event' | 'deadline'
  /** The rule that takes a record out of "current" lists (notices also age out; see lifecycle.ts). */
  current: CurrentListingOptions
  /** What the page says once the record is out of current lists. */
  closedText: string
}

export const TYPES: Record<ArticleType, TypeConfig> = {
  news: {
    path: 'news',
    collection: 'posts',
    label: 'News',
    singular: 'News item',
    bodyField: 'content',
    hasExcerpt: false,
    hasAttachments: false,
    kind: 'article',
    current: {},
    closedText: 'This news item has been archived.',
  },
  notices: {
    path: 'notices',
    collection: 'notices',
    label: 'Notices',
    singular: 'Notice',
    bodyField: 'body',
    hasExcerpt: true,
    hasAttachments: true,
    kind: 'article',
    current: NOTICE_LISTING,
    closedText: 'This notice has been archived.',
  },
  events: {
    path: 'events',
    collection: 'events',
    label: 'Events',
    singular: 'Event',
    bodyField: 'body',
    hasExcerpt: true,
    hasAttachments: true,
    kind: 'event',
    current: {},
    closedText: 'This event has ended.',
  },
  jobs: {
    path: 'jobs',
    collection: 'jobs',
    label: 'Jobs',
    singular: 'Job',
    bodyField: 'body',
    hasExcerpt: true,
    hasAttachments: true,
    kind: 'deadline',
    current: {},
    closedText: 'This vacancy is closed.',
  },
  tenders: {
    path: 'tenders',
    collection: 'tenders',
    label: 'Tenders',
    singular: 'Tender',
    bodyField: 'body',
    hasExcerpt: true,
    hasAttachments: true,
    kind: 'deadline',
    current: {},
    closedText: 'This tender is closed.',
  },
}

export const isArticleType = (v: string): v is ArticleType => (ARTICLE_TYPES as readonly string[]).includes(v)

/** Listings are cached for this long. There are no revalidation hooks for the post types yet, so this is the bound. */
export const LISTING_REVALIDATE_SECONDS = 300
export const PER_PAGE = 12
/** Addendum section 5: the newest 150 articles are prebuilt. */
export const PREBUILD_COUNT = 150
