import { describe, expect, it } from 'vitest'

import { SAMPLE_HOST } from '../../../../scripts/import/seeds/data'
import { departmentsOf, filterPeople, initialsOf, parseFilters, personHref, photoOf, toPersonCard, toPersonProfile, type PersonCard } from '../../src/site/people/shape'

const dept = { id: 7, name: 'Department of Computer Science', slug: 'computer-science' }
const base = { id: 1, name: 'Dr. Hina Farooq', slug: 'hina-farooq', designation: 'Assistant Professor', department: dept, facultyStatus: 'current' }
const media = { url: '/media/hina.jpg', alt: 'Dr Hina', rightsStatus: 'owned' }

describe('person card', () => {
  it('needs a name and a slug', () => {
    expect(toPersonCard({ id: 1, name: 'A' })).toBeNull()
    expect(toPersonCard({ id: 1, slug: 'a' })).toBeNull()
  })
  it('carries the department and marks Sample records', () => {
    const c = toPersonCard({ ...base, governance: { source: `https://${SAMPLE_HOST}/x` } })!
    expect(c).toMatchObject({ slug: 'hina-farooq', departmentSlug: 'computer-science', departmentName: dept.name, sample: true })
  })
  it('builds an encoded address', () => {
    expect(personHref('a b')).toBe('/people/a%20b')
  })
})

describe('photo', () => {
  it('is drawn only with a safe address and rights that are known and not blocking', () => {
    expect(photoOf({ ...base, photo: media }, 'x')).toEqual({ src: '/media/hina.jpg', alt: 'Dr Hina' })
    expect(photoOf({ ...base, photo: { ...media, url: 'javascript:alert(1)' } }, 'x')).toBeNull()
    expect(photoOf({ ...base, photo: { ...media, url: 'http://insecure.example/a.jpg' } }, 'x')).toBeNull()
    expect(photoOf({ ...base, photo: { ...media, rightsStatus: undefined } }, 'x')).toBeNull()
  })
  it('is absent when the field rule removed it (visibility not Public)', () => {
    expect(photoOf(base, 'x')).toBeNull()
    expect(photoOf({ ...base, photo: 12 }, 'x')).toBeNull()
  })
  it('falls back to the name as alt text', () => {
    expect(photoOf({ ...base, photo: { ...media, alt: '' } }, 'Dr. Hina Farooq')?.alt).toBe('Dr. Hina Farooq')
  })
})

describe('person profile', () => {
  it('splits the introduction into paragraphs and keeps only safe links', () => {
    const p = toPersonProfile({
      ...base,
      details: 'First.\n\nSecond.',
      cvLink: 'https://example.org/cv.pdf',
      publications: [{ id: 'a', title: 'A paper', url: 'https://doi.org/10.1/x' }, { title: 'No link' }, { title: 'Bad', url: 'javascript:1' }, { title: '  ' }],
    })!
    expect(p.about).toEqual(['First.', 'Second.'])
    expect(p.cvHref).toBe('https://example.org/cv.pdf')
    expect(p.publications.map((x) => [x.title, x.href])).toEqual([['A paper', 'https://doi.org/10.1/x'], ['No link', null], ['Bad', null]])
  })
  it('refuses an unsafe CV address', () => {
    expect(toPersonProfile({ ...base, cvLink: 'javascript:alert(1)' })!.cvHref).toBeNull()
  })
  it('shows a public email as a link, but a Sample email as plain text', () => {
    expect(toPersonProfile({ ...base, email: 'h@uswat.example' })).toMatchObject({ email: 'h@uswat.example', emailHref: 'mailto:h@uswat.example' })
    const s = toPersonProfile({ ...base, email: 'h@uswat.example', governance: { source: `https://${SAMPLE_HOST}/x` } })!
    expect(s.email).toBe('h@uswat.example')
    expect(s.emailHref).toBeNull()
  })
  it('has no email when the record does not carry one (visibility hidden)', () => {
    expect(toPersonProfile(base)).toMatchObject({ email: null, emailHref: null })
  })
  it('keeps the status and defaults an unknown one to current', () => {
    expect(toPersonProfile({ ...base, facultyStatus: 'emeritus' })!.status).toBe('emeritus')
    expect(toPersonProfile({ ...base, facultyStatus: 'x' })!.status).toBe('current')
  })
})

describe('filters', () => {
  const people: PersonCard[] = [
    { id: 1, slug: 'hina-farooq', name: 'Dr. Hina Farooq', designation: 'Assistant Professor', departmentSlug: 'cs', departmentName: 'Computer Science', photo: null, sample: false },
    { id: 2, slug: 'zahid-karim', name: 'Prof. Zahid Karim', designation: 'Professor and Head of Department', departmentSlug: 'cs', departmentName: 'Computer Science', photo: null, sample: false },
    { id: 3, slug: 'tariq', name: 'Tariq Mehmood', designation: 'Registrar', departmentSlug: null, departmentName: null, photo: null, sample: false },
  ]
  it('keeps a known department and drops an unknown one', () => {
    expect(parseFilters({ department: 'cs' }, ['cs'])).toEqual({ q: '', department: 'cs' })
    expect(parseFilters({ department: 'nope' }, ['cs'])).toEqual({ q: '', department: null })
  })
  it('trims, collapses spaces and caps the name at 60 characters', () => {
    expect(parseFilters({ q: '  hina   farooq ' }, []).q).toBe('hina farooq')
    expect(parseFilters({ q: 'x'.repeat(200) }, []).q).toHaveLength(60)
    expect(parseFilters({ q: ['a', 'b'] }, []).q).toBe('a')
  })
  it('matches every word, in any order, ignoring case', () => {
    expect(filterPeople(people, { q: 'FAROOQ hina', department: null }).map((p) => p.slug)).toEqual(['hina-farooq'])
    expect(filterPeople(people, { q: 'professor', department: null }).map((p) => p.slug)).toEqual(['hina-farooq', 'zahid-karim'])
  })
  it('filters by department and by both together', () => {
    expect(filterPeople(people, { q: '', department: 'cs' })).toHaveLength(2)
    expect(filterPeople(people, { q: 'zahid', department: 'cs' }).map((p) => p.slug)).toEqual(['zahid-karim'])
    expect(filterPeople(people, { q: 'tariq', department: 'cs' })).toEqual([])
  })
  it('lists only departments that have people', () => {
    expect(departmentsOf(people)).toEqual([{ slug: 'cs', name: 'Computer Science' }])
  })
})

describe('initials', () => {
  it('leaves titles out and handles Urdu names', () => {
    expect(initialsOf('Dr. Hina Farooq')).toBe('HF')
    expect(initialsOf('Prof. Zahid Karim')).toBe('ZK')
    expect(initialsOf('ڈاکٹر حنا')).toBe('ڈح')
  })
})
