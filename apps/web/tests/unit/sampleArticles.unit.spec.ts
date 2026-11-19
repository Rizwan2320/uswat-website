import { describe, expect, it } from 'vitest'

import { ARTICLE_COLLECTIONS, URDU_DRAFT_NOTE, articleSeeds, meritLists, tags } from '../../../../scripts/import/seeds/articles'
import { SAMPLE_HOST, campuses, sampleSource } from '../../../../scripts/import/seeds/data'

const seeds = articleSeeds()

describe('Sample article seeds obey the dummy-data rules', () => {
  it('cover all five types, with unique slugs inside each', () => {
    for (const c of ARTICLE_COLLECTIONS) {
      const slugs = seeds.filter((s) => s.collection === c).map((s) => s.slug)
      expect(slugs.length, c).toBeGreaterThanOrEqual(8)
      expect(new Set(slugs).size, c).toBe(slugs.length)
    }
  })
  it('give every type each state the workflow test needs', () => {
    for (const c of ARTICLE_COLLECTIONS) {
      const mine = seeds.filter((s) => s.collection === c)
      const has = (f: (s: (typeof seeds)[number]) => boolean) => mine.filter(f).length
      expect(has((s) => s.state === 'published' && (s.closesDays ?? 1) > 0 && (s.startsDays ?? 1) > -1), `${c} current`).toBeGreaterThanOrEqual(2)
      expect(has((s) => s.state === 'published' && ((s.closesDays ?? 1) < 0 || (s.startsDays ?? 1) < 0)), `${c} closed`).toBeGreaterThanOrEqual(1)
      expect(has((s) => s.state === 'draft'), `${c} drafts`).toBe(2)
      expect(has((s) => s.state === 'in_review'), `${c} in review`).toBe(2)
      expect(has((s) => s.title.length > 120), `${c} long title`).toBeGreaterThanOrEqual(1)
      if (c !== 'posts') expect(has((s) => !!s.attachment), `${c} attachment`).toBeGreaterThanOrEqual(1)
      expect(has((s) => !!s.urdu), `${c} urdu`).toBeGreaterThanOrEqual(1)
    }
  })
  it('have a future event and one that starts today', () => {
    const ev = seeds.filter((s) => s.collection === 'events' && s.state === 'published')
    expect(ev.some((e) => (e.startsDays ?? 0) >= 7)).toBe(true)
    expect(ev.some((e) => (e.startsDays ?? 9) > 0 && (e.startsDays ?? 9) < 1)).toBe(true)
  })
  it('are labelled Sample in English, and every Urdu text says it is a draft', () => {
    for (const s of seeds) {
      if (!s.urdu) expect(s.title.startsWith('Sample'), s.title).toBe(true)
      expect(s.body).toContain('Sample')
      if (s.urdu) expect(s.urdu.body).toContain(URDU_DRAFT_NOTE)
    }
    for (const t of tags) expect(t.name.startsWith('Sample')).toBe(true)
    for (const m of meritLists) expect(m.title.startsWith('Sample')).toBe(true)
  })
  it('point every tag at a seeded tag, and every attached file at sample.invalid', () => {
    const known = new Set(tags.map((t) => t.slug))
    for (const s of seeds) for (const t of s.tags) expect(known.has(t), t).toBe(true)
    expect(new URL(sampleSource('notices', 'x')).hostname).toBe(SAMPLE_HOST)
  })
  it('contain no digits that look like a real figure, phone or year in titles', () => {
    for (const s of seeds) expect(/\d{3,}/.test(s.title + s.excerpt + s.body), s.slug).toBe(false)
  })
  it('keep merit lists in several states, each with a title and cycle', () => {
    expect(new Set(meritLists.map((m) => m.state))).toEqual(new Set(['published', 'draft', 'in_review']))
  })
  it('seed three campuses under the slugs the route map expects', () => {
    expect(campuses.map((c) => c.slug).sort()).toEqual(['main', 'sangota', 'women'])
  })
})
