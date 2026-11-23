import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import RichDepartmentPage from '../academics/RichDepartmentPage'
import RichDisciplinePage from '../academics/RichDisciplinePage'
import { departmentFeed } from '../academics/feed'
import { disciplinesOf, profileForDepartment, profileForDiscipline } from '../academics/profiles'
import RichAboutPage from '../about/RichAboutPage'
import RichMessagePage from '../about/RichMessagePage'
import { ABOUT_PATH, MESSAGE_PATH } from '../about/data'
import RichAdministrationPage from '../offices/RichAdministrationPage'
import RichOfficePage from '../offices/RichOfficePage'
import RichResearchPage from '../offices/RichResearchPage'
import { ADMINISTRATION_PATH, RESEARCH_PATH } from '../offices/landings'
import { profileForOffice, profileForPage } from '../offices/profiles'
import RichFacultyPage from '../faculties/RichFacultyPage'
import RichFacultyProgrammePage from '../faculties/RichFacultyProgrammePage'
import { profileForFaculty, profileForFacultyProgramme } from '../faculties'

import { DepartmentsIndex, ProgrammesIndex } from './Lists'
import { AcademicsPage, CampusPage } from './Landing'
import OfficePage from './Office'
import { DepartmentPage, ProgrammePage } from './Pages'
import { getCampus, getDepartment, getOffice, getProgramme, listDepartments, listProgrammes, peopleOfDepartment, programmesAtCampus, programmesOfDepartment } from './queries'
import { ACADEMICS_PATH, CAMPUSES_PATH, DEPARTMENTS_PATH, OFFICES_PATH, PROGRAMMES_PATH, str, type Doc, type ProgrammeCard } from './shape'

/* The route files under (site)/(cms)/academics/{departments,programmes} are one-liners over these. */

type SlugParams = Promise<{ slug?: string }>
const decode = (slug: string) => {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}
const preview = async () => ({ draftModeOn: (await draftMode()).isEnabled, headers: await headers() })

export async function DepartmentsListRoute() {
  return <DepartmentsIndex departments={await listDepartments()} />
}
export const departmentsListMetadata: Metadata = { title: 'Departments', alternates: { canonical: DEPARTMENTS_PATH } }

export async function ProgrammesListRoute() {
  return <ProgrammesIndex programmes={await listProgrammes()} />
}
export const programmesListMetadata: Metadata = { title: 'Programmes', alternates: { canonical: PROGRAMMES_PATH } }

/* A page with a profile in code (src/site/academics, offices, faculties) does not need a CMS record: when the database has none (production
   holds no content yet), it is drawn from the profile alone, and a record, once added, still overrides the fields it fills. */
const stub = (slug: string): Doc => ({ id: slug })

export async function DepartmentRoute({ params }: { params: SlugParams }) {
  const slug = decode((await params).slug ?? '')
  const doc = await getDepartment(slug, await preview())
  const profile = profileForDepartment(doc ? (str(doc.slug) ?? '') : slug)
  if (!doc && !profile) notFound()
  if (profile) {
    const [stored, feed] = await Promise.all([doc ? programmesOfDepartment(doc.id) : Promise.resolve([] as ProgrammeCard[]), departmentFeed(profile.slug)])
    const have = new Set(stored.map((p) => p.slug))
    const fromProfile: ProgrammeCard[] = disciplinesOf(profile.slug)
      .filter((d) => !have.has(d.slug))
      .map((d) => ({ id: d.slug, name: d.shortName, slug: d.slug, level: null, duration: null, campus: null, departmentId: profile.slug, departmentName: profile.shortName, sample: false }))
    return <RichDepartmentPage doc={doc ?? stub(profile.slug)} profile={profile} programmes={[...stored, ...fromProfile]} feed={feed} />
  }
  const [programmes, people] = await Promise.all([programmesOfDepartment(doc!.id), peopleOfDepartment(doc!.id)])
  return <DepartmentPage doc={doc!} programmes={programmes} people={people} />
}
export async function departmentMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const doc = await getDepartment(slug, await preview())
  const profile = profileForDepartment(slug)
  const title = (doc && str(doc.name)) ?? profile?.shortName
  return title
    ? { title, description: (doc && str(doc.summary)?.slice(0, 160)) ?? profile?.intro?.slice(0, 160), alternates: { canonical: `${DEPARTMENTS_PATH}/${encodeURIComponent(slug)}` } }
    : { title: 'Department' }
}

