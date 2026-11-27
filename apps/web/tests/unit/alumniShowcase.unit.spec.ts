import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { alumniWorkHref, alumniWorks, getAlumniWork } from '@/site/content/alumni'

describe('alumni works (landing page "Our Alumni")', () => {
  it('has three entries with distinct slugs and a headline, abstract and keywords each', () => {
    expect(alumniWorks).toHaveLength(3)
    expect(new Set(alumniWorks.map((w) => w.slug)).size).toBe(3)
    for (const w of alumniWorks) {
      expect(w.title.length).toBeGreaterThan(10)
      expect(w.abstract.length).toBeGreaterThan(0)
      expect(w.keywords.length).toBeGreaterThan(0)
    }
  })
  it('every photograph exists on disk and has alt text', () => {
    for (const w of alumniWorks) {
      expect(w.photo.alt.length).toBeGreaterThan(10)
      expect(existsSync(join(__dirname, '../../public', w.photo.src)), w.photo.src).toBe(true)
    }
  })
  it('links to its own page, or to the full text when one is given', () => {
    const a = alumniWorks[0]!
    expect(alumniWorkHref(a)).toBe(`/alumni/research/${a.slug}`)
    expect(alumniWorkHref({ slug: 'x', url: 'https://example.org/thesis.pdf' })).toBe('https://example.org/thesis.pdf')
    expect(getAlumniWork(a.slug)).toBe(a)
    expect(getAlumniWork('no-such-work')).toBeUndefined()
  })
  it('is flagged Sample while the entries are invented', () => {
    expect(alumniWorks.every((w) => w.sample)).toBe(true)
  })
})
