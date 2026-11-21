/**
 * Sample organisation data (brief p4-seeds). Invented, not institutional facts: every name starts
 * with "Sample", every address is on sample.invalid, and nothing here names a real person. Replace
 * with real, sourced rows when the owner supplies the data pack.
 */

export const SAMPLE_HOST = 'sample.invalid'
export const SAMPLE_OWNER_OFFICE = 'Sample owner office'
export const sampleSource = (collection: string, slug: string) =>
  `https://${SAMPLE_HOST}/seed/${collection}/${slug}`

export type FacultyGroupSeed = { slug: string; name: string }
export type CampusSeed = { slug: string; name: string }
export type OfficeSeed = { slug: string; name: string; group: string; hours: string; email?: string; head: string }
export type PersonSeed = {
  slug: string
  name: string
  designation: string
  details: string
  email: string
  /** Only one Sample person shows an email in public, so a template can show both cases. */
  emailPublic?: boolean
  /** Department slug; only set for people shown on a department page. */
  department?: string
}
export type DepartmentSeed = { slug: string; name: string; facultyGroup: string; head: string; summary: string; vision?: string; mission?: string; emails?: string[] }
export type ProgrammeSeed = {
  slug: string
  name: string
  department: string
  campus: string
  level: string
  duration: string
  eligibility?: string
}

export const facultyGroups: FacultyGroupSeed[] = [
  { slug: 'sample-faculty-of-sciences', name: 'Sample Faculty of Sciences' },
  { slug: 'sample-faculty-of-arts-and-humanities', name: 'Sample Faculty of Arts and Humanities' },
  { slug: 'sample-faculty-of-social-and-management-sciences', name: 'Sample Faculty of Social and Management Sciences' },
]

export const campuses: CampusSeed[] = [
  // Slugs are the ones the route map expects for /campuses/{slug}. The campus names are the university's own.
  { slug: 'main', name: 'Main Campus' },
  { slug: 'sangota', name: 'Sangota Campus' },
  { slug: 'women', name: 'Women Campus' },
]

export const people: PersonSeed[] = Array.from({ length: 10 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  const designations = [
    'Professor', 'Associate Professor', 'Assistant Professor', 'Professor', 'Associate Professor',
    'Assistant Professor', 'Professor', 'Lecturer', 'Registrar (Sample)', 'Librarian (Sample)',
  ]
  return {
    slug: `sample-person-${n}`,
    name: `Sample Person ${n}`,
    designation: designations[i],
    details: 'Sample directory entry. Not a real person.',
    email: `person${n}@${SAMPLE_HOST}`,
    ...(i === 0 ? { emailPublic: true } : {}),
  }
})

/** Faculty of the Department of Computer and Software Technologies, so its page has a people section. Placeholder names. */
const dcstPeople: PersonSeed[] = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'].map((designation, i) => {
  const n = String(11 + i)
  return { slug: `sample-person-${n}`, name: `Sample Person ${n}`, designation, details: 'Sample directory entry. Not a real person.', email: `person${n}@${SAMPLE_HOST}`, department: 'dcst' }
})
people.push(...dcstPeople)

export const offices: OfficeSeed[] = [
  { slug: 'sample-registrars-office', name: "Sample Registrar's Office", group: 'Directorates', hours: 'Sample hours, Monday to Friday', email: `registrar@${SAMPLE_HOST}`, head: 'sample-person-09' },
  { slug: 'sample-admissions-office', name: 'Sample Admissions Office', group: 'Directorates', hours: 'Sample hours, Monday to Friday', head: 'sample-person-07' },
  { slug: 'sample-examinations-office', name: 'Sample Examinations Office', group: 'Directorates', hours: 'Sample hours, Monday to Friday', head: 'sample-person-08' },
  { slug: 'sample-library', name: 'Sample Library', group: 'Services', hours: 'Sample hours, Monday to Saturday', head: 'sample-person-10' },
]

const dept = (slug: string, subject: string, facultyGroup: string, head: string): DepartmentSeed => ({
  slug: `sample-department-of-${slug}`,
  name: `Sample Department of ${subject}`,
  facultyGroup,
  head,
  summary: `Sample summary for the Department of ${subject}. Invented text for layout testing.`,
})

export const departments: DepartmentSeed[] = [
  dept('physics', 'Physics', 'sample-faculty-of-sciences', 'sample-person-01'),
  dept('chemistry', 'Chemistry', 'sample-faculty-of-sciences', 'sample-person-02'),
  {
    slug: 'dcst',
    name: 'Department of Computer and Software Technologies',
    facultyGroup: 'sample-faculty-of-sciences',
    head: 'sample-person-03',
    summary:
      'The Department of Computer and Software Technologies (DCST) teaches computer science, software engineering, information technology, data science and artificial intelligence.',
    emails: [`dcst@${SAMPLE_HOST}`],
  },
  dept('mathematics', 'Mathematics', 'sample-faculty-of-sciences', 'sample-person-04'),
  dept('english', 'English', 'sample-faculty-of-arts-and-humanities', 'sample-person-05'),
  dept('history', 'History', 'sample-faculty-of-arts-and-humanities', 'sample-person-06'),
  dept('economics', 'Economics', 'sample-faculty-of-social-and-management-sciences', 'sample-person-07'),
  dept('business-administration', 'Business Administration', 'sample-faculty-of-social-and-management-sciences', 'sample-person-08'),
]

const prog = (level: string, subject: string, deptSlug: string, years: number, campus = 'main'): ProgrammeSeed => ({
  slug: `sample-${level.toLowerCase()}-${subject.toLowerCase().replaceAll(' ', '-')}`,
  name: `Sample ${level} ${subject}`,
  department: `sample-department-of-${deptSlug}`,
  campus,
  level,
  duration: `${years} years`,
})

const dcstProg = (subject: string): ProgrammeSeed => ({
  slug: `bs-${subject.toLowerCase().replaceAll(' ', '-')}`,
  name: `BS ${subject}`,
  department: 'dcst',
  campus: 'main',
  level: 'BS',
  duration: '4 years',
  eligibility:
    'Intermediate (HSSC) with Mathematics, or an equivalent qualification. The merit criteria are announced with each intake.',
})

export const programmes: ProgrammeSeed[] = [
  ...['Computer Science', 'Software Engineering', 'Information Technology', 'Data Science', 'Artificial Intelligence'].map(dcstProg),
  prog('BS', 'Physics', 'physics', 4),
  prog('MS', 'Physics', 'physics', 2),
  prog('BS', 'Chemistry', 'chemistry', 4),
  prog('BS', 'Mathematics', 'mathematics', 4),
  prog('BS', 'English', 'english', 4),
  prog('MA', 'English', 'english', 2),
  prog('BS', 'History', 'history', 4, 'sangota'),
  prog('BS', 'Economics', 'economics', 4),
  prog('MS', 'Economics', 'economics', 2),
  prog('BBA', 'Business Administration', 'business-administration', 4),
  prog('MBA', 'Business Administration', 'business-administration', 2),
]
