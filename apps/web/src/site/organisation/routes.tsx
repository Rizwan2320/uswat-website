import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import RichDepartmentPage from '../academics/RichDepartmentPage'
import RichDisciplinePage from '../academics/RichDisciplinePage'
import { departmentFeed } from '../academics/feed'
import type { DepartmentProfile } from '../academics/types'
import { departmentPath, disciplinesOf, profileForDepartment, profileForDiscipline } from '../academics/profiles'
import RichAboutPage from '../about/RichAboutPage'
import RichMessagePage from '../about/RichMessagePage'
import { ABOUT_PATH, MESSAGE_PATH } from '../about/data'
import RichAdministrationPage from '../offices/RichAdministrationPage'
import RichOfficePage from '../offices/RichOfficePage'
import RichResearchPage from '../offices/RichResearchPage'
import { ADMINISTRATION_PATH, RESEARCH_PATH } from '../offices/landings'
import { profileForOffice, profileForPage } from '../offices/profiles'

import { DepartmentsIndex, ProgrammesIndex } from './Lists'
import { AcademicsPage, CampusPage } from './Landing'
import OfficePage from './Office'
import { DepartmentPage, ProgrammePage } from './Pages'
import { getCampus, getDepartment, getOffice, getProgramme, listDepartments, listProgrammes, peopleOfDepartment, programmesAtCampus, programmesOfDepartment } from './queries'
import { ACADEMICS_PATH, CAMPUSES_PATH, DEPARTMENTS_PATH, OFFICES_PATH, PROGRAMMES_PATH, str, type ProgrammeCard } from './shape'

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

/** Programme cards built from the programme profiles of a department, for a page that has no CMS record. */
const profileProgrammeCards = (profile: DepartmentProfile): ProgrammeCard[] =>
  disciplinesOf(profile.slug).map((d) => ({
    id: d.slug,
    name: d.name ?? `BS ${d.shortName}`,
    slug: d.slug,
    level: d.level ?? 'BS',
    duration: d.duration ?? '4 years',
    campus: null,
    departmentId: profile.slug,
    departmentName: profile.shortName,
    sample: false,
  }))

export async function DepartmentRoute({ params }: { params: SlugParams }) {
  const slug = decode((await params).slug ?? '')
  const doc = await getDepartment(slug, await preview())
  // A department with a profile shows even when the CMS has no record for it yet (the profile carries the facts and their sources).
  const own = profileForDepartment(slug)
  if (!doc && own)
    return <RichDepartmentPage doc={{ id: own.slug, slug: own.slug, name: own.fullName ?? own.shortName }} profile={own} programmes={profileProgrammeCards(own)} feed={await departmentFeed(own.slug)} />
  if (!doc) notFound()
  const profile = profileForDepartment(str(doc.slug) ?? '')
  if (profile) {
    const [programmes, feed] = await Promise.all([programmesOfDepartment(doc.id), departmentFeed(profile.slug)])
    return <RichDepartmentPage doc={doc} profile={profile} programmes={programmes} feed={feed} />
  }
  const [programmes, people] = await Promise.all([programmesOfDepartment(doc.id), peopleOfDepartment(doc.id)])
  return <DepartmentPage doc={doc} programmes={programmes} people={people} />
}
export async function departmentMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const doc = await getDepartment(slug, await preview())
  const own = profileForDepartment(slug)
  if (!doc && own) return { title: own.fullName ?? own.shortName, description: own.intro, alternates: { canonical: `${DEPARTMENTS_PATH}/${encodeURIComponent(slug)}` } }
  return doc
    ? { title: str(doc.name) ?? 'Department', description: str(doc.summary)?.slice(0, 160) ?? undefined, alternates: { canonical: `${DEPARTMENTS_PATH}/${encodeURIComponent(slug)}` } }
    : { title: 'Department' }
}

export async function ProgrammeRoute({ params }: { params: SlugParams }) {
  const slug = decode((await params).slug ?? '')
  const doc = await getProgramme(slug, await preview())
  const own = profileForDiscipline(slug)
  if (!doc && own) return <RichDisciplinePage doc={{ id: own.slug, slug: own.slug, name: own.name ?? `BS ${own.shortName}` }} profile={own} feed={await departmentFeed(own.department)} />
  if (!doc) notFound()
  const profile = profileForDiscipline(str(doc.slug) ?? '')
  if (profile) {
    const feed = await departmentFeed(profile.department)
    return <RichDisciplinePage doc={doc} profile={profile} feed={feed} />
  }
  return <ProgrammePage doc={doc} />
}
export async function programmeMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const doc = await getProgramme(slug, await preview())
  const own = profileForDiscipline(slug)
  if (!doc && own) return { title: own.name ?? `BS ${own.shortName}`, description: own.summary, alternates: { canonical: `${PROGRAMMES_PATH}/${encodeURIComponent(slug)}` } }
  return doc
    ? { title: str(doc.name) ?? 'Programme', description: str(doc.eligibility)?.slice(0, 160) ?? undefined, alternates: { canonical: `${PROGRAMMES_PATH}/${encodeURIComponent(slug)}` } }
    : { title: 'Programme' }
}

export async function OfficeRoute({ params }: { params: SlugParams }) {
  const slug = decode((await params).slug ?? '')
  const doc = await getOffice(slug, await preview())
  const profile = profileForOffice(str(doc?.slug) ?? slug)
  // An office with a profile shows even when the CMS has no record for it yet (the profile carries the facts and their sources).
  if (!doc && profile) return <RichOfficePage doc={{ id: profile.slug, slug: profile.slug, name: profile.name }} profile={profile} feed={await departmentFeed(profile.slug)} />
  if (!doc) notFound()
  if (profile) return <RichOfficePage doc={doc} profile={profile} feed={await departmentFeed(profile.slug)} />
  return <OfficePage doc={doc} />
}
export async function officeMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const doc = await getOffice(slug, await preview())
  const profile = profileForOffice(slug)
  return doc || profile
    ? { title: str(doc?.name) ?? profile?.name ?? 'Office', description: profile?.lead, alternates: { canonical: `${OFFICES_PATH}/${encodeURIComponent(slug)}` } }
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

/* /faculties/{slug}: a faculty landing built from a department profile with a `path` (src/site/academics/profiles/allied). A static route per faculty, so no CMS record is needed. */
export async function FacultyRoute({ slug }: { slug: string }) {
  const profile = profileForDepartment(slug)
  if (!profile?.path) notFound()
  // No CMS record is needed: the programme cards are built from the programme profiles of the faculty.
  const programmes = profileProgrammeCards(profile)
  return <RichDepartmentPage doc={{ id: profile.slug }} profile={profile} programmes={programmes} feed={await departmentFeed(profile.slug)} />
}
export function facultyMetadata(slug: string): Metadata {
  const profile = profileForDepartment(slug)
  return profile?.path
    ? { title: profile.fullName ?? profile.shortName, description: profile.intro, alternates: { canonical: departmentPath(profile) } }
    : { title: 'Faculty' }
}
