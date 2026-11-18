import { TYPES, type ArticleType } from '@/site/articles/config'
import { formatDate, formatDateTime } from '@/site/articles/format'
import { s, type Doc } from '@/site/articles/where'
import { isSample } from '@/site/organisation/shape'

import { rfc822, type FeedItem } from './rss'

type Gov = { expireAt?: string | null } | null | undefined

/** One record as a feed item: title, address, date and a short line. A Sample record is left out (it is invented data). */
export function toFeedItem(type: ArticleType, doc: Doc, base: string): FeedItem | null {
  const cfg = TYPES[type]
  const slug = s(doc.slug)
  const title = s(doc.title)
  if (!slug || !title || isSample(doc)) return null
  const parts: string[] = []
  const excerpt = cfg.hasExcerpt ? s(doc.excerpt) : null
  if (excerpt) parts.push(excerpt)
  if (cfg.kind === 'event') {
    const when = formatDateTime(s(doc.startsAt))
    const venue = s(doc.venue)
    if (when) parts.push(`When: ${when}.`)
    if (venue) parts.push(`Where: ${venue}.`)
  } else if (cfg.kind === 'deadline') {
    const closes = formatDate(s((doc.governance as Gov)?.expireAt))
    if (closes) parts.push(`Closes: ${closes}.`)
  }
  return {
    title,
    link: `${base.replace(/\/+$/, '')}/${cfg.path}/${encodeURIComponent(slug)}`,
    pubDate: rfc822(s(doc.publishedAt) ?? s(doc.startsAt)),
    description: parts.length ? parts.join(' ') : null,
  }
}

