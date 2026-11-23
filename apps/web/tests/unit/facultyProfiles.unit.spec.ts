import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { departments as seededDepartments, facultyGroups, programmes as seededProgrammes } from '../../../../scripts/import/seeds/data'
import rules from '../../src/legacy/routeMap.generated.json'
import { facultyProfiles, facultyProgrammeProfiles, profileForFaculty, profileForFacultyProgramme, programmesOfFaculty } from '../../src/site/faculties'
import { isSafeHref } from '../../src/utilities/safeHref'

const pub = (src: string) => path.resolve(__dirname, '../../public', src.replace(/^\//, ''))
const DAY = /^\d{4}-\d{2}-\d{2}$/

describe('faculty profiles (Faculty of Allied Health Sciences)', () => {
  it('have unique slugs and a seeded CMS record for every programme and centre that links to one', () => {
    expect(new Set(facultyProfiles.map((f) => f.slug)).size).toBe(facultyProfiles.length)
    expect(new Set(facultyProgrammeProfiles.map((p) => p.slug)).size).toBe(facultyProgrammeProfiles.length)
    for (const p of facultyProgrammeProfiles) expect(seededProgrammes.some((s) => s.slug === p.slug), `seed row for ${p.slug}`).toBe(true)
    for (const f of facultyProfiles) {
      expect(facultyGroups.some((g) => g.name === f.name), `faculty group ${f.name}`).toBe(true)
      for (const c of f.centres) if (c.slug) expect(seededDepartments.some((d) => d.slug === c.slug), `seed row for ${c.slug}`).toBe(true)
    }
  })
  it('list the same programmes on the faculty page as the profiles, and every centre programme exists', () => {
    for (const f of facultyProfiles) {
      expect(f.programmes).toEqual(programmesOfFaculty(f.slug).map((p) => p.slug))
      for (const c of f.centres) for (const slug of c.programmes) expect(profileForFacultyProgramme(slug), slug).not.toBeNull()
    }
  })
  it('send the old /faculty/ address to the new page, which is not shadowed by anything else', () => {
    expect((rules.redirects as Record<string, string>)['/faculty']).toBe('/faculties/allied-health-sciences')
    expect(profileForFaculty('allied-health-sciences')?.path).toBe('/faculties/allied-health-sciences')
  })
  it('give every fact a source address and the day it was read (rule 3)', () => {
    for (const f of facultyProfiles) {
      expect(f.sources.map((s) => s.url)).toContain(f.officialPage)
      for (const s of f.sources) expect(s.url.startsWith('https://') && isSafeHref(s.url), s.url).toBe(true)
      expect(f.verifiedAt).toMatch(DAY)
      expect(f.openPoints.length).toBeGreaterThan(0)
    }
    for (const p of facultyProgrammeProfiles) {
      expect(p.sources.length, p.slug).toBeGreaterThan(0)
      for (const s of p.sources) expect(s.url.startsWith('https://') && isSafeHref(s.url), s.url).toBe(true)
      expect(p.verifiedAt, p.slug).toMatch(DAY)
      expect(p.openPoints.length, p.slug).toBeGreaterThan(0)
    }
  })
  it('name only pictures that exist', () => {
    for (const f of facultyProfiles) for (const art of [f.banner, f.hero]) expect(existsSync(pub(art.src)), art.src).toBe(true)
    for (const p of facultyProgrammeProfiles) for (const art of [p.banner, p.hero]) expect(existsSync(pub(art.src)), art.src).toBe(true)
  })
  it('keep contact details to the university’s own domain and invent nothing the sources do not give', () => {
    for (const f of facultyProfiles) {
      for (const e of f.emails ?? []) expect(e.endsWith('@uswat.edu.pk'), e).toBe(true)
      for (const ph of f.phones ?? []) expect(ph.number).toMatch(/^\+?[\d -]{9,}$/)
      expect(f.people.length).toBeGreaterThan(0)
    }
    // no duration, eligibility, fee or course list in code: those come from the CMS record when a person fills them
    const text = JSON.stringify([facultyProfiles, facultyProgrammeProfiles])
    expect(text).not.toMatch(/lorem|sample|invented|TBD|\b\d+ years\b|credit hours/i)
  })
  it('seed the four programmes with no invented level, duration or eligibility', () => {
    for (const p of facultyProgrammeProfiles) {
      const row = seededProgrammes.find((s) => s.slug === p.slug)!
      expect(row.eligibility, p.slug).toBeNull()
      expect(row.duration, p.slug).toBeUndefined()
      expect(row.level, p.slug).toBeUndefined()
    }
  })
})
