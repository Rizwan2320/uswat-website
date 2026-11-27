import { describe, expect, it } from 'vitest'

import { SAMPLE_HOST, SAMPLE_OWNER_OFFICE, departments, offices, people, programmes, sampleSource } from '../../../../scripts/import/seeds/data'
import { seedRows } from '../../../../scripts/import/seeds/apply'

const rows = seedRows()
const all = Object.entries(rows).flatMap(([c, rs]) => rs.map((r) => ({ c, ...r })))

describe('Sample seed data', () => {
  it('has the planned counts', () => {
    expect(Object.fromEntries(Object.entries(rows).map(([c, r]) => [c, r.length]))).toEqual({
      faculties: 4, campuses: 3, people: 14, offices: 31, departments: 21, programmes: 34,
    })
  })
  it('labels every invented record Sample and gives every record a sample.invalid source', () => {
    // Owner decision 2026-11-20: records that carry the university's real structure show their real names. These are the
    // campuses, the Department of Computer and Software Technologies with its programmes, and the nine offices that have a rich page
    // (Research and Administration, 2026-11-22; their facts and sources live in src/site/offices/profiles). Their source is still sample.invalid,
    // the machine marker, because their text is not yet checked.
    const REAL_OFFICES = ['oric-2', 'advanced-studies-and-research-board', 'directorate-of-it', 'controller-of-examination-office', 'directorate-of-works', 'proctorial-board', 'kamyab-jawan-markaz', 'alumni', 'hunerkada-center-for-excellence',
      // 2026-11-25: the eighteen offices built from the saved copies in round 2 (src/site/offices/profiles).
      'directorate-of-research-and-technological-development', 'directorate-of-admissions', 'directorate-of-administration', 'directorate-of-planning-and-development', 'registeror-office', 'treasurer-office', 'provost-office', 'vc-office', 'office-of-the-pro-vice-chancellor-pro-vc', 'university-advancement-financial-aid-office', 'e-office', 'dean-office-3', 'election-administrative-officers-and-faculty-members', 'press-release', 'developmental-projects', 'directorate-of-sports', 'office-365', 'office-of-the-deans']
    // 2026-11-22: the Faculty of Allied Health Sciences, its two centres and four programmes (src/site/academics/profiles/allied; sources and dates are there).
    const REAL_ALLIED = ['faculty-of-allied-health-sciences', 'centre-for-medical-technologies', 'centre-for-pharmaceutical-and-rehabilitation-sciences', 'bs-medical-laboratory-technology', 'bs-dental-technology', 'doctor-of-physical-therapy', 'bs-radiography-and-imaging-technology']
    // 2026-11-26: the Physics, Chemistry, and Mathematics and Statistics departments and their programmes (src/site/academics/profiles/sciences).
    const REAL_SCIENCES = ['physics', 'chemistry', 'mathematics-and-statistics', 'bs-physics-2', 'bs-chemistry-2', 'bs-mathematics-2', 'bs-statistics',
      // 2026-11-27: the life-science departments and their programmes (src/site/academics/profiles/sciences).
      'botany', 'zoology', 'biotechnology-genetics-forensic-and-microbiology', 'psychological-studies', 'agricultural-sciences-and-forestry',
      'bs-botany-2', 'bs-zoology-2', 'bs-biotechnology-3', 'bs-genetics-3', 'bs-microbiology-3', 'bs-psychology-2', 'bs-forestry',
      // 2026-11-27: the six departments that were office-style pages, and their programmes.
      'geology', 'archaeology', 'environmental-sciences', 'economics-and-development-studies', 'english-and-foreign-languages', 'management-commerce',
      'bs-geology-2', 'bs-archaeology', 'bs-environmental-sciences', 'bs-economics-2', 'bs-development-studies-2', 'bs-english-2', 'bba-hons-2']
    const real = (r: { c: string; slug: string }) =>
      REAL_ALLIED.includes(r.slug) || REAL_SCIENCES.includes(r.slug) || r.c === 'campuses' || (r.c === 'offices' && REAL_OFFICES.includes(r.slug)) || (r.c === 'departments' && r.slug === 'dcst') || (r.c === 'programmes' && programmes.find((p) => p.slug === r.slug)?.department === 'dcst')
    for (const r of all) {
      if (!real(r)) {
        expect(r.name.startsWith('Sample'), r.name).toBe(true)
        expect(r.slug.startsWith('sample-'), r.slug).toBe(true)
      }
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
      if (d.head) expect(has('people', d.head), d.slug).toBe(true)
    }
    for (const o of offices) if (o.head) expect(has('people', o.head), o.slug).toBe(true)
    for (const p of programmes) {
      if (p.department) expect(has('departments', p.department), p.slug).toBe(true)
      if (p.campus) expect(has('campuses', p.campus), p.slug).toBe(true)
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
