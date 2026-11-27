import type { DepartmentProfile, DisciplineProfile } from '../types'

import { ai } from './ai'
import { alliedHealth } from './allied/ahs'
import { dpt } from './allied/dpt'
import { dt } from './allied/dt'
import { mlt } from './allied/mlt'
import { rit } from './allied/rit'
import { cs } from './cs'
import { dcst } from './dcst'
import { ds } from './ds'
import { it } from './it'
import { se } from './se'

/* Register a profile here and its department or programme page switches to the rich layout. */
export const departmentProfiles: DepartmentProfile[] = [dcst, alliedHealth]
export const disciplineProfiles: DisciplineProfile[] = [cs, se, it, ds, ai, mlt, dt, dpt, rit]

export const profileForDepartment = (slug: string) =>
  departmentProfiles.find((p) => p.slug === slug) ?? null
export const profileForDiscipline = (slug: string) =>
  disciplineProfiles.find((p) => p.slug === slug) ?? null
export const disciplinesOf = (department: string) =>
  disciplineProfiles.filter((d) => d.department === department)

/** The person who coordinates a programme, from the department's team. */
export const coordinatorOf = (department: string, programmeSlug: string) =>
  profileForDepartment(department)?.team.find((m) => m.coordinates?.includes(programmeSlug)) ?? null

/** The address of a department's page: its own `path` (a faculty page) or the department route. */
export const departmentPath = (p: DepartmentProfile) => p.path ?? `/academics/departments/${p.slug}`
