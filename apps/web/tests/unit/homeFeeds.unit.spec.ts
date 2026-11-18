import { describe, expect, it } from 'vitest'

import type { Feed } from '../../src/site/content/types'
import { articleHref, mergeFeeds, pick, toEventItem, toFeedItem, toNewsItem } from '../../src/site/home/map'

const item = { id: 7, title: 'T', slug: 'a b', publishedAt: '2026-11-01T05:00:00.000Z', startsAt: '2026-12-01T05:00:00.000Z', venue: 'Hall' } as never

describe('home mapping', () => {
  it('links to the article address with no trailing slash and an escaped slug', () => {
    expect(articleHref('news', 'a b')).toBe('/news/a%20b')
    expect(toNewsItem(item)).toMatchObject({ id: 'news-7', href: '/news/a%20b', dateISO: '2026-11-01T05:00:00.000Z' })
    expect(toFeedItem('notices', item)).toMatchObject({ id: 'notices-7', href: '/notices/a%20b' })
  })
  it('gives an event its start so upcoming can be told from past, and its venue when it has one', () => {
    expect(toEventItem(item)).toMatchObject({ startISO: '2026-12-01T05:00:00.000Z', venue: 'Hall', href: '/events/a%20b' })
    expect(toEventItem({ id: 1, title: 'x', slug: 'x' } as never)).not.toHaveProperty('startISO')
  })
  it('uses the CMS list when it has items and the sourced fallback when it has none', () => {
    expect(pick([1], [2, 3])).toEqual([1])
    expect(pick([], [2, 3])).toEqual([2, 3])
  })
  it('replaces only the feeds that have CMS items, and points their "view all" at this site', () => {
    const f = (id: Feed['id']): Feed => ({ id, title: id, viewAllHref: 'https://old.example/', items: [{ id: 'old', title: 'old', href: '/old' }] })
    const merged = mergeFeeds([f('notices'), f('jobs'), f('tenders')], { notices: [toFeedItem('notices', item)], jobs: [], tenders: [] })
    expect(merged[0]).toMatchObject({ viewAllHref: '/notices', items: [{ id: 'notices-7' }] })
    expect(merged[1]).toMatchObject({ viewAllHref: 'https://old.example/', items: [{ id: 'old' }] })
  })
})
