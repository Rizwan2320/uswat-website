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
      // a page with no people (E-Office, the lists of elections, headlines and projects) has at least one list or paragraph
      expect(p.people.length + (p.itemLists?.length ?? 0) + (p.about?.length ?? 0), p.slug).toBeGreaterThan(0)
    }
    for (const r of RESEARCH.resources) expect(isSafeHref(r.href), r.href).toBe(true)
  })
  it('say nothing that is a placeholder', () => {
    const text = JSON.stringify([OFFICE_PROFILES, RESEARCH, ADMINISTRATION])
    expect(text).not.toMatch(/lorem|sample|invented|to be supplied|TBD/i)
  })
  it('are grouped and listed for the landing pages', () => {
    expect(officesListedOn('research').map((p) => p.slug)).toEqual(['oric-2', 'advanced-studies-and-research-board', 'directorate-of-research-and-technological-development'])
    const groups = officesByGroup('administration')
    expect(groups.map((g) => g.group)).toEqual(GROUP_ORDER.filter((g) => groups.some((x) => x.group === g)))
    expect(groups.flatMap((g) => g.items).map((p) => p.slug)).toHaveLength(officesListedOn('administration').length)
    expect(profileForOffice('nope')).toBeUndefined()
  })
  it('counts in the stats match the lists on the pages built from the saved copies (round 2)', () => {
    const by = (slug: string) => profileForOffice(slug)!
    expect(by('directorate-of-admissions').stats?.[0].value).toBe(by('directorate-of-admissions').itemLists?.[0].items.length)
    expect(by('directorate-of-admissions').stats?.[1].value).toBe(by('directorate-of-admissions').people.length)
    expect(by('treasurer-office').stats?.[0].value).toBe(by('treasurer-office').people.length)
    expect(by('treasurer-office').stats?.[1].value).toBe(by('treasurer-office').itemLists?.[0].items.length)
    const pv = by('provost-office')
    expect([pv.stats?.[0].value, pv.stats?.[1].value, pv.stats?.[2].value]).toEqual([pv.itemLists?.[0].items.length, pv.people.length, pv.itemLists?.[1].items.length])
    const fa = by('university-advancement-financial-aid-office')
    expect(fa.stats?.[0].value).toBe(fa.itemLists?.[1].items.length)
    expect(fa.stats?.[1].value).toBe(fa.people.length)
    expect(by('press-release').stats?.[0].value).toBe(by('press-release').itemLists?.[0].items.length)
    expect(by('registeror-office').stats?.[0].value).toBe(by('registeror-office').people.length)
    expect(by('directorate-of-planning-and-development').stats?.[0].value).toBe(by('directorate-of-planning-and-development').people.length)
  })
  it('shows an office address, never a person’s, and no personal mailbox of a named officer', () => {
    const personal = /^(drkhan|afsheenmaryam|osama\.habib|s\.shah|mahboob|tahir|umarhayat|khurshid|skshahid|mahrukhanum|arasool|neelammarwat|asif\.saud|khalidtr|amjadiqbal|arshadhussain|sangeenkhan|mansoor|storeofficer|rahmanullah|muhammad|haroon|sadeeq|naveediqbal|najeeb)@/
    for (const p of OFFICE_PROFILES) for (const e of p.emails ?? []) expect(e, p.slug).not.toMatch(personal)
  })
})
