// @vitest-environment node
/**
 * The boards behind the head's and the coordinator's dashboards, and the coordinator's menu
 * (slice 3am). They are read with the person's own access.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { loadBoard } from '../../src/governance/roleBoards'
import { as, getTestPayload, makeUser, uniq } from '../helpers/governance'

let payload: Payload
let admin: User, hod: User, coordSe: User, coordAi: User, contributor: User
let dept: { id: number }, se: { id: number }, ai: { id: number }, otherProg: { id: number }
const office = uniq('dcst')

const gov = { source: 'https://e.test/s' }
const step = (id: number, user: User, governance: Record<string, unknown>) =>
  payload.update({
    collection: 'programmes',
    id,
    draft: true,
    data: { governance } as never,
    ...as(user),
  })
const board = async (u: User) => loadBoard(payload, { ...u, collection: 'users' } as never)

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await makeUser(payload, 'platformAdmin')
  hod = await makeUser(payload, 'approver', [office])
  contributor = await makeUser(payload, 'contributor', [office])
  const mk = (collection: 'departments' | 'programmes', data: object) =>
    payload.create({ collection, draft: true, data: data as never, ...as(admin) }) as Promise<{
      id: number
    }>
  dept = await mk('departments', {
    name: uniq('dept'),
    governance: { ownerOffice: office, ...gov },
  })
  se = await mk('programmes', { name: uniq('se'), department: dept.id, governance: gov })
  ai = await mk('programmes', { name: uniq('ai'), department: dept.id, governance: gov })
  const otherDept = await mk('departments', {
    name: uniq('other-dept'),
    governance: { ownerOffice: uniq('math'), ...gov },
  })
  otherProg = await mk('programmes', {
    name: uniq('other'),
    department: otherDept.id,
    governance: gov,
  })
  const coord = async (programmes: number[]) => {
    // As the head creates them: the team rule gives the coordinator the head's office.
    const c = await makeUser(payload, 'editor', [office])
    await payload.update({
      collection: 'users',
      id: c.id,
      data: { programmes } as never,
      overrideAccess: true,
    })
    return (await payload.findByID({
      collection: 'users',
      id: c.id,
      depth: 0,
      overrideAccess: true,
    })) as User
  }
  coordSe = await coord([se.id])
  coordAi = await coord([ai.id])
})

describe('the coordinator’s board', () => {
  it('holds their own programme and no other, with where it stands', async () => {
    const mine = await board(coordSe)
    expect(mine.map((b) => b.id)).toEqual([se.id])
    expect(mine[0]).toMatchObject({ collection: 'programmes', stage: 'draft', coordinators: [] })
    await step(se.id, coordSe, { status: 'in_review' })
    expect((await board(coordSe))[0].stage).toBe('in_review')
    await step(se.id, hod, { status: 'approved' })
    expect((await board(coordSe))[0]).toMatchObject({ stage: 'approved', verified: false })
    await step(se.id, hod, { verificationStatus: 'verified' })
    expect((await board(coordSe))[0]).toMatchObject({ stage: 'approved', verified: true })
    expect((await board(coordAi)).map((b) => b.id)).toEqual([ai.id])
  })

  it('carries the head’s reason when it is sent back', async () => {
    await step(ai.id, coordAi, { status: 'in_review' })
    await step(ai.id, hod, { status: 'draft', reviewNote: 'Add the fee for 2027' })
    expect((await board(coordAi))[0]).toMatchObject({
      stage: 'draft',
      sentBackNote: 'Add the fee for 2027',
    })
  })
})

describe('the head’s board', () => {
  it('holds the department page and its programmes, with the coordinators’ names, and no other department', async () => {
    const b = await board(hod)
    const ids = b.map((x) => `${x.collection}:${x.id}`)
    expect(ids).toContain(`departments:${dept.id}`)
    expect(ids).toContain(`programmes:${se.id}`)
    expect(ids).toContain(`programmes:${ai.id}`)
    expect(ids).not.toContain(`programmes:${otherProg.id}`)
    const seRow = b.find((x) => x.id === se.id && x.collection === 'programmes')
    expect(seRow?.coordinators).toEqual([coordSe.name])
  })
})

describe('another department’s live page does not turn up (published pages are public)', () => {
  it('a head and a coordinator do not see a page they do not look after, even when it is live', async () => {
    await step(otherProg.id, admin, { status: 'approved', verificationStatus: 'verified' })
    await payload.update({
      collection: 'programmes',
      id: otherProg.id,
      data: { _status: 'published', governance: {} } as never,
      ...as(admin),
    })
    const live = (await payload.findByID({
      collection: 'programmes',
      id: otherProg.id,
      draft: false,
      depth: 0,
      overrideAccess: true,
    })) as { _status?: string }
    expect(live._status).toBe('published')
    for (const u of [hod, coordSe, coordAi])
      expect(
        (await board(u)).map((b) => b.id),
        u.name ?? '',
      ).not.toContain(otherProg.id)
  })
})

describe('everyone else has no board', () => {
  it('the admin and a contributor get nothing here (their dashboards do not use it)', async () => {
    expect(await board(admin)).toEqual([])
    expect(await board(contributor)).toEqual([])
  })
})

describe('the coordinator’s menu (slice 3am)', () => {
  const hiddenFor = (slug: string, user: object | null) => {
    const hidden = payload.collections[slug as 'pages'].config.admin?.hidden
    return typeof hidden === 'function' ? Boolean(hidden({ user } as never)) : Boolean(hidden)
  }
  const as_ = (role: string, programmes?: number[]) => ({
    id: 1,
    collection: 'users',
    role,
    offices: [],
    programmes,
  })

  it('shows a coordinator their programmes and media only', () => {
    const c = as_('editor', [5])
    for (const slug of ['programmes', 'media']) expect(hiddenFor(slug, c), slug).toBe(false)
    for (const slug of ['pages', 'posts', 'notices', 'departments', 'events', 'users'])
      expect(hiddenFor(slug, c), slug).toBe(true)
  })

  it('leaves everyone else’s menu as it was', () => {
    for (const user of [as_('editor'), as_('editor', []), as_('approver'), as_('contributor')])
      for (const slug of ['pages', 'notices', 'programmes', 'departments'])
        expect(hiddenFor(slug, user), `${user.role} ${slug}`).toBe(false)
    expect(hiddenFor('users', as_('platformAdmin'))).toBe(false)
  })
})
