import { existsSync } from 'node:fs'
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
    for (const p of departmentProfiles) all.push(p.hero, p.banner, ...p.labs.map((l) => l.art))
    for (const d of disciplineProfiles) all.push(d.hero, d.banner, d.tile, d.figure)
    for (const src of arts(all)) expect(existsSync(pub(src)), src).toBe(true)
    for (const d of disciplineProfiles) expect(d.tile.alt.length, d.slug).toBeGreaterThan(10)
  })

  it('has a four-year plan of eight semesters with no repeated course in a year', () => {
    for (const d of disciplineProfiles) {
      expect(
        d.years.map((y) => y.year),
        d.slug,
      ).toEqual([1, 2, 3, 4])
      for (const y of d.years) {
        const names = y.semesters.flatMap((s) => s.courses)
        expect(y.semesters).toHaveLength(2)
        for (const s of y.semesters)
          expect(s.courses.length, `${d.slug} ${s.name}`).toBeGreaterThanOrEqual(4)
        expect(new Set(names).size, `${d.slug} year ${y.year}`).toBe(names.length)
      }
    }
  })

  it('shares one first year across a department', () => {
    const first = (slug: string) => JSON.stringify(profileForDiscipline(slug)!.years[0])
    for (const p of departmentProfiles) {
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
    expect(JSON.stringify([departmentProfiles, disciplineProfiles])).not.toMatch(/sample/i)
  })

  it('has one head and a coordinator for every programme, with no contact details', () => {
    for (const p of departmentProfiles) {
      expect(p.team.filter((m) => m.role === 'head'), p.slug).toHaveLength(1)
      expect(p.team[0]?.role, 'the head comes first').toBe('head')
      expect(new Set(p.team.map((m) => m.id)).size).toBe(p.team.length)
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

  it('is still a draft until the department approves it', () => {
    for (const p of [...departmentProfiles, ...disciplineProfiles])
      expect(p.status, p.slug).toBe('draft')
  })
})
