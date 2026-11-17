// @vitest-environment node
/**
 * Department and programme reads on a real database (brief p5-organisation). Records are made per run
 * and named with the run id; the checks look only at those. Needs a local PostgreSQL.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import {
  getDepartment,
  getProgramme,
  listDepartments,
  listProgrammes,
  peopleOfDepartment,
  programmesOfDepartment,
} from '../../src/site/organisation/queries'
import { as, getTestPayload, makeUser, run } from '../helpers/governance'

let payload: Payload
let admin: Awaited<ReturnType<typeof makeUser>>
const tag = `org${run}`
const noHeaders = new Headers()
const live = { draftModeOn: false, headers: noHeaders }

const gov = (name: string) => ({ ownerOffice: 'Registrar', source: `https://${tag}.invalid/${name}` })
const create = (collection: string, data: Record<string, unknown>) =>
  payload.create({ collection: collection as never, draft: true, data: data as never, ...as(admin) }) as unknown as Promise<{ id: number }>
async function publish(collection: string, id: number) {
  const step = (data: Record<string, unknown>) => payload.update({ collection: collection as never, id, draft: true, data: data as never, ...as(admin) })
  await step({ governance: { status: 'in_review' } })
  await step({ governance: { status: 'approved', verificationStatus: 'verified', reviewDueAt: '2027-12-31T00:00:00.000Z' } })
  await payload.update({ collection: collection as never, id, data: { _status: 'published' } as never, ...as(admin) })
}
const mk = async (collection: string, name: string, data: Record<string, unknown> = {}, published = true) => {
  const doc = await create(collection, { name, slug: name.toLowerCase().replaceAll(' ', '-'), generateSlug: false, governance: gov(name.replaceAll(' ', '-')), ...data })
  if (published) await publish(collection, doc.id)
  return doc
}

let group: { id: number }, dept: { id: number }, otherDept: { id: number }
beforeAll(async () => {
  payload = await getTestPayload()
  admin = await makeUser(payload, 'platformAdmin')
  group = await mk('faculties', `${tag} group`)
  dept = await mk('departments', `${tag} dept`, { facultyGroup: group.id, summary: 'First para\n\nSecond para' })
  otherDept = await mk('departments', `${tag} other dept`, { facultyGroup: group.id })
  await mk('departments', `${tag} draft dept`, {}, false)
  await mk('programmes', `${tag} bs one`, { department: dept.id, level: 'BS', duration: '4 years' })
  await mk('programmes', `${tag} ms two`, { department: dept.id, level: 'MS' })
  await mk('programmes', `${tag} elsewhere`, { department: otherDept.id })
  await mk('programmes', `${tag} draft programme`, { department: dept.id }, false)
  await mk('people', `${tag} current`, { department: dept.id, designation: 'Professor', email: `a@${tag}.invalid`, visibility: { email: 'hidden', photo: 'hidden' } })
  await mk('people', `${tag} public email`, { department: dept.id, email: `b@${tag}.invalid`, visibility: { email: 'public', photo: 'hidden' } })
  await mk('people', `${tag} former`, { department: dept.id, facultyStatus: 'former' })
  await mk('people', `${tag} draft person`, { department: dept.id }, false)
}, 120_000)

describe('departments', () => {
  it('lists published departments with their faculty group, and no draft', async () => {
    const mine = (await listDepartments()).filter((d) => d.name.startsWith(tag))
    expect(mine.map((d) => d.name).sort()).toEqual([`${tag} dept`, `${tag} other dept`])
    expect(mine.every((d) => d.groupName === `${tag} group`)).toBe(true)
  })
  it('serves a published department by slug, with group populated', async () => {
    const d = await getDepartment(`${tag}-dept`, live)
    expect(d).toMatchObject({ name: `${tag} dept`, facultyGroup: { name: `${tag} group` } })
  })
  it('does not serve a draft, even with draft mode on and no login', async () => {
    expect(await getDepartment(`${tag}-draft-dept`, live)).toBeNull()
    expect(await getDepartment(`${tag}-draft-dept`, { draftModeOn: true, headers: noHeaders })).toBeNull()
  })
})

describe('programmes', () => {
  it('lists published programmes with department names and skips drafts', async () => {
    const mine = (await listProgrammes()).filter((p) => p.name.startsWith(tag))
    expect(mine.map((p) => p.name).sort()).toEqual([`${tag} bs one`, `${tag} elsewhere`, `${tag} ms two`])
    expect(mine.find((p) => p.name.endsWith('bs one'))).toMatchObject({ level: 'BS', duration: '4 years', departmentName: `${tag} dept` })
  })
  it('lists only the programmes of one department', async () => {
    expect((await programmesOfDepartment(dept.id)).map((p) => p.name)).toEqual([`${tag} bs one`, `${tag} ms two`])
  })
  it('serves a programme by slug and not a draft one', async () => {
    expect(await getProgramme(`${tag}-bs-one`, live)).toMatchObject({ level: 'BS' })
    expect(await getProgramme(`${tag}-draft-programme`, live)).toBeNull()
  })
})

describe('people of a department', () => {
  it('lists current published people only, and an email only when its visibility is public', async () => {
    const people = await peopleOfDepartment(dept.id)
    expect(people.map((p) => p.name)).toEqual([`${tag} current`, `${tag} public email`])
    expect(people.find((p) => p.name.endsWith('current'))?.email).toBeNull()
    expect(people.find((p) => p.name.endsWith('public email'))?.email).toBe(`b@${tag}.invalid`)
  })
})
