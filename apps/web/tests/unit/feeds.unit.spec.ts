import { describe, expect, it } from 'vitest'

import { toFeedItem } from '../../src/site/feeds/item'
import { buildFeed, escapeXml, rfc822 } from '../../src/site/feeds/rss'

const base = 'https://x.example'

describe('rss builder', () => {
  it('escapes the five XML characters and drops characters XML cannot hold', () => {
    expect(escapeXml(`a & b < c > "d" 'e'`)).toBe('a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;')
    expect(escapeXml('a\u0000b\u0008c\u001Fd￾e')).toBe('abcde')
    expect(escapeXml('x\uD800y')).toBe('xy')
    expect(escapeXml('اردو 😀')).toBe('اردو 😀')
  })
  it('writes an RFC 822 date, or nothing for a missing or invalid one', () => {
    expect(rfc822('2026-11-18T08:00:00.000Z')).toBe('Wed, 18 Nov 2026 08:00:00 GMT')
    expect(rfc822(null)).toBeNull()
    expect(rfc822('not a date')).toBeNull()
  })
  it('builds a channel with escaped items, the newest date as lastBuildDate, and a self link', () => {
    const xml = buildFeed({
      title: 'Notices - University of Swat',
      link: `${base}/notices`,
      selfLink: `${base}/notices/feed.xml`,
      description: 'd',
      language: 'en',
      items: [
        { title: 'A & B <1>', link: `${base}/notices/a`, pubDate: rfc822('2026-11-01T00:00:00Z'), description: 'x < y' },
        { title: 'No date', link: `${base}/notices/b`, pubDate: null, description: null },
        { title: 'Newer', link: `${base}/notices/c`, pubDate: rfc822('2026-11-10T00:00:00Z'), description: null },
      ],
    })
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<title>A &amp; B &lt;1&gt;</title>')
    expect(xml).toContain('<description>x &lt; y</description>')
    expect(xml).toContain('<lastBuildDate>Tue, 10 Nov 2026 00:00:00 GMT</lastBuildDate>')
    expect(xml).toContain('<atom:link href="https://x.example/notices/feed.xml" rel="self" type="application/rss+xml"/>')
    expect(xml.match(/<item>/g)).toHaveLength(3)
    expect(xml.split('<item>')[2]).not.toContain('<pubDate>')
  })
  it('has no lastBuildDate when no item has a date', () => {
    const xml = buildFeed({ title: 't', link: base, selfLink: base, description: 'd', language: 'en', items: [] })
    expect(xml).not.toContain('lastBuildDate')
  })
})

describe('feed item', () => {
  const real = { id: 1, slug: 'a b', title: 'Admissions open', publishedAt: '2026-11-02T05:00:00.000Z', excerpt: 'Apply now.', governance: { source: 'https://uswat.edu.pk/x' } }
  it('links to the public address with the slug encoded and carries the excerpt', () => {
    expect(toFeedItem('notices', real, `${base}/`)).toEqual({
      title: 'Admissions open',
      link: 'https://x.example/notices/a%20b',
      pubDate: 'Mon, 02 Nov 2026 05:00:00 GMT',
      description: 'Apply now.',
    })
  })
  it('leaves out a Sample record and a record without a title or slug', () => {
    expect(toFeedItem('notices', { ...real, governance: { source: 'https://sample.invalid/seed/notices/a' } }, base)).toBeNull()
    expect(toFeedItem('notices', { ...real, slug: '' }, base)).toBeNull()
    expect(toFeedItem('notices', { ...real, title: '' }, base)).toBeNull()
  })
  it('gives an event its start as the date when it has no publish date, plus when and where', () => {
    const it = toFeedItem('events', { id: 2, slug: 'e', title: 'Convocation', startsAt: '2026-12-01T04:30:00.000Z', venue: 'Main hall', excerpt: null }, base)
    expect(it?.pubDate).toBe('Tue, 01 Dec 2026 04:30:00 GMT')
    expect(it?.description).toBe('When: 1 December 2026 at 9:30 am. Where: Main hall.')
  })
  it('says when a job or tender closes, and gives News no excerpt', () => {
    const job = toFeedItem('jobs', { id: 3, slug: 'j', title: 'Lecturer', publishedAt: '2026-11-01T00:00:00Z', excerpt: 'Physics.', governance: { expireAt: '2026-12-15T00:00:00Z' } }, base)
    expect(job?.description).toBe('Physics. Closes: 15 December 2026.')
    const news = toFeedItem('news', { id: 4, slug: 'n', title: 'Story', publishedAt: '2026-11-01T00:00:00Z', excerpt: 'ignored' }, base)
    expect(news?.description).toBeNull()
  })
})
