import { describe, expect, it } from 'vitest'

import { filterDepartments } from '@/site/components/departmentFilter'
import { codeSearchOptions } from '@/site/organisation/codeOptions'

describe('codeSearchOptions (top-bar search on an empty CMS)', () => {
  const all = codeSearchOptions()

  it('lists the departments and programmes that have pages in code', () => {
    const hrefs = all.map((o) => o.href)
    for (const h of [
      '/academics/departments/dcst',
      '/academics/departments/geology',
      '/academics/departments/archaeology',
      '/academics/departments/environmental-sciences',
      '/academics/departments/economics-and-development-studies',
      '/academics/departments/management-commerce',
      '/academics/departments/english-and-foreign-languages',
      '/academics/programmes/bs-computer-science',
      '/academics/programmes/bs-software-engineering',
      '/academics/programmes/bs-medical-laboratory-technology',
    ]) {
      expect(hrefs).toContain(h)
    }
  })
  it('has no duplicate address and a name for every option', () => {
    expect(new Set(all.map((o) => o.href)).size).toBe(all.length)
    expect(all.every((o) => o.name.trim().length > 2)).toBe(true)
  })
  it('does not list offices or services as departments', () => {
    expect(all.some((o) => o.href.startsWith('/administration'))).toBe(false)
  })
  it('is found by typing part of a name', () => {
    expect(filterDepartments(all, 'geo').map((o) => o.slug)).toContain('geology')
    expect(filterDepartments(all, 'software').length).toBeGreaterThanOrEqual(2)
  })
})
