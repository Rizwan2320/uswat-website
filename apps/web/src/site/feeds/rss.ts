/* Pure side of the RSS feeds: how a list of items becomes RSS 2.0 text. Nothing here opens the CMS.
   The XML is built as a string with every value escaped, so no library is needed. */

export type FeedItem = {
  title: string
  link: string
  /** RFC 822 date, or null when the record has no usable date (the item is then listed without one). */
  pubDate: string | null
  description: string | null
}

export type Feed = {
  title: string
  link: string
  selfLink: string
  description: string
  language: string
  items: FeedItem[]
}

/* Characters XML 1.0 does not allow at all (control characters, U+FFFE and U+FFFF) are dropped. Lone surrogates are too. */
const ILLEGAL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g

export function escapeXml(value: string): string {
  return value
    .replace(ILLEGAL, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** RFC 822 form ("Wed, 18 Nov 2026 08:00:00 GMT"), or null for a missing or invalid date. */
export function rfc822(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toUTCString()
}

const tag = (name: string, value: string) => `<${name}>${escapeXml(value)}</${name}>`

export function buildFeed(feed: Feed): string {
  const dates = feed.items.flatMap((i) => (i.pubDate ? [new Date(i.pubDate).getTime()] : []))
  const items = feed.items.map((i) =>
    [
      '<item>',
      tag('title', i.title),
      tag('link', i.link),
      `<guid isPermaLink="true">${escapeXml(i.link)}</guid>`,
      i.pubDate ? tag('pubDate', i.pubDate) : '',
      i.description ? tag('description', i.description) : '',
      '</item>',
    ]
      .filter(Boolean)
      .join(''),
  )
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
    tag('title', feed.title),
    tag('link', feed.link),
    tag('description', feed.description),
    tag('language', feed.language),
    dates.length ? tag('lastBuildDate', new Date(Math.max(...dates)).toUTCString()) : '',
    `<atom:link href="${escapeXml(feed.selfLink)}" rel="self" type="application/rss+xml"/>`,
    ...items,
    '</channel></rss>',
  ]
    .filter(Boolean)
    .join('\n')
}
