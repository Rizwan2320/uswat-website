import { disciplineProfiles, departmentProfiles } from '../academics/profiles'
import { facultyProgrammeProfiles } from '../faculties'
import { PAGE_PROFILES } from '../offices/profiles'

import { departmentHref, programmeHref } from './shape'

/* Departments and programmes whose pages are written in code (they open without a CMS record). The top-bar search lists
   them next to the CMS records, so it is not empty on a site whose CMS holds no content yet. No CMS, no I/O. */
export type SearchOption = { name: string; slug: string; group: string; href: string }

/** Full names the department profile does not carry (it has a short name only). From the owner (2026-11-20). */
const DEPARTMENT_NAMES: Record<string, string> = {
  dcst: 'Department of Computer and Software Technologies (DCST)',
}

/** 'bs-computer-science' -> 'BS Computer Science'. */
const programmeNameFromSlug = (slug: string) =>
  slug
    .split('-')
    .map((w) => (w === 'bs' || w === 'ms' || w === 'phd' ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')

export function codeSearchOptions(): SearchOption[] {
  const departments: SearchOption[] = [
    ...departmentProfiles.map((p) => ({
      name: DEPARTMENT_NAMES[p.slug] ?? p.shortName,
      slug: p.slug,
      group: 'Department',
      href: departmentHref(p.slug),
    })),
    ...PAGE_PROFILES.filter((p) => p.group === 'Departments' && p.path).map((p) => ({
      name: p.name,
      slug: p.slug,
      group: 'Department',
      href: p.path as string,
    })),
  ]
  const programmes: SearchOption[] = [
    ...disciplineProfiles.map((p) => ({
      name: programmeNameFromSlug(p.slug),
      slug: p.slug,
      group: 'Programme',
      href: programmeHref(p.slug),
    })),
    ...facultyProgrammeProfiles.map((p) => ({
      name: p.name,
      slug: p.slug,
      group: 'Programme',
      href: programmeHref(p.slug),
    })),
  ]
  return [...departments, ...programmes]
}
