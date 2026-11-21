import type { DepartmentProfile, DisciplineProfile } from '../types'

import { ai } from './ai'
import { cs } from './cs'
import { dcst } from './dcst'
import { ds } from './ds'
import { it } from './it'
import { se } from './se'

/* Register a profile here and its department or programme page switches to the rich layout. */
export const departmentProfiles: DepartmentProfile[] = [dcst]
export const disciplineProfiles: DisciplineProfile[] = [cs, se, it, ds, ai]

export const profileForDepartment = (slug: string) =>
  departmentProfiles.find((p) => p.slug === slug) ?? null
export const profileForDiscipline = (slug: string) =>
  disciplineProfiles.find((p) => p.slug === slug) ?? null
export const disciplinesOf = (department: string) =>
  disciplineProfiles.filter((d) => d.department === department)
