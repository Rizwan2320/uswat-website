import { describe, expect, it } from 'vitest'

import { filterDepartments, type DepartmentOption } from '@/site/components/departmentFilter'

const all: DepartmentOption[] = [
  { name: 'Department of Computer Science', slug: 'computer-science' },
  { name: 'Department of English', slug: 'english' },
  { name: 'Department of Pharmacy', slug: 'pharmacy' },
  { name: 'Biotechnology & Genetic Engineering', slug: 'biotech' },
  { name: 'Zoology', slug: 'zoology' },
]
const slugs = (q: string) => filterDepartments(all, q).map((d) => d.slug)

describe('filterDepartments', () => {
  it('returns everything for an empty or blank query', () => {
    expect(slugs('')).toHaveLength(5)
    expect(slugs('   ')).toHaveLength(5)
  })
  it('matches part of a name, ignoring case', () => {
    expect(slugs('comp')).toEqual(['computer-science'])
    expect(slugs('PHARM')).toEqual(['pharmacy'])
  })
  it('matches words in any order', () => {
    expect(slugs('science computer')).toEqual(['computer-science'])
  })
  it('treats & as and', () => {
    expect(slugs('biotechnology and genetic')).toEqual(['biotech'])
  })
  it('ranks names that start with the text first', () => {
    expect(slugs('z')[0]).toBe('zoology')
    expect(slugs('e')[0]).toBe('english') // starts with e; the others only contain it
  })
  it('returns nothing when no name matches', () => {
    expect(slugs('astrophysics')).toEqual([])
  })
})
