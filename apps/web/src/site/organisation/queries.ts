import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'

import { previewReadOptions } from '@/governance/preview'

import {
  LIST_REVALIDATE_SECONDS,
  byName,
  toDepartmentCard,
  toProgrammeCard,
  type DepartmentCard,
  type Doc,
  type ProgrammeCard,
} from './shape'

/**
 * Public reads for departments and programmes. No user is passed, so the collections' own rules apply
 * (published records only; a hidden email is not returned). These record types have no revalidation
 * hooks yet, so lists are cached 300 s under the tag `list:{collection}`, the same bound as the articles.
 */

const payloadInstance = (): Promise<Payload> => getPayload({ config: configPromise })
const publicRead = { draft: false, overrideAccess: false } as const

async function departmentsUncached(): Promise<DepartmentCard[]> {
  const payload = await payloadInstance()
  const res = await payload.find({ collection: 'departments', ...publicRead, depth: 1, limit: 500, pagination: false, sort: 'name' })
  return (res.docs as unknown as Doc[]).flatMap((d) => toDepartmentCard(d) ?? []).sort(byName)
}
export const listDepartments = () =>
  unstable_cache(departmentsUncached, ['org', 'departments'], { revalidate: LIST_REVALIDATE_SECONDS, tags: ['list:departments'] })()

async function programmesUncached(): Promise<ProgrammeCard[]> {
  const payload = await payloadInstance()
  const res = await payload.find({ collection: 'programmes', ...publicRead, depth: 1, limit: 1000, pagination: false, sort: 'name' })
  return (res.docs as unknown as Doc[]).flatMap((p) => toProgrammeCard(p) ?? []).sort(byName)
}
export const listProgrammes = () =>
  unstable_cache(programmesUncached, ['org', 'programmes'], { revalidate: LIST_REVALIDATE_SECONDS, tags: ['list:programmes'] })()

type PreviewArgs = { draftModeOn: boolean; headers: Headers }

/** One record by slug. Draft mode is only a cookie: who may see a draft comes from the login on this request. */
async function bySlug(collection: 'departments' | 'programmes' | 'offices', slug: string, args: PreviewArgs): Promise<Doc | null> {
  const payload = await payloadInstance()
  const where = { slug: { equals: slug } }
  const read = await previewReadOptions(payload, args.draftModeOn, args.headers)
  if (read.draft) {
    const draft = await payload.find({ collection, limit: 1, pagination: false, where, depth: 1, ...read })
    if (draft.docs[0]) return draft.docs[0] as unknown as Doc
  }
  const live = await payload.find({ collection, ...publicRead, limit: 1, pagination: false, where, depth: 1 })
  return (live.docs[0] as unknown as Doc | undefined) ?? null
}
export const getDepartment = (slug: string, args: PreviewArgs) => bySlug('departments', slug, args)
export const getProgramme = (slug: string, args: PreviewArgs) => bySlug('programmes', slug, args)
export const getOffice = (slug: string, args: PreviewArgs) => bySlug('offices', slug, args)

async function programmesOfUncached(departmentId: number | string): Promise<ProgrammeCard[]> {
  const payload = await payloadInstance()
  const res = await payload.find({
    collection: 'programmes',
    ...publicRead,
    depth: 1,
    limit: 200,
    pagination: false,
    sort: 'name',
    where: { department: { equals: departmentId } },
  })
  return (res.docs as unknown as Doc[]).flatMap((p) => toProgrammeCard(p) ?? []).sort(byName)
}
export const programmesOfDepartment = (departmentId: number | string) =>
  unstable_cache(programmesOfUncached, ['org', 'programmes-of', String(departmentId)], {
    revalidate: LIST_REVALIDATE_SECONDS,
    tags: ['list:programmes'],
  })(departmentId)

export type PersonCard = { id: number | string; name: string; designation: string | null; email: string | null }

async function peopleOfUncached(departmentId: number | string): Promise<PersonCard[]> {
  const payload = await payloadInstance()
  const res = await payload.find({
    collection: 'people',
    ...publicRead,
    depth: 0,
    limit: 200,
    pagination: false,
    sort: 'name',
    where: { and: [{ department: { equals: departmentId } }, { facultyStatus: { equals: 'current' } }] },
  })
  return (res.docs as unknown as Doc[])
    .flatMap((p) => (typeof p.name === 'string' && p.name ? [{ id: p.id, name: p.name, designation: typeof p.designation === 'string' ? p.designation : null, email: typeof p.email === 'string' ? p.email : null }] : []))
    .sort(byName)
}
/** Current people of a department. The email is whatever the field rule lets an anonymous reader see (public ones only). */
export const peopleOfDepartment = (departmentId: number | string) =>
  unstable_cache(peopleOfUncached, ['org', 'people-of', String(departmentId)], {
    revalidate: LIST_REVALIDATE_SECONDS,
    tags: ['list:people'],
  })(departmentId)
