import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { programmes as seededProgrammes } from '../../../../scripts/import/seeds/data'
import rules from '../../src/legacy/routeMap.generated.json'
import { alumniBySlugs, alumniForProgramme } from '../../src/site/academics/alumni'
import { alliedHealth } from '../../src/site/academics/profiles/allied/ahs'
import { departmentPath, disciplinesOf, profileForDepartment } from '../../src/site/academics/profiles'
import { isSafeHref } from '../../src/utilities/safeHref'

const pub = (src: string) => path.resolve(__dirname, '../../public', src.replace(/^\//, ''))
const DAY = /^\d{4}-\d{2}-\d{2}$/
const programmes = disciplinesOf(alliedHealth.slug)

describe('Faculty of Allied Health Sciences in the DCST layout', () => {
  it('is registered with its own address and four programmes, each with a seeded CMS record', () => {
    expect(profileForDepartment('allied-health-sciences')).toBe(alliedHealth)
    expect(departmentPath(alliedHealth)).toBe('/faculties/allied-health-sciences')
    expect(programmes.map((p) => p.slug)).toEqual(alliedHealth.disciplines)
    for (const p of programmes) expect(seededProgrammes.some((s) => s.slug === p.slug), `seed row for ${p.slug}`).toBe(true)
  })

  it('keeps the old /faculty/ address pointing at the page', () => {
    expect((rules.redirects as Record<string, string>)['/faculty']).toBe('/faculties/allied-health-sciences')
  })

  it('is marked draft, so the page says its text is not yet reviewed', () => {
    expect(alliedHealth.status).toBe('draft')
    for (const p of programmes) expect(p.status).toBe('draft')
  })

  it('gives every fact from the university’s pages a source address and the day it was read (rule 3)', () => {
    const ref = alliedHealth.reference!
    expect(ref.sources.map((s) => s.url)).toContain('https://uswat.edu.pk/faculty/')
    for (const s of ref.sources) expect(s.url.startsWith('https://') && isSafeHref(s.url), s.url).toBe(true)
    expect(ref.verifiedAt).toMatch(DAY)
    expect(ref.openPoints.length).toBeGreaterThan(0)
    for (const e of ref.emails ?? []) expect(e.endsWith('@uswat.edu.pk'), e).toBe(true)
    for (const ph of ref.phones ?? []) expect(ph.number).toMatch(/^\+?[\d -]{9,}$/)
  })

  it('names the three staff and the centres exactly as the faculty page does', () => {
    expect(alliedHealth.team.map((m) => m.name)).toEqual(['Dr. Ali Akbar', 'Dr. Nasib Zaman', 'Dr. Zafar Ali'])
    expect(alliedHealth.team[0]).toMatchObject({ role: 'head', roleLabel: 'Director of the faculty' })
    const text = alliedHealth.about.join(' ')
    for (const c of ['Centre for Medical Technologies', 'School of Nursing and Public Health', 'Centre for Pharmaceutical and Rehabilitation Sciences', 'Centre for Food and Nutrition Sciences'])
      expect(text).toContain(c)
    expect(Object.fromEntries(programmes.map((p) => [p.shortName, p.centre ?? null]))).toEqual({
      MLT: 'Centre for Medical Technologies',
      'Dental Technology': 'Centre for Medical Technologies',
      DPT: 'Centre for Pharmaceutical and Rehabilitation Sciences',
      'Radiography & Imaging': null,
    })
  })

  it('invents no fee, seat count or eligibility rule', () => {
    const text = JSON.stringify([alliedHealth, programmes])
    expect(text).not.toMatch(/\b(Rs\.?|PKR)\s?\d|\b\d+\s+seats\b|\bFSc\b|\bmarks\b|lorem|TBD/i)
  })

  it('has a full study plan for every programme: 4 years, and 5 for the DPT', () => {
    for (const p of programmes) {
      expect(p.years.length, p.slug).toBe(p.slug === 'doctor-of-physical-therapy' ? 5 : 4)
      for (const y of p.years) for (const s of y.semesters) expect(s.courses.length, `${p.slug} ${s.name}`).toBeGreaterThanOrEqual(3)
      expect(p.whyStudy.length).toBe(4)
      expect(p.outcomes.length).toBe(5)
      expect(p.careers.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('names only pictures that exist', () => {
    const arts = [alliedHealth.banner, alliedHealth.hero, alliedHealth.tile!, ...alliedHealth.labs.map((l) => l.art)]
    for (const p of programmes) arts.push(p.banner, p.hero, p.tile, p.figure)
    for (const a of arts) expect(existsSync(pub(a.src)), a.src).toBe(true)
  })

  it('shows three alumni on every programme page and three different portraits on the faculty page', () => {
    for (const p of programmes) expect(alumniForProgramme(p.slug), p.slug).toHaveLength(3)
    const featured = alumniBySlugs(alliedHealth.alumni ?? [])
    expect(featured).toHaveLength(3)
    expect(new Set(featured.map((w) => w.photo)).size).toBe(3)
    expect(new Set(featured.map((w) => w.programme)).size).toBe(3)
  })
})
