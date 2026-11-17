import { describe, expect, it } from 'vitest'

import { MAX_QUERY, parseSearchParams, resultHref, searchHref, toHit } from '../../src/site/search/shape'

describe('resultHref', () => {
  it('maps each searchable collection to its public address, with no trailing slash', () => {
    expect(resultHref('pages', 'about')).toBe('/about')
    expect(resultHref('posts', 'a b')).toBe('/news/a%20b')
    expect(resultHref('notices', 'n')).toBe('/notices/n')
    expect(resultHref('events', 'e')).toBe('/events/e')
    expect(resultHref('jobs', 'j')).toBe('/jobs/j')
    expect(resultHref('tenders', 't')).toBe('/tenders/t')
  })
  it('returns null for a collection with no public page or an empty slug, so no dead link is shown', () => {
    expect(resultHref('people', 'x')).toBeNull()
    expect(resultHref('notices', '')).toBeNull()
  })
})

describe('parseSearchParams', () => {
  it('trims, collapses spaces, caps the length and reads the first of repeated values', () => {
    expect(parseSearchParams({ q: '  admission   fee ' }).q).toBe('admission fee')
    expect(parseSearchParams({ q: 'x'.repeat(500) }).q).toHaveLength(MAX_QUERY)
    expect(parseSearchParams({ q: ['a', 'b'] }).q).toBe('a')
    expect(parseSearchParams({}).q).toBe('')
  })
  it('falls back to page 1 for anything but a whole number from 1 to 100', () => {
    expect(parseSearchParams({ page: '3' }).page).toBe(3)
    for (const bad of ['0', '-1', '2.5', 'x', '101', '']) expect(parseSearchParams({ page: bad }).page).toBe(1)
  })
  it('builds a page address with the query escaped', () => {
    expect(searchHref({ q: 'a&b c', page: 1 })).toBe('/search?q=a%26b%20c')
    expect(searchHref({ q: 'a', page: 2 })).toBe('/search?q=a&page=2')
  })
})

describe('toHit', () => {
  it('builds a hit from a search record and skips one without a title or public page', () => {
    const rec = { id: 1, title: 'Fee notice', slug: 'fee', doc: { relationTo: 'notices', value: 4 }, meta: { description: ' text ' } }
    expect(toHit(rec)).toEqual({ id: 1, title: 'Fee notice', href: '/notices/fee', type: 'Notice', description: 'text' })
    expect(toHit({ ...rec, title: '', meta: {} })).toBeNull()
    expect(toHit({ ...rec, doc: { relationTo: 'people', value: 1 } })).toBeNull()
  })
})
