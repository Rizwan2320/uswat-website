import type { Metadata } from 'next'
import { draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import RichDepartmentPage from '../academics/RichDepartmentPage'
import RichDisciplinePage from '../academics/RichDisciplinePage'
import { departmentFeed } from '../academics/feed'
import { profileForDepartment, profileForDiscipline } from '../academics/profiles'

import { DepartmentsIndex, ProgrammesIndex } from './Lists'
import { AcademicsPage, CampusPage } from './Landing'
import OfficePage from './Office'
import { DepartmentPage, ProgrammePage } from './Pages'
import { getCampus, getDepartment, getOffice, getProgramme, listDepartments, listProgrammes, peopleOfDepartment, programmesAtCampus, programmesOfDepartment } from './queries'
import { ACADEMICS_PATH, CAMPUSES_PATH, DEPARTMENTS_PATH, OFFICES_PATH, PROGRAMMES_PATH, str } from './shape'

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

export async function DepartmentRoute({ params }: { params: SlugParams }) {
  const doc = await getDepartment(decode((await params).slug ?? ''), await preview())
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
  return doc
    ? { title: str(doc.name) ?? 'Department', description: str(doc.summary)?.slice(0, 160) ?? undefined, alternates: { canonical: `${DEPARTMENTS_PATH}/${encodeURIComponent(slug)}` } }
    : { title: 'Department' }
}

export async function ProgrammeRoute({ params }: { params: SlugParams }) {
  const doc = await getProgramme(decode((await params).slug ?? ''), await preview())
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
  return doc
    ? { title: str(doc.name) ?? 'Programme', description: str(doc.eligibility)?.slice(0, 160) ?? undefined, alternates: { canonical: `${PROGRAMMES_PATH}/${encodeURIComponent(slug)}` } }
    : { title: 'Programme' }
}

export async function OfficeRoute({ params }: { params: SlugParams }) {
  const doc = await getOffice(decode((await params).slug ?? ''), await preview())
  if (!doc) notFound()
  return <OfficePage doc={doc} />
}
export async function officeMetadata({ params }: { params: SlugParams }): Promise<Metadata> {
  const slug = decode((await params).slug ?? '')
  const doc = await getOffice(slug, await preview())
  return doc
    ? { title: str(doc.name) ?? 'Office', alternates: { canonical: `${OFFICES_PATH}/${encodeURIComponent(slug)}` } }
    : { title: 'Office' }
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
