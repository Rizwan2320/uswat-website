import { describe, expect, it } from 'vitest'

import { CONTENT_SOURCES, LIST_PAGES, absolute, listEntries, toEntries } from '../../src/site/sitemap/entries'

const now = '2026-11-18T00:00:00.000Z'

describe('sitemap entries', () => {
  it('joins the base and path with one slash and no trailing slash', () => {
    expect(absolute('https://x.example/', '/news')).toBe('https://x.example/news')
    expect(absolute('https://x.example', '/news')).toBe('https://x.example/news')
  })
  it('lists a record with its address and last change, and falls back to now', () => {
    const e = toEntries('https://x.example', '/notices', [{ slug: 'a b', updatedAt: '2026-11-01T00:00:00.000Z' }, { slug: 'c' }], now)
    expect(e).toEqual([
      { loc: 'https://x.example/notices/a%20b', lastmod: '2026-11-01T00:00:00.000Z' },
      { loc: 'https://x.example/notices/c', lastmod: now },
    ])
  })
  it('leaves out a record without a slug, and keeps a Sample record (the demo site is all Sample)', () => {
    const e = toEntries('https://x.example', '/notices', [{ slug: '' }, { updatedAt: now }, { slug: 'sample', governance: { source: 'https://sample.invalid/seed/x' } }, { slug: 'real', governance: { source: 'https://uswat.edu.pk/x' } }], now)
    expect(e.map((x) => x.loc)).toEqual(['https://x.example/notices/sample', 'https://x.example/notices/real'])
  })
  it('covers every public record type and list page, each address without a trailing slash', () => {
    expect(CONTENT_SOURCES.map((s) => s.collection)).toEqual(['notices', 'events', 'jobs', 'tenders', 'departments', 'programmes', 'offices'])
    for (const p of [...LIST_PAGES, ...CONTENT_SOURCES.map((s) => s.path)]) expect(p.startsWith('/') && !p.endsWith('/')).toBe(true)
    expect(listEntries('https://x.example', now)).toHaveLength(LIST_PAGES.length)
  })
})
