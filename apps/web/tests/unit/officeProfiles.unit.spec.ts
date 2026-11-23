import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { offices as seededOffices } from '../../../../scripts/import/seeds/data'
import rules from '../../src/legacy/routeMap.generated.json'
import { ADMINISTRATION, RESEARCH } from '../../src/site/offices/landings'
import { GROUP_ORDER, OFFICE_PROFILES, officesByGroup, officesListedOn, profileForOffice } from '../../src/site/offices/profiles'
import { isSafeHref } from '../../src/utilities/safeHref'

const pub = (src: string) => path.resolve(__dirname, '../../public', src.replace(/^\//, ''))
const DAY = /^\d{4}-\d{2}-\d{2}$/

describe('office profiles (Research and Administration pages)', () => {
  it('have unique slugs and people ids', () => {
    expect(new Set(OFFICE_PROFILES.map((p) => p.slug)).size).toBe(OFFICE_PROFILES.length)
    for (const p of OFFICE_PROFILES) expect(new Set(p.people.map((x) => x.id)).size, p.slug).toBe(p.people.length)
  })
  it('use the slug the route map gives the old page, and have a seeded record to render on', () => {
    const targets = new Set(Object.values(rules.redirects))
    for (const p of OFFICE_PROFILES) {
      expect(targets.has(`/administration/${p.slug}`), `route map has /administration/${p.slug}`).toBe(true)
      expect(seededOffices.some((o) => o.slug === p.slug), `seed row for ${p.slug}`).toBe(true)
    }
  })
  it('give every fact a source address and the day it was read (rule 3)', () => {
    for (const p of OFFICE_PROFILES) {
      expect(p.sources.length, p.slug).toBeGreaterThan(0)
      expect(p.sources.map((s) => s.url), p.slug).toContain(p.officialPage)
      for (const s of p.sources) expect(s.url.startsWith('https://') && isSafeHref(s.url), s.url).toBe(true)
      expect(p.verifiedAt, p.slug).toMatch(DAY)
    }
    for (const l of [RESEARCH, ADMINISTRATION]) {
      expect(l.verifiedAt).toMatch(DAY)
      expect(l.sources.length).toBeGreaterThan(0)
    }
  })
  it('name only pictures that exist', () => {
    for (const p of OFFICE_PROFILES) {
      for (const art of [p.banner, p.hero]) expect(existsSync(pub(art.src)), art.src).toBe(true)
      expect(p.banner.alt.length, p.slug).toBeGreaterThan(10)
    }
    for (const art of [RESEARCH.banner, RESEARCH.hero, ADMINISTRATION.banner, ADMINISTRATION.hero]) expect(existsSync(pub(art.src)), art.src).toBe(true)
  })
  it('keep contact details to the university’s own domain, and every link safe', () => {
    for (const p of OFFICE_PROFILES) {
      for (const e of p.emails ?? []) expect(e.endsWith('@uswat.edu.pk'), e).toBe(true)
      for (const ph of p.phones ?? []) expect(ph.number, p.slug).toMatch(/^\+?[\d-]{9,}$/)
      for (const l of p.links ?? []) expect(isSafeHref(l.href), l.href).toBe(true)
      for (const m of p.milestones ?? []) expect(m.date, p.slug).toMatch(DAY)
      expect(p.people.length, p.slug).toBeGreaterThan(0)
    }
    for (const r of RESEARCH.resources) expect(isSafeHref(r.href), r.href).toBe(true)
  })
  it('say nothing that is a placeholder', () => {
    const text = JSON.stringify([OFFICE_PROFILES, RESEARCH, ADMINISTRATION])
    expect(text).not.toMatch(/lorem|sample|invented|to be supplied|TBD/i)
  })
  it('are grouped and listed for the landing pages', () => {
    expect(officesListedOn('research').map((p) => p.slug)).toEqual(['oric-2', 'advanced-studies-and-research-board'])
    const groups = officesByGroup('administration')
    expect(groups.map((g) => g.group)).toEqual(GROUP_ORDER.filter((g) => groups.some((x) => x.group === g)))
    expect(groups.flatMap((g) => g.items).map((p) => p.slug)).toHaveLength(officesListedOn('administration').length)
    expect(profileForOffice('nope')).toBeUndefined()
  })
})
