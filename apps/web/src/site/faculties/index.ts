import { alliedHealth, alliedHealthProgrammes } from './allied-health'
import type { FacultyProfile, FacultyProgramme } from './types'

/* Register a faculty or programme profile here and its page appears (faculty route) or switches to the rich layout (programme route). */
export const facultyProfiles: FacultyProfile[] = [alliedHealth]
export const facultyProgrammeProfiles: FacultyProgramme[] = [...alliedHealthProgrammes]

export const profileForFaculty = (slug: string) => facultyProfiles.find((f) => f.slug === slug) ?? null
export const profileForFacultyProgramme = (slug: string) => facultyProgrammeProfiles.find((p) => p.slug === slug) ?? null
export const programmesOfFaculty = (faculty: string) => facultyProgrammeProfiles.filter((p) => p.faculty === faculty)
