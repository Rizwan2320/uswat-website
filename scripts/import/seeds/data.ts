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
export type OfficeSeed = { slug: string; name: string; group: string; hours?: string; email?: string; head?: string }
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
export type DepartmentSeed = { slug: string; name: string; facultyGroup: string; head?: string; summary: string; vision?: string; mission?: string; emails?: string[] }
export type ProgrammeSeed = {
  slug: string
  name: string
  /** A programme the university's pages list without a department or centre has none. */
  department?: string
  campus?: string
  level?: string
  duration?: string
  /** `null` leaves the field empty (a real programme whose eligibility is not published); `undefined` gets the Sample text. */
  eligibility?: string | null
}

export const facultyGroups: FacultyGroupSeed[] = [
  { slug: 'sample-faculty-of-sciences', name: 'Sample Faculty of Sciences' },
  { slug: 'sample-faculty-of-arts-and-humanities', name: 'Sample Faculty of Arts and Humanities' },
  { slug: 'sample-faculty-of-social-and-management-sciences', name: 'Sample Faculty of Social and Management Sciences' },
  // The university's own faculty (its page https://uswat.edu.pk/faculty/, read 2026-11-06). The page content lives in src/site/faculties.
  { slug: 'faculty-of-allied-health-sciences', name: 'Faculty of Allied Health Sciences' },
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

/** The offices that have a rich page (apps/web/src/site/offices/profiles). Names, groups, hours, phones and e-mails are the university's own,
    read on 2026-11-05 (docs/plan/official-data-raw-2026-11-05.md). Seeds carry no real phone numbers or e-mails (a test enforces it); the page's contact
    details come from the profile, with their sources. The record is still seeded under the sample source and has no head person. */
const realOffices: OfficeSeed[] = [
  { slug: 'oric-2', name: 'Office of Research, Innovation and Commercialization (ORIC)', group: 'Offices and boards' },
  { slug: 'advanced-studies-and-research-board', name: 'Directorate of Advanced Studies and Research (DASR)', group: 'Directorates' },
  { slug: 'directorate-of-it', name: 'Directorate of IT', group: 'Directorates' },
  { slug: 'controller-of-examination-office', name: 'Office of the Controller of Examinations', group: 'Offices and boards' },
  { slug: 'directorate-of-works', name: 'Directorate of Works', group: 'Directorates' },
  { slug: 'proctorial-board', name: 'Proctorial Board', group: 'Offices and boards' },
  { slug: 'kamyab-jawan-markaz', name: 'Youth Development Centre (YDC)', group: 'Centres and associations' },
  { slug: 'alumni', name: 'Alumni Association', group: 'Centres and associations' },
  { slug: 'hunerkada-center-for-excellence', name: 'Hunerkada Center of Excellence', group: 'Centres and associations' },
  { slug: 'directorate-of-research-and-technological-development', name: 'Directorate of Research and Technological Development', group: 'Directorates' },
  { slug: 'directorate-of-admissions', name: 'Directorate of Admissions', group: 'Directorates' },
  { slug: 'directorate-of-administration', name: 'Directorate of Administration', group: 'Directorates' },
  { slug: 'directorate-of-planning-and-development', name: 'Directorate of Planning and Development', group: 'Directorates' },
  { slug: 'registeror-office', name: 'Office of the Registrar', group: 'Offices and boards' },
  { slug: 'treasurer-office', name: 'Office of the Treasurer', group: 'Offices and boards' },
  { slug: 'provost-office', name: 'Office of the Provost', group: 'Offices and boards' },
  { slug: 'vc-office', name: 'Office of the Vice Chancellor', group: 'Offices and boards' },
  { slug: 'office-of-the-pro-vice-chancellor-pro-vc', name: 'Office of the Pro Vice Chancellor', group: 'Offices and boards' },
  { slug: 'university-advancement-financial-aid-office', name: 'University Advancement and Financial Aid Office', group: 'Offices and boards' },
  { slug: 'e-office', name: 'E-Office', group: 'Offices and boards' },
  { slug: 'dean-office-3', name: 'Dean’s Office, Faculty of Chemical Sciences', group: 'Offices and boards' },
  { slug: 'election-administrative-officers-and-faculty-members', name: 'Election (Administrative Officers and Faculty Members)', group: 'Offices and boards' },
  { slug: 'press-release', name: 'Press Releases', group: 'Offices and boards' },
  { slug: 'developmental-projects', name: 'Developmental Projects', group: 'Offices and boards' },
  { slug: 'directorate-of-sports', name: 'Directorate of Sports', group: 'Directorates' },
  { slug: 'office-365', name: 'Office 365', group: 'Offices and boards' },
  { slug: 'office-of-the-deans', name: 'Office of the Deans', group: 'Offices and boards' },
]
offices.push(...realOffices)

const dept = (slug: string, subject: string, facultyGroup: string, head: string): DepartmentSeed => ({
  slug: `sample-department-of-${slug}`,
  name: `Sample Department of ${subject}`,
  facultyGroup,
  head,
  summary: `Sample summary for the Department of ${subject}. Invented text for layout testing.`,
})

export const departments: DepartmentSeed[] = [
  // The three science departments below carry the university's own names and text (their pages, read 2026-11-06). Which faculty each belongs to is
  // not on those pages, so they sit in the same placeholder faculty group as DCST until the owner says.
  {
    slug: 'physics',
    name: 'Department of Physics',
    facultyGroup: 'sample-faculty-of-sciences',
    summary:
      'The Department of Physics provides education in the subject so that students can use physics in practical life. It offers the BS in Physics and lists the MS/MPhil as intended.',
  },
  {
    slug: 'chemistry',
    name: 'Department of Chemistry',
    facultyGroup: 'sample-faculty-of-sciences',
    summary:
      'The Department of Chemistry (also called the Institute of Chemical Sciences, established November 2013) offers the BS in Chemistry and the Master of Philosophy in Chemistry.',
  },
  {
    slug: 'mathematics-and-statistics',
    name: 'Department of Mathematics and Statistics',
    facultyGroup: 'sample-faculty-of-sciences',
    summary:
      'The Department of Mathematics and Statistics lists BS Mathematics, BS Statistics, MPhil Mathematics and PhD Mathematics. The statistics department started working in 2010.',
  },
  // The six departments below were office-style pages (2026-11-25) and are now in the blueprint layout (2026-11-27); their pages were read 2026-11-06.
  {
    slug: 'geology',
    name: 'Department of Geology',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The Department of Geology became functional in 2014 and offers the four-year BS Geology, with fieldwork at geologically important sites.',
  },
  {
    slug: 'archaeology',
    name: 'Department of Archaeology',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The Department of Archaeology began academic activities in the fall of 2025 and offers the BS Archaeology, with a university museum of archaeology and ethnology.',
  },
  {
    slug: 'environmental-sciences',
    name: 'Department of Environmental Sciences',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The Department of Environmental Sciences, established in 2012, lists BS, MS/MPhil and PhD programmes and a one-year postgraduate diploma in Geomatics.',
  },
  {
    slug: 'economics-and-development-studies',
    name: 'Department of Economics and Development Studies',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department offers BS Economics and BS Development Studies, with MPhil and PhD programmes in preparation.',
  },
  {
    slug: 'english-and-foreign-languages',
    name: 'Department of English and Foreign Languages',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department teaches English literature and linguistics and lists the BS English and an MPhil in Linguistics.',
  },
  {
    slug: 'management-commerce',
    name: 'Department of Management and Commerce',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department lists eleven degrees, from BBA (Hons) and four BS programmes to MBA, EMBA, MS and PhD in Management Sciences.',
  },
  // The ten departments below (batch 4) carry the university's own names and text (their pages, read 2026-11-06); faculty not on the pages, as above.
  {
    slug: 'education-and-staff-training',
    name: 'Department of Education and Staff Training',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department has trained teachers since 2010 and lists the B.Ed (Hons), the Associate Degree in Education, the MPhil and a planned PhD.',
  },
  {
    slug: 'home-economics',
    name: 'Department of Home Economics',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'A constituent department of the Women Campus. It offers the BS in Home Economics with five fields of specialisation.',
  },
  {
    slug: 'islamic-and-arabic-studies',
    name: 'Department of Islamic and Arabic Studies',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'Launched in late 2017, the department offers the BS in Islamic Studies and lists MPhil and PhD degrees.',
  },
  {
    slug: 'law-sharia',
    name: 'Department of Law and Shari’a',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department offers the five-year BA LL.B in Law and Shari’a, which joins common law and Islamic law.',
  },
  {
    slug: 'media-and-communication-studies',
    name: 'Department of Media and Communication Studies',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department lists a four-year BS and an MS in Media and Communication Studies.',
  },
  {
    slug: 'pakistan-studies',
    name: 'Department of Pakistan Studies',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'A multi-disciplinary department that offers the BS in Pakistan Studies and a Master’s in the same field.',
  },
  {
    slug: 'pashto',
    name: 'Department of Pashto',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department teaches Pashto language, literature and culture and offers the BS in Pashto.',
  },
  {
    slug: 'social-and-gender-studies',
    name: 'Department of Social and Gender Studies',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department lists BS Sociology, BS Criminology, the MPhil in Sociology and the PhD in Sociology.',
  },
  {
    slug: 'tourism-and-hospitality',
    name: 'Department of Tourism and Hospitality',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department offers BS Tourism and Hospitality and BS Culinary Arts and runs a Food and Beverages Laboratory.',
  },
  {
    slug: 'urdu',
    name: 'Department of Urdu',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The department teaches Urdu language, literature and culture and offers the BS in Urdu.',
  },
  // The five life-science departments below carry the university's own names and text (their pages, read 2026-11-06); faculty not on the pages, as above.
  {
    slug: 'botany',
    name: 'Department of Botany',
    facultyGroup: 'sample-faculty-of-sciences',
    summary:
      'The Department of Botany gives interdisciplinary teaching and research in plant sciences. Its page lists the BS, MPhil and PhD in Botany.',
  },
  {
    slug: 'zoology',
    name: 'Department of Zoology',
    facultyGroup: 'sample-faculty-of-sciences',
    summary:
      'The Department of Zoology, established in 2011, offers the BS in Zoology and the BS in Fisheries, and lists an MSc in Zoology.',
  },
  {
    slug: 'biotechnology-genetics-forensic-and-microbiology',
    name: 'Department of Biotechnology, Genetics, Forensic and Microbiology',
    facultyGroup: 'sample-faculty-of-sciences',
    summary:
      'The department offers research-oriented BS, MPhil and PhD degrees in Biotechnology, Microbiology, Genetics and Forensic Science. Forensic Science joined it in December 2022.',
  },
  {
    slug: 'psychological-studies',
    name: 'Department of Psychological Studies',
    facultyGroup: 'sample-faculty-of-sciences',
    summary: 'The Department of Psychological Studies has worked since 17 October 2012 and offers the BS in Psychology.',
  },
  {
    slug: 'agricultural-sciences-and-forestry',
    name: 'Department of Agricultural Sciences and Forestry',
    facultyGroup: 'sample-faculty-of-sciences',
    summary:
      'The Department of Agricultural Sciences and Forestry, established in 2014, offers the BS in Forestry and lists the MPhil in Forestry.',
  },
  {
    slug: 'dcst',
    name: 'Department of Computer and Software Technologies',
    facultyGroup: 'sample-faculty-of-sciences',
    head: 'sample-person-03',
    summary:
      'The Department of Computer and Software Technologies (DCST) teaches computer science, software engineering, information technology, data science and artificial intelligence.',
    emails: [`dcst@${SAMPLE_HOST}`],
  },
  {
    slug: 'centre-for-medical-technologies',
    name: 'Centre for Medical Technologies',
    facultyGroup: 'faculty-of-allied-health-sciences',
    summary: 'A centre of the Faculty of Allied Health Sciences. The university’s Quality Enhancement Cell lists BS Medical Laboratory Technology and BS Dental Technology under it.',
  },
  {
    slug: 'centre-for-pharmaceutical-and-rehabilitation-sciences',
    name: 'Centre for Pharmaceutical and Rehabilitation Sciences',
    facultyGroup: 'faculty-of-allied-health-sciences',
    summary: 'A centre of the Faculty of Allied Health Sciences. The university’s Quality Enhancement Cell lists the Doctor of Physical Therapy (DPT) under it.',
  },
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

/** The four programmes of the Faculty of Allied Health Sciences, as the faculty page lists them (read 2026-11-06). Level, duration and eligibility are
    not published, so they stay empty (a person fills them in the CMS). Radiography & Imaging has no centre on any page, so it has no department. */
const alliedProgrammes: ProgrammeSeed[] = [
  { slug: 'bs-medical-laboratory-technology', name: 'BS Medical Laboratory Technology (MLT)', department: 'centre-for-medical-technologies', eligibility: null },
  { slug: 'bs-dental-technology', name: 'BS Dental Technology', department: 'centre-for-medical-technologies', eligibility: null },
  { slug: 'doctor-of-physical-therapy', name: 'Doctor of Physical Therapy (DPT)', department: 'centre-for-pharmaceutical-and-rehabilitation-sciences', eligibility: null },
  { slug: 'bs-radiography-and-imaging-technology', name: 'BS Radiography & Imaging Technology', eligibility: null },
]

/** The programmes of the Physics, Chemistry, Mathematics and Statistics, and life-science departments, as their pages list them (read 2026-11-06). The three
    eligibilities (BS Physics, BS Chemistry, BS Forestry) are the ones those pages state; the others are not published, so they stay empty. BS Statistics has no
    page of its own on the old site. BS Forensic Sciences and BS Fisheries are listed on their department pages but have no programme page, so they are not seeded. */
const scienceProgrammes: ProgrammeSeed[] = [
  { slug: 'bs-physics-2', name: 'BS Physics', department: 'physics', level: 'BS', eligibility: 'F.Sc. or equivalent with at least 45% in the subject of Physics.' },
  { slug: 'bs-chemistry-2', name: 'BS Chemistry', department: 'chemistry', level: 'BS', eligibility: 'HSSC or equivalent with Chemistry, with at least 45% overall marks and at least 45% in the subject of Chemistry.' },
  { slug: 'bs-mathematics-2', name: 'BS Mathematics', department: 'mathematics-and-statistics', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-statistics', name: 'BS Statistics', department: 'mathematics-and-statistics', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-botany-2', name: 'BS Botany', department: 'botany', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-zoology-2', name: 'BS Zoology', department: 'zoology', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-biotechnology-3', name: 'BS Biotechnology', department: 'biotechnology-genetics-forensic-and-microbiology', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-genetics-3', name: 'BS Genetics', department: 'biotechnology-genetics-forensic-and-microbiology', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-microbiology-3', name: 'BS Microbiology', department: 'biotechnology-genetics-forensic-and-microbiology', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-psychology-2', name: 'BS Psychology', department: 'psychological-studies', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-forestry', name: 'BS Forestry', department: 'agricultural-sciences-and-forestry', level: 'BS', duration: '4 years', eligibility: 'Open merit: HSSC with at least 45% marks (Pre-Medical or Pre-Engineering).' },
  { slug: 'bs-geology-2', name: 'BS Geology', department: 'geology', level: 'BS', duration: '4 years', eligibility: 'Intermediate (F.Sc.) or equivalent with at least 45% marks: the science group, another group in which Chemistry, Physics and Mathematics were studied, or a three-year Diploma in Associate Engineering (DAE).' },
  { slug: 'bs-archaeology', name: 'BS Archaeology', department: 'archaeology', level: 'BS', duration: '4 years', eligibility: 'Intermediate or an equivalent qualification with at least 45% marks.' },
  { slug: 'bs-environmental-sciences', name: 'BS Environmental Sciences', department: 'environmental-sciences', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-economics-2', name: 'BS Economics', department: 'economics-and-development-studies', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-development-studies-2', name: 'BS Development Studies', department: 'economics-and-development-studies', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-english-2', name: 'BS English', department: 'english-and-foreign-languages', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bba-hons-2', name: 'Bachelor of Business Administration (Hons)', department: 'management-commerce', level: 'BBA', duration: '4 years', eligibility: null },
  { slug: 'b-ed-hons', name: 'B.Ed (Hons)', department: 'education-and-staff-training', level: 'B.Ed', duration: '4 years', eligibility: 'FA, F.Sc or A level (or equivalent) with a minimum of second division, and at least 45% marks in school subjects with A level.' },
  { slug: 'bs-home-economics', name: 'BS Home Economics', department: 'home-economics', level: 'BS', duration: '4 years', eligibility: 'FA, F.Sc or an equivalent qualification with at least second division.' },
  { slug: 'bs-islamic-studies-2', name: 'BS Islamic Studies', department: 'islamic-and-arabic-studies', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'ba-llb-law-and-shariah', name: 'BA LL.B (Law and Shari’a)', department: 'law-sharia', level: 'BA LL.B', duration: '5 years', eligibility: null },
  { slug: 'bs-journalism-and-mass-communication-2', name: 'BS Media and Communication Studies', department: 'media-and-communication-studies', level: 'BS', duration: '4 years', eligibility: 'HSSC or equivalent with at least 45% marks.' },
  { slug: 'bs-pakistan-studies-2', name: 'BS Pakistan Studies', department: 'pakistan-studies', level: 'BS', duration: '4 years', eligibility: 'FA, F.Sc or an equivalent qualification with at least 45% marks.' },
  { slug: 'bs-pashto', name: 'BS Pashto', department: 'pashto', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-urdu', name: 'BS Urdu', department: 'urdu', level: 'BS', duration: '4 years', eligibility: null },
  { slug: 'bs-sociology', name: 'BS Sociology', department: 'social-and-gender-studies', level: 'BS', duration: '4 years', eligibility: 'As set by the HEC Undergraduate Education Policy 2023, from Fall 2024.' },
  { slug: 'bs-criminology', name: 'BS Criminology', department: 'social-and-gender-studies', level: 'BS', duration: '4 years', eligibility: 'As set by the HEC Undergraduate Education Policy 2023, from Fall 2024.' },
  { slug: 'bs-tourism-and-hospitality-2', name: 'BS Tourism and Hospitality', department: 'tourism-and-hospitality', level: 'BS', duration: '4 years', eligibility: 'FA, F.Sc or an equivalent qualification with at least 45% marks.' },
  { slug: 'bs-culinary-arts', name: 'BS Culinary Arts', department: 'tourism-and-hospitality', level: 'BS', duration: '4 years', eligibility: 'FA, F.Sc or an equivalent qualification with at least 45% marks.' },
]

export const programmes: ProgrammeSeed[] = [
  ...alliedProgrammes,
  ...['Computer Science', 'Software Engineering', 'Information Technology', 'Data Science', 'Artificial Intelligence'].map(dcstProg),
  ...scienceProgrammes,
  prog('BS', 'English', 'english', 4),
  prog('MA', 'English', 'english', 2),
  prog('BS', 'History', 'history', 4, 'sangota'),
  prog('BS', 'Economics', 'economics', 4),
  prog('MS', 'Economics', 'economics', 2),
  prog('BBA', 'Business Administration', 'business-administration', 4),
  prog('MBA', 'Business Administration', 'business-administration', 2),
]
