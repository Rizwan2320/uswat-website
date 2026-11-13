import { describe, expect, it } from 'vitest'

import { SAMPLE_HOST, SAMPLE_OWNER_OFFICE, departments, offices, people, programmes, sampleSource } from '../../../../scripts/import/seeds/data'
import { seedRows } from '../../../../scripts/import/seeds/apply'

const rows = seedRows()
const all = Object.entries(rows).flatMap(([c, rs]) => rs.map((r) => ({ c, ...r })))

describe('Sample seed data', () => {
  it('has the planned counts', () => {
    expect(Object.fromEntries(Object.entries(rows).map(([c, r]) => [c, r.length]))).toEqual({
      faculties: 3, campuses: 2, people: 10, offices: 4, departments: 8, programmes: 14,
    })
  })
  it('labels every record Sample and gives it a sample.invalid source', () => {
    for (const r of all) {
      expect(r.name.startsWith('Sample'), r.name).toBe(true)
      expect(r.slug.startsWith('sample-'), r.slug).toBe(true)
      expect(sampleSource(r.c, r.slug)).toContain(`https://${SAMPLE_HOST}/seed/`)
    }
    expect(SAMPLE_OWNER_OFFICE.startsWith('Sample')).toBe(true)
  })
  it('has unique slugs and unique names inside each collection', () => {
    for (const [c, rs] of Object.entries(rows)) {
      expect(new Set(rs.map((r) => r.slug)).size, c).toBe(rs.length)
      expect(new Set(rs.map((r) => r.name)).size, c).toBe(rs.length)
    }
  })
  it('resolves every reference', () => {
    const has = (c: keyof typeof rows, slug: string) => rows[c].some((r) => r.slug === slug)
    for (const d of departments) {
      expect(has('faculties', d.facultyGroup), d.slug).toBe(true)
      expect(has('people', d.head), d.slug).toBe(true)
    }
    for (const o of offices) expect(has('people', o.head), o.slug).toBe(true)
    for (const p of programmes) {
      expect(has('departments', p.department), p.slug).toBe(true)
      expect(has('campuses', p.campus), p.slug).toBe(true)
    }
  })
  it('every department has a programme and every faculty group a department', () => {
    for (const d of departments) expect(programmes.some((p) => p.department === d.slug), d.slug).toBe(true)
    for (const f of rows.faculties) expect(departments.some((d) => d.facultyGroup === f.slug), f.slug).toBe(true)
  })
  it('uses no address outside sample.invalid and shows exactly one public email', () => {
    const text = JSON.stringify([people, offices, departments])
    const emails = text.match(/[\w.+-]+@[\w.-]+/g) ?? []
    expect(emails.length).toBeGreaterThan(0)
    for (const e of emails) expect(e.endsWith(`@${SAMPLE_HOST}`), e).toBe(true)
    expect(text).not.toMatch(/https?:\/\/(?!sample\.invalid)|\+?\d{7,}/)
    expect(people.filter((p) => p.emailPublic)).toHaveLength(1)
  })
})
