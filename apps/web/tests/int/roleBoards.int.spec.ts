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
let otherHead: User, siteManager: User, auditor: User, plainEditor: User
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
  otherHead = await makeUser(payload, 'approver', [uniq('maths')])
  siteManager = await makeUser(payload, 'siteManager', [office])
  auditor = await makeUser(payload, 'auditor', [office])
  // An editor with no programme is a writer, not a coordinator.
  plainEditor = await makeUser(payload, 'editor', [office])
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

  it('nor does a site manager, an auditor, or an editor who coordinates no programme, even in the same office', async () => {
    for (const u of [siteManager, auditor, plainEditor]) expect(await board(u), u.role ?? '').toEqual([])
  })
})

describe('the parts of a page and the live link reach only the head who runs it and the coordinator who runs it (slice 3ar)', () => {
  const partsOf = (b: Awaited<ReturnType<typeof board>>, collection: string, id: number) =>
    b.find((x) => x.collection === collection && x.id === id)

  it('the head sees the parts of the department page and of each programme, and no live link while they are drafts', async () => {
    const b = await board(hod)
    const d = partsOf(b, 'departments', dept.id)!
    expect(d.parts).toHaveLength(11)
    expect(d.parts.every((p) => !p.filled)).toBe(true)
    expect(d.liveHref).toBeNull()
    const p = partsOf(b, 'programmes', se.id)!
    expect(p.parts).toHaveLength(10)
    expect(p.liveHref).toBeNull()
  })

  it('a coordinator sees the parts of their own programme only, and what they fill is counted', async () => {
    await payload.update({
      collection: 'programmes',
      id: se.id,
      draft: true,
      data: {
        pageContent: { summary: 'A summary.', outcomes: [{ text: 'One' }, { text: 'Two' }] },
      } as never,
      ...as(admin),
    })
    const b = await board(coordSe)
    expect(b.map((x) => `${x.collection}:${x.id}`)).toEqual([`programmes:${se.id}`])
    const parts = Object.fromEntries(b[0]!.parts.map((x) => [x.key, x]))
    expect(parts.summary!.filled).toBe(true)
    expect(parts.outcomes!.count).toBe(2)
    expect(parts.faq!.filled).toBe(false)
    expect(await board(coordAi)).not.toContainEqual(expect.objectContaining({ id: se.id }))
  })

  it('a live page gets its public address on the board of its own head and coordinator, and nobody else gets the page at all', async () => {
    await step(se.id, admin, { status: 'approved', verificationStatus: 'verified' })
    await payload.update({
      collection: 'programmes',
      id: se.id,
      data: { _status: 'published', governance: {} } as never,
      ...as(admin),
    })
    const slug = ((await payload.findByID({
      collection: 'programmes',
      id: se.id,
      depth: 0,
      overrideAccess: true,
    })) as { slug?: string }).slug
    const own = [hod, coordSe]
    for (const u of own) {
      const row = partsOf(await board(u), 'programmes', se.id)!
      expect(row.liveHref, u.name ?? '').toBe(`/academics/programmes/${slug}`)
    }
    // Same office, but not their page; and a head of another department, who may read the live page.
    const strangers = [coordAi, otherHead, siteManager, auditor, plainEditor, contributor, admin]
    for (const u of strangers)
      expect((await board(u)).find((x) => x.id === se.id && x.collection === 'programmes'), u.role ?? '').toBeUndefined()
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
