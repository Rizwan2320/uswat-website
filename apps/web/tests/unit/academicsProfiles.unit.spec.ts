import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { departments, programmes } from '../../../../scripts/import/seeds/data'
import {
  coordinatorOf,
  departmentProfiles,
  disciplineProfiles,
  disciplinesOf,
  profileForDepartment,
  profileForDiscipline,
} from '../../src/site/academics/profiles'
import type { Art } from '../../src/site/academics/types'

const pub = (src: string) => path.resolve(__dirname, '../../public', src.replace(/^\//, ''))
const arts = (a: Art[]) => a.map((x) => x.src)

describe('department and discipline profiles', () => {
  it('match the seeded records by slug, both ways', () => {
    for (const p of departmentProfiles) {
      if (p.path) {
        // a faculty page with its own address has no department record: its programmes are seeded by slug
        for (const s of p.disciplines) expect(programmes.some((q) => q.slug === s), s).toBe(true)
        continue
      }
      expect(
        departments.some((d) => d.slug === p.slug),
        p.slug,
      ).toBe(true)
      const seeded = programmes
        .filter((q) => q.department === p.slug)
        .map((q) => q.slug)
        .sort()
      expect([...p.disciplines].sort(), p.slug).toEqual(seeded)
      for (const s of p.disciplines) expect(profileForDiscipline(s), s).not.toBeNull()
    }
    for (const d of disciplineProfiles)
      expect(profileForDepartment(d.department), d.slug).not.toBeNull()
  })

  it('names pictures that exist and describes the informative ones', () => {
    const all: Art[] = []
    for (const p of departmentProfiles)
      all.push(p.hero, p.banner, ...p.labs.map((l) => l.art), ...(p.heroBanner ? [p.heroBanner.photo] : []), ...(p.campusPhoto ? [p.campusPhoto] : []))
    for (const d of disciplineProfiles) all.push(d.hero, d.banner, d.tile, d.figure)
    for (const src of arts(all)) expect(existsSync(pub(src)), src).toBe(true)
    for (const d of disciplineProfiles) expect(d.tile.alt.length, d.slug).toBeGreaterThan(10)
  })

  it('gives the DCST hero one photograph (no slider), decorative, and a campus photograph for the statistics strip', () => {
    const dcst = departmentProfiles.find((p) => p.slug === 'dcst')!
    expect(dcst.heroBanner?.photo.alt).toBe('')
    expect(dcst.campusPhoto?.alt.length).toBeGreaterThan(10)
  })

  it('has a plan of two semesters a year (four years, five for the DPT) with no repeated course in a year', () => {
    for (const d of disciplineProfiles) {
      expect(
        d.years.map((y) => y.year),
        d.slug,
      ).toEqual(d.duration === '5 years' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4])
      for (const y of d.years) {
        const names = y.semesters.flatMap((s) => s.courses)
        expect(y.semesters).toHaveLength(2)
        for (const s of y.semesters)
          expect(s.courses.length, `${d.slug} ${s.name}`).toBeGreaterThanOrEqual(y.year === 5 ? 3 : 4)
        expect(new Set(names).size, `${d.slug} year ${y.year}`).toBe(names.length)
      }
    }
  })

  it('shares one first year across a department', () => {
    const first = (slug: string) => JSON.stringify(profileForDiscipline(slug)!.years[0])
    // A page that names real staff and its own study plans (`reference`) writes its own curriculum line, so the rule is for the template departments.
    for (const p of departmentProfiles.filter((d) => !d.path && !d.reference)) {
      for (const s of p.disciplines) expect(first(s), s).toBe(first(p.disciplines[0]))
    }
  })

  it('has content in every list and says "Sample" nowhere (owner decision 2026-11-20)', () => {
    for (const p of departmentProfiles) {
      for (const k of [
        'about',
        'highlights',
        'labs',
        'research',
        'careers',
        'studentLife',
        'faq',
      ] as const)
        expect(p[k].length, `${p.slug}.${k}`).toBeGreaterThanOrEqual(2)
    }
    for (const d of disciplineProfiles) {
      for (const k of [
        'about',
        'whyStudy',
        'outcomes',
        'tracks',
        'skills',
        'careers',
        'faq',
      ] as const)
        expect(d[k].length, `${d.slug}.${k}`).toBeGreaterThanOrEqual(2)
      expect(disciplinesOf(d.department)).toContain(d)
    }
    // "Sample" as a label (the lab word "sample handling" is fine)
    expect(JSON.stringify([departmentProfiles, disciplineProfiles])).not.toMatch(
      /\bsample (page|content|data|text|entry|department|programme)\b|\(sample\)|\[sample\]/i,
    )
  })

  it('has one head and a coordinator for every programme, with no contact details', () => {
    for (const p of departmentProfiles) {
      // A department whose staff come from the university's page (`reference`) may have no head when the page names none (Agricultural Sciences and Forestry).
      const heads = p.team.filter((m) => m.role === 'head')
      // A department the owner asked to be invented (Climate Change and Disaster Management, 2026-11-28) names no staff at all; its page says so.
      if (p.reference && heads.length === 0 && p.team.length === 0) expect(p.status, p.slug).toBe('draft')
      else if (p.reference && heads.length === 0) expect(p.team.length, p.slug).toBeGreaterThan(0)
      else {
        expect(heads, p.slug).toHaveLength(1)
        expect(p.team[0]?.role, 'the head comes first').toBe('head')
      }
      expect(new Set(p.team.map((m) => m.id)).size).toBe(p.team.length)
      if (p.path || p.reference) continue // a faculty page, or a department whose staff come from the university's page, which names no programme coordinators
      for (const slug of p.disciplines) {
        const who = coordinatorOf(p.slug, slug)
        expect(who, `${slug} has a coordinator`).not.toBeNull()
        expect(who?.role).toBe('coordinator')
      }
      // each programme has exactly one coordinator
      for (const slug of p.disciplines)
        expect(p.team.filter((m) => m.coordinates?.includes(slug)), slug).toHaveLength(1)
      for (const m of p.team) for (const slug of m.coordinates ?? []) expect(p.disciplines).toContain(slug)
    }
    expect(JSON.stringify(departmentProfiles.map((p) => p.team))).not.toMatch(/@|\+92|tel:|mailto/i)
  })

  it('names a photo file only when it exists', () => {
    for (const p of departmentProfiles)
      for (const m of p.team) if (m.photo) expect(existsSync(pub(m.photo)), m.id).toBe(true)
  })

  it('has a head of department with a portrait, whom the About band shows in the green card (RichDepartmentPage)', () => {
    const dcst = departmentProfiles.find((p) => p.slug === 'dcst')!
    const heads = dcst.team.filter((m) => m.role === 'head')
    expect(heads).toHaveLength(1)
    expect(heads[0].photo, 'portrait path').toMatch(/^\/images\/faculty\/.+\.jpg$/)
    expect(existsSync(pub(heads[0].photo!))).toBe(true)
    const page = readFileSync(path.join(process.cwd(), 'src/site/academics/RichDepartmentPage.tsx'), 'utf8')
    expect(page).toContain('<HeadIntroCard')
  })

  it('is still a draft until the department approves it', () => {
    for (const p of [...departmentProfiles, ...disciplineProfiles])
      expect(p.status, p.slug).toBe('draft')
  })
})
