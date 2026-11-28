import { describe, expect, it } from 'vitest'

import {
  PAGE_PARTS,
  describeParts,
  partCountText,
  partsSummary,
} from '../../src/governance/pageSections'
import { departmentPageContent, programmePageContent } from '../../src/collections/academics/profileToCms'
import { departmentProfiles, disciplineProfiles } from '../../src/site/academics/profiles'

describe('the parts of a department or programme page (slice 3ar)', () => {
  it('lists 12 parts for a department and 11 for a programme, all empty on a new record', () => {
    expect(describeParts('departments', {})).toHaveLength(12)
    expect(describeParts('programmes', {})).toHaveLength(11)
    expect(describeParts('departments', null).every((p) => !p.filled)).toBe(true)
    expect(partsSummary(describeParts('programmes', {}))).toBe('0 of 11 parts filled')
  })

  it('counts text as filled, rows by length, pictures by how many are chosen', () => {
    const parts = describeParts('departments', {
      vision: '  ',
      mission: 'Teach well.',
      pageContent: {
        intro: 'A line.',
        labs: [{}, {}, {}],
        faq: [],
        heroImage: 3,
        campusPhoto: null,
      },
    })
    const by = Object.fromEntries(parts.map((p) => [p.key, p]))
    expect(by.vision!.filled).toBe(false)
    expect(by.mission!.filled).toBe(true)
    expect(by.intro!.count).toBe(1)
    expect(by.labs!.count).toBe(3)
    expect(by.faq!.filled).toBe(false)
    expect(by.pictures!.count).toBe(1)
    expect(partCountText(by.labs!)).toBe('3 rows')
    expect(partCountText(by.pictures!)).toBe('1 picture')
    expect(partCountText(by.intro!)).toBe('Filled')
    expect(partCountText(by.faq!)).toContain('standard text')
    expect(partCountText(by.alumni!)).toBe('Empty: the page shows example entries')
    expect(partCountText({ ...by.pictures!, count: 0, filled: false })).toContain('artwork')
  })

  it('does not list fields the public page does not show', () => {
    const keys = PAGE_PARTS.departments.map((p) => p.key)
    expect(keys).not.toContain('location')
    expect(keys).not.toContain('officeHours')
    expect(keys).not.toContain('tagline')
    expect(PAGE_PARTS.programmes.map((p) => p.key)).not.toContain('tagline')
  })

  it('every part is a field of pageContent that the merge reads, so a checklist never promises what the page ignores', () => {
    const dept = departmentPageContent(departmentProfiles[0]!) as Record<string, unknown>
    const prog = programmePageContent(disciplineProfiles[0]!) as Record<string, unknown>
    // Alumni is written only in the CMS (slice 3at): the code's alumni are sample entries and are never seeded as real.
    const topLevel = new Set(['vision', 'mission', 'pictures', 'alumni'])
    for (const p of PAGE_PARTS.departments)
      if (!topLevel.has(p.key)) expect(Object.keys(dept), p.key).toContain(p.key)
    for (const p of PAGE_PARTS.programmes)
      if (!topLevel.has(p.key)) expect(Object.keys(prog), p.key).toContain(p.key)
  })

  it('a seeded profile fills every text and list part', () => {
    const parts = describeParts('departments', { pageContent: departmentPageContent(departmentProfiles[0]!) })
    for (const p of parts.filter(
      (x) => x.kind !== 'pictures' && !['vision', 'mission', 'alumni'].includes(x.key),
    ))
      expect(p.filled, p.key).toBe(true)
  })
})