export async function ProgrammeRoute({ params }: { params: SlugParams }) {
  const slug = decode((await params).slug ?? '')
  const doc = await getProgramme(slug, await preview())
  const key = doc ? (str(doc.slug) ?? '') : slug
  const profile = profileForDiscipline(key)
  const facultyProgramme = profile ? null : profileForFacultyProgramme(key)
  if (!doc && !profile && !facultyProgramme) notFound()
  if (profile) {
    const feed = await departmentFeed(profile.department)
    return <RichDisciplinePage doc={doc ?? stub(profile.slug)} profile={profile} feed={feed} />
  }
  if (facultyProgramme) return <RichFacultyProgrammePage doc={doc ?? stub(slug)} profile={facultyProgramme} />
  return <ProgrammePage doc={doc!} />
}
export async function programmeMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const doc = await getProgramme(slug, await preview())
  const title = (doc && str(doc.name)) ?? profileForDiscipline(slug)?.shortName ?? profileForFacultyProgramme(slug)?.name
  return title
    ? { title, description: (doc && str(doc.eligibility)?.slice(0, 160)) || undefined, alternates: { canonical: `${PROGRAMMES_PATH}/${encodeURIComponent(slug)}` } }
    : { title: 'Programme' }
}

export async function OfficeRoute({ params }: { params: SlugParams }) {
  const slug = decode((await params).slug ?? '')
  const doc = await getOffice(slug, await preview())
  const profile = profileForOffice(doc ? (str(doc.slug) ?? '') : slug)
  if (!doc && !profile) notFound()
  if (profile) return <RichOfficePage doc={doc ?? stub(profile.slug)} profile={profile} feed={await departmentFeed(profile.slug)} />
  return <OfficePage doc={doc!} />
}
export async function officeMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const doc = await getOffice(slug, await preview())
  const profile = profileForOffice(slug)
  const title = (doc && str(doc.name)) ?? profile?.name
  return title
    ? { title, description: profile?.lead, alternates: { canonical: `${OFFICES_PATH}/${encodeURIComponent(slug)}` } }
    : { title: 'Office' }
}

/* /research and /administration: section landings (T2). Static routes, so they win over a Pages record with the same slug. */
export function ResearchRoute() {
  return <RichResearchPage />
}
export const researchMetadata: Metadata = {
  title: 'Research',
  description: 'Research offices, the journal and the digital library of the University of Swat.',
  alternates: { canonical: RESEARCH_PATH },
}
export function AdministrationRoute() {
  return <RichAdministrationPage />
}
export const administrationMetadata: Metadata = {
  title: 'Administration',
  description: 'Directorates, offices, boards and centres of the University of Swat.',
  alternates: { canonical: ADMINISTRATION_PATH },
}

export async function AcademicsRoute() {
  return <AcademicsPage departments={await listDepartments()} />
}
export const academicsMetadata: Metadata = { title: 'Academics', alternates: { canonical: ACADEMICS_PATH } }

export async function CampusRoute({ params }: { params: SlugParams }) {
  const doc = await getCampus(decode((await params).slug ?? ''), await preview())
  if (!doc) notFound()
  return <CampusPage doc={doc} programmes={await programmesAtCampus(doc.id)} />
}
export async function campusMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const doc = await getCampus(slug, await preview())
  return doc ? { title: str(doc.name) ?? 'Campus', alternates: { canonical: `${CAMPUSES_PATH}/${encodeURIComponent(slug)}` } } : { title: 'Campus' }
}

/* /about and /about/vice-chancellors-message: static routes, so they win over a Pages record with the same slug (the seeded Sample About page). */
export function AboutRoute() {
  return <RichAboutPage />
}
export const aboutMetadata: Metadata = {
  title: 'About the University',
  description: 'History, vision and mission of the University of Swat.',
  alternates: { canonical: ABOUT_PATH },
}
export function MessageRoute() {
  return <RichMessagePage />
}
export const messageMetadata: Metadata = {
  title: 'Vice Chancellor’s Message',
  description: 'A message from the Vice Chancellor of the University of Swat, Prof. Dr. Husnul Amin.',
  alternates: { canonical: MESSAGE_PATH },
}

/* Pages built from an office-style profile and served at their own static address (PAGE_PROFILES): two departments, the Central Library,
   the Quality Enhancement Cell and the Academic Calendar. No CMS record is needed; the route files pass the slug. */
export async function PageProfileRoute({ slug }: { slug: string }) {
  const profile = profileForPage(slug)
  if (!profile) notFound()
  return <RichOfficePage doc={{ id: profile.slug }} profile={profile} feed={await departmentFeed(profile.slug)} />
}
export function pageProfileMetadata(slug: string): Metadata {
  const profile = profileForPage(slug)
  return profile
    ? { title: profile.name, description: profile.lead, alternates: { canonical: profile.path } }
    : { title: 'Page' }
}

/* /faculties/{slug}: a faculty landing built from a profile (src/site/faculties). A static route per faculty, so no CMS record is needed. */
export function FacultyRoute({ slug }: { slug: string }) {
  const profile = profileForFaculty(slug)
  if (!profile) notFound()
  return <RichFacultyPage profile={profile} />
}
export function facultyMetadata(slug: string): Metadata {
  const profile = profileForFaculty(slug)
  return profile
    ? { title: profile.name, description: profile.lead, alternates: { canonical: profile.path } }
    : { title: 'Faculty' }
}
