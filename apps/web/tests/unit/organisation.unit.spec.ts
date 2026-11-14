import { describe, expect, it } from 'vitest'

import {
  byName,
  departmentHref,
  groupBy,
  isSample,
  officeHref,
  paragraphs,
  programmeHref,
  toDepartmentCard,
  toProgrammeCard,
} from '../../src/site/organisation/shape'

describe('isSample', () => {
  it('is true only for a source on sample.invalid', () => {
    expect(isSample({ id: 1, governance: { source: 'https://sample.invalid/seed/departments/x' } })).toBe(true)
    expect(isSample({ id: 1, governance: { source: 'https://uswat.edu.pk/department-of-botany/' } })).toBe(false)
    expect(isSample({ id: 1, governance: { source: 'https://sample.invalid.example.com/x' } })).toBe(false)
    expect(isSample({ id: 1, governance: { source: 'not a url' } })).toBe(false)
    expect(isSample({ id: 1 })).toBe(false)
  })
})

describe('paragraphs', () => {
  it('splits on blank lines and drops empties', () => {
    expect(paragraphs('One\nstill one\n\n\nTwo\n\n  ')).toEqual(['One\nstill one', 'Two'])
    expect(paragraphs('')).toEqual([])
    expect(paragraphs(null)).toEqual([])
  })
})

describe('hrefs', () => {
  it('have no trailing slash and escape the slug', () => {
    expect(departmentHref('sample-department-of-physics')).toBe('/academics/departments/sample-department-of-physics')
    expect(programmeHref('a b')).toBe('/academics/programmes/a%20b')
    expect(officeHref('sample-library')).toBe('/administration/sample-library')
  })
})

describe('groupBy and byName', () => {
  it('keeps first-seen group order and sorts names without regard to case', () => {
    const g = groupBy(['b1', 'a1', 'b2'], (x) => ({ id: x[0], label: x[0].toUpperCase() }))
    expect(g.map((x) => [x.id, x.items])).toEqual([['b', ['b1', 'b2']], ['a', ['a1']]])
    expect([{ name: 'beta' }, { name: 'Alpha' }].sort(byName).map((x) => x.name)).toEqual(['Alpha', 'beta'])
  })
})

describe('cards', () => {
  it('turns a department with a populated group into a card, and a bare one into the "other" group', () => {
    const d = { id: 1, name: 'Sample Department of Physics', slug: 'p', summary: ' text ', facultyGroup: { id: 7, name: 'Sample Faculty of Sciences' } }
    expect(toDepartmentCard(d)).toMatchObject({ groupId: '7', groupName: 'Sample Faculty of Sciences', summary: 'text' })
    expect(toDepartmentCard({ id: 2, name: 'X', slug: 'x', facultyGroup: 5 })).toMatchObject({ groupName: 'Other departments' })
    expect(toDepartmentCard({ id: 3, name: '', slug: 'x' })).toBeNull()
  })
  it('turns a programme into a card with department and campus names when populated', () => {
    const p = { id: 1, name: 'Sample BS Physics', slug: 'bs', level: 'BS', duration: null, department: { id: 4, name: 'Sample Department of Physics' }, campus: { id: 2, name: 'Sample Main Campus' } }
    expect(toProgrammeCard(p)).toMatchObject({ departmentId: '4', departmentName: 'Sample Department of Physics', campus: 'Sample Main Campus', duration: null })
    expect(toProgrammeCard({ id: 2, name: 'Y', slug: 'y', department: 9 })).toMatchObject({ departmentName: 'Other programmes', campus: null })
  })
})
