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
import { biotechnology, bsBiotechnology, bsGenetics, bsMicrobiology } from './sciences/biotechnology'
import { botany, bsBotany } from './sciences/botany'
import { chemistry, bsChemistry } from './sciences/chemistry'
import { forestry, bsForestry } from './sciences/forestry'
import { mathematics, bsMathematics, bsStatistics } from './sciences/mathematics'
import { physics, bsPhysics } from './sciences/physics'
import { psychology, bsPsychology } from './sciences/psychology'
import { zoology, bsZoology } from './sciences/zoology'

/* Register a profile here and its department or programme page switches to the rich layout. */
export const departmentProfiles: DepartmentProfile[] = [dcst, alliedHealth, physics, chemistry, mathematics, botany, zoology, biotechnology, psychology, forestry]
export const disciplineProfiles: DisciplineProfile[] = [cs, se, it, ds, ai, mlt, dt, dpt, rit, bsPhysics, bsChemistry, bsMathematics, bsStatistics,
  bsBotany, bsZoology, bsBiotechnology, bsGenetics, bsMicrobiology, bsPsychology, bsForestry]

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
