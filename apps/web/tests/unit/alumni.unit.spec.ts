import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  ALUMNI_WORKS,
  alumniBySlugs,
  alumniForProgramme,
  alumniHref,
} from '../../src/site/academics/alumni'
import { dcst } from '../../src/site/academics/profiles/dcst'
import { disciplineProfiles } from '../../src/site/academics/profiles'
import { LIST_PAGES } from '../../src/site/sitemap/entries'

const src = (p: string) => readFileSync(path.resolve(process.cwd(), 'src/site/academics', p), 'utf8')
const PLACEHOLDER = /lorem|ipsum|todo|tbd|xxx|placeholder/i

describe('alumni work (sample data)', () => {
  it('has unique slugs that are safe in an address', () => {
    const slugs = ALUMNI_WORKS.map((w) => w.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('fills every field and keeps placeholder words out', () => {
    for (const w of ALUMNI_WORKS) {
      expect(w.name.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2)
      for (const v of [w.name, w.headline, w.summary]) expect(v).not.toMatch(PLACEHOLDER)
      expect(w.headline.length).toBeGreaterThan(30)
      expect(w.summary.length).toBeGreaterThan(80)
      expect(w.tags.length).toBeGreaterThanOrEqual(2)
      expect(w.classOf).toBeGreaterThanOrEqual(2020)
      expect(w.classOf).toBeLessThanOrEqual(2026)
    }
  })

  it('gives each of the nine programmes exactly three entries', () => {
    expect(disciplineProfiles.map((p) => p.slug).sort()).toEqual(
      [
        'bs-artificial-intelligence',
        'bs-computer-science',
        'bs-data-science',
        'bs-information-technology',
        'bs-software-engineering',
        'bs-medical-laboratory-technology',
        'bs-dental-technology',
        'doctor-of-physical-therapy',
        'bs-radiography-and-imaging-technology',
      ].sort(),
    )
    for (const p of disciplineProfiles) expect(alumniForProgramme(p.slug)).toHaveLength(3)
    expect(ALUMNI_WORKS).toHaveLength(27)
  })

  it('features three different works on the department page', () => {
    expect(dcst.alumni).toHaveLength(3)
    expect(alumniBySlugs(dcst.alumni ?? [])).toHaveLength(3)
  })

  it('links out only over https, and a portrait path points at a file that exists', () => {
    for (const w of ALUMNI_WORKS) {
      if (w.workUrl) expect(w.workUrl).toMatch(/^https:\/\//)
      if (w.photo) expect(existsSync(path.resolve(process.cwd(), 'public', w.photo.replace(/^\//, '')))).toBe(true)
    }
  })

  it('shows three different portraits on every programme page', () => {
    for (const p of disciplineProfiles) {
      const photos = alumniForProgramme(p.slug).map((w) => w.photo)
      expect(new Set(photos).size).toBe(3)
    }
  })

  it('has a route file, and the sitemap lists every work page', () => {
    expect(
      existsSync(path.resolve(process.cwd(), 'src/app/(site)/(cms)/academics/alumni-work/[slug]/page.tsx')),
    ).toBe(true)
    for (const w of ALUMNI_WORKS) expect(LIST_PAGES).toContain(alumniHref(w.slug))
  })

  it('gives the names a portrait of a man only where the stand-in portraits are used', () => {
    const female = /\b(Ayesha|Zainab|Mahnoor|Sidra|Faiza|Laiba|Mariam|Rabia|Bibi|Naz)\b/
    for (const w of ALUMNI_WORKS) if (w.photo) expect(w.name, w.slug).not.toMatch(female)
  })

  it('is shown on the department page and on every programme page', () => {
    expect(src('RichDepartmentPage.tsx')).toContain('<AlumniShowcase')
    expect(src('RichDisciplinePage.tsx')).toContain('<AlumniShowcase')
  })
})
