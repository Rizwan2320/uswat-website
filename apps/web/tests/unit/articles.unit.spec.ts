import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { ARTICLE_TYPES, PER_PAGE, TYPES, isArticleType } from '@/site/articles/config'
import { formatDate, formatDateTime, isClosed } from '@/site/articles/format'
import { MAX_PAGE, listingHref, parseListingParams } from '@/site/articles/params'
import { archiveWhere, listingWhere, sortFor, toItem } from '@/site/articles/where'

const NOW = new Date('2026-11-13T10:00:00Z')

describe('listing parameters', () => {
  it('uses the defaults when nothing is given', () => {
    expect(parseListingParams({}, 2026)).toEqual({ page: 1, year: undefined, view: 'current' })
  })
  it('accepts a page, a year in range and the archive view', () => {
    expect(parseListingParams({ page: '3', year: '2024', view: 'archive' }, 2026)).toEqual({ page: 3, year: 2024, view: 'archive' })
  })
  it('falls back on anything malformed or out of range, and ignores unknown parameters', () => {
    for (const page of ['0', '-1', 'abc', '1.5', '9999', String(MAX_PAGE + 1), '']) expect(parseListingParams({ page }, 2026).page).toBe(1)
    for (const year of ['1999', '2027', '20x4', '24', '']) expect(parseListingParams({ year }, 2026).year).toBeUndefined()
    expect(parseListingParams({ view: 'everything', utm_source: 'x', sort: 'title' }, 2026)).toEqual({ page: 1, year: undefined, view: 'current' })
  })
  it('takes the first value of a repeated parameter', () => {
    expect(parseListingParams({ page: ['2', '5'] }, 2026).page).toBe(2)
  })
  it('writes the canonical address with only the parameters that differ from the default', () => {
    expect(listingHref('news', {})).toBe('/news')
    expect(listingHref('news', { page: 1, view: 'current' })).toBe('/news')
    expect(listingHref('notices', { view: 'archive', year: 2024, page: 2 })).toBe('/notices?view=archive&year=2024&page=2')
  })
})

describe('dates', () => {
  it('shows Pakistan time, so a late-evening UTC time lands on the next day', () => {
    expect(formatDate('2026-11-12T20:00:00Z')).toBe('13 November 2026')
    expect(formatDateTime('2026-11-12T20:00:00Z')).toMatch(/^13 November 2026( at|,)? 1:00 am$/i)
  })
  it('returns null for nothing or nonsense', () => {
    expect(formatDate(null)).toBeNull()
    expect(formatDate('not a date')).toBeNull()
  })
  it('is closed when archived or at or past the end date, open otherwise', () => {
    expect(isClosed({ status: 'archived' }, NOW)).toBe(true)
    expect(isClosed({ expireAt: '2026-11-13T10:00:00Z' }, NOW)).toBe(true)
    expect(isClosed({ expireAt: '2026-11-13T10:00:01Z' }, NOW)).toBe(false)
    expect(isClosed({ status: 'published' }, NOW)).toBe(false)
    expect(isClosed(null, NOW)).toBe(false)
  })
})

describe('types', () => {
  it('has five types, each serving its own address prefix', () => {
    expect([...ARTICLE_TYPES]).toEqual(['news', 'notices', 'events', 'jobs', 'tenders'])
    expect(isArticleType('news')).toBe(true)
    expect(isArticleType('posts')).toBe(false)
    expect(PER_PAGE).toBe(12)
  })
  it('serves every article address the route map points at', () => {
    const csv = readFileSync(path.resolve(process.cwd(), '../../scripts/import/data/route_map.csv'), 'utf8')
    const prefixes = new Set(ARTICLE_TYPES.map((t) => `/${TYPES[t].path}/`))
    const collections = new Set(['News', 'Notices', 'Events', 'Jobs', 'Tenders'])
    const lines = csv.split(/\r?\n/).slice(1).filter(Boolean)
    let checked = 0
    for (const l of lines) {
      const m = /^(?:"[^"]*"|[^,]*),(?:"[^"]*"|[^,]*),(?:"[^"]*"|[^,]*),([^,]*),([^,]*),((?:"[^"]*")|[^,]*),/.exec(l)
      if (!m || !collections.has(m[1]) || m[2] !== 'T5 Article') continue
      const target = m[3].replace(/^"|"$/g, '')
      expect([...prefixes].some((p) => target.startsWith(p)), target).toBe(true)
      checked++
    }
    expect(checked).toBeGreaterThan(1000)
  })
})

describe('what counts as current and what as archive', () => {
  it('news and notices differ only by notices aging out; archive is the other side', () => {
    const notice = JSON.stringify(archiveWhere(TYPES.notices, NOW))
    const news = JSON.stringify(archiveWhere(TYPES.news, NOW))
    expect(notice).toContain('archived')
    expect(notice).toContain('governance.pinned')
    expect(news).toContain('archived')
    expect(news).not.toContain('governance.pinned')
    expect(JSON.stringify(archiveWhere(TYPES.jobs, NOW))).toContain('"governance.expireAt":{"less_than_equal":"2026-11-13T10:00:00.000Z"}')
  })
  it('the year filter is a half-open range in UTC', () => {
    const w = JSON.stringify(listingWhere(TYPES.news, { view: 'current', year: 2024 }, NOW))
    expect(w).toContain('2024-01-01T00:00:00.000Z')
    expect(w).toContain('"less_than":"2025-01-01T00:00:00.000Z"')
  })
  it('lists events soonest first, everything else newest first', () => {
    expect(sortFor(TYPES.events, 'current')).toEqual(['startsAt', 'id'])
    expect(sortFor(TYPES.events, 'archive')).toEqual(['-startsAt', '-id'])
    expect(sortFor(TYPES.notices, 'current')).toEqual(['-publishedAt', '-id'])
  })
})

describe('list items', () => {
  it('keeps only what the type has: news has no excerpt, only events have a start', () => {
    const doc = { id: 1, title: 'T', slug: 's', publishedAt: '2026-01-01T00:00:00Z', excerpt: 'E', startsAt: '2026-12-01T00:00:00Z', venue: 'V', governance: { expireAt: '2026-12-02T00:00:00Z' } }
    expect(toItem(TYPES.news, doc, NOW)).toMatchObject({ excerpt: null, startsAt: null, venue: null, closesAt: null, closed: false })
    expect(toItem(TYPES.events, doc, NOW)).toMatchObject({ excerpt: 'E', startsAt: '2026-12-01T00:00:00Z', venue: 'V', closed: false })
    expect(toItem(TYPES.jobs, doc, NOW)).toMatchObject({ startsAt: null, closesAt: '2026-12-02T00:00:00Z' })
    expect(toItem(TYPES.jobs, { ...doc, governance: { expireAt: '2026-11-01T00:00:00Z' } }, NOW).closed).toBe(true)
  })
})
