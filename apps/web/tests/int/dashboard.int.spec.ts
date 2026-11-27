// @vitest-environment node
/**
 * CMS-09: the editor dashboard loads what each role is meant to see, with that person's own access.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { loadDashboard } from '../../src/governance/dashboardData'
import { runLifecycleSweep } from '../../src/governance/sweep'
import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, system, uniq } from '../helpers/governance'

const DAY = 86_400_000
let payload: Payload
let editor: User, otherEditor: User, approver: User, auditor: User, contributor: User

const gov = (extra: Record<string, unknown> = {}) => ({
  ownerOffice: 'Registrar',
  source: 'https://example.test/source',
  ...extra,
})
const notice = (user: User, title: string, g: Record<string, unknown> = {}, extra = {}) =>
  payload.create({
    collection: 'notices',
    draft: true,
    data: { title, excerpt: 'Sample', ...extra, governance: gov(g) } as never,
    ...as(user),
  }) as Promise<{ id: number }>
const step = (id: number, user: User, governance: Record<string, unknown>) =>
  payload.update({
    collection: 'notices',
    id,
    draft: true,
    data: { governance } as never,
    ...as(user),
  })
const toApproved = async (title: string, g: Record<string, unknown> = {}) => {
  const n = await notice(editor, title, g)
  await step(n.id, editor, { status: 'in_review' })
  await step(n.id, approver, { status: 'approved', verificationStatus: 'verified' })
  return n
}
const get = async (user: User, key: string, now?: Date) =>
  (await loadDashboard(payload, user as never, now)).find((q) => q.key === key)
const titles = (q?: { items: { title: string }[] }) => q?.items.map((i) => i.title) ?? []

describe('editor dashboard', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, otherEditor, approver, auditor, contributor] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
      makeUser(payload, 'auditor'),
      makeUser(payload, 'contributor', ['Registrar']),
    ])
  })

  it("my drafts lists my own drafts, not other people's, and never offers a review queue to an editor", async () => {
    const mine = uniq('mine'),
      theirs = uniq('theirs')
    await notice(editor, mine)
    await notice(otherEditor, theirs)
    const q = await get(editor, 'myDrafts')
    expect(titles(q)).toContain(mine)
    expect(titles(q)).not.toContain(theirs)
    expect(await get(editor, 'review')).toBeUndefined()
    expect(await get(editor, 'stale')).toBeUndefined()
    expect(await get(editor, 'needsAlt')).toBeUndefined()
  })

  it('a contributor sees only their own drafts', async () => {
    const mine = uniq('contrib')
    await payload.create({
      collection: 'notices',
      draft: true,
      data: { title: mine, excerpt: 'Sample', governance: gov() } as never,
      ...as(contributor),
    })
    const q = await get(contributor, 'myDrafts')
    expect(titles(q)).toEqual([mine])
  })

  it("a submitted item leaves my drafts and enters the approver's review queue", async () => {
    const t = uniq('submitted')
    const n = await notice(editor, t)
    await step(n.id, editor, { status: 'in_review' })
    expect(titles(await get(editor, 'myDrafts'))).not.toContain(t)
    const review = await get(approver, 'review')
    expect(titles(review)).toContain(t)
    expect(review!.total).toBeGreaterThanOrEqual(1)
    expect(review!.items.find((i) => i.title === t)).toMatchObject({
      collection: 'notices',
      href: expect.stringMatching(/^\/admin\/collections\/notices\/\d+$/),
    })
  })

  it('the author follows an item: I sent for review, then Sent back to me with the reason, then back out of it when sent again', async () => {
    const t = uniq('followed')
    const n = await notice(editor, t)
    await step(n.id, editor, { status: 'in_review' })
    expect(titles(await get(editor, 'sentByMe'))).toContain(t)
    expect(titles(await get(editor, 'sentBack'))).not.toContain(t)

    await step(n.id, approver, { status: 'draft', reviewNote: 'Add the date.' })
    expect(titles(await get(editor, 'sentByMe'))).not.toContain(t)
    expect(titles(await get(editor, 'sentBack'))).toContain(t)
    // Listed once: a sent-back item is not repeated under My drafts.
    expect(titles(await get(editor, 'myDrafts'))).not.toContain(t)
    // Someone else's list does not show it.
    expect(titles(await get(otherEditor, 'sentBack'))).not.toContain(t)

    await step(n.id, editor, { status: 'in_review', reviewNote: '' })
    expect(titles(await get(editor, 'sentBack'))).not.toContain(t)
    expect(titles(await get(editor, 'sentByMe'))).toContain(t)
  })

  it('approvers get no author lists, and the review list comes first', async () => {
    const all = await loadDashboard(payload, approver as never)
    expect(all.map((q) => q.key)[0]).toBe('review')
    expect(all.map((q) => q.key)).not.toContain('sentBack')
    expect(all.map((q) => q.key)).not.toContain('sentByMe')
  })

  it('imported drafts wait in the review queue', async () => {
    const t = uniq('imported')
    await payload.create({
      collection: 'notices',
      draft: true,
      data: { title: t, excerpt: 'Sample', governance: { ...gov(), origin: 'importer' } } as never,
      ...system,
    })
    expect(titles(await get(approver, 'review'))).toContain(t)
  })

  it('expiring soon lists items that end within the window, and not later ones', async () => {
    const soon = uniq('soon'),
      later = uniq('later')
    await toApproved(soon, { expireAt: new Date(Date.now() + 5 * DAY).toISOString() })
    await toApproved(later, { expireAt: new Date(Date.now() + 60 * DAY).toISOString() })
    expect(titles(await get(approver, 'expiring'))).toContain(soon)
    expect(titles(await get(approver, 'expiring'))).not.toContain(later)
    expect(titles(await get(editor, 'expiring'))).toContain(soon)
  })

  // Why the dates are in mid-2027: other specs in this suite run a global lifecycle sweep over every notice at a
  // future "now" (revalidate: today + 10 days, seo.search: 2027-01-01, governance.media: 2027-03-01), and the
  // files share one database and run in parallel. A sweep marks every live notice whose review date has passed
  // as "stale", so an item due on 2026-12-01 could flip to stale while this test was between its two checks
  // (seen once in CI, never the same code twice). An item due after every date those specs use cannot be touched.
  const STALE_DUE = '2027-06-01T00:00:00.000Z'
  const publishedDue = async (t: string) => {
    const n = await toApproved(t, { reviewDueAt: STALE_DUE })
    await payload.update({
      collection: 'notices',
      id: n.id,
      data: { _status: 'published', governance: {} } as never,
      ...as(approver),
    })
  }

  it('"needs a fresh check" lists live items past their review date', async () => {
    const t = uniq('stale')
    await publishedDue(t)
    expect(titles(await get(approver, 'stale', new Date('2027-05-01T00:00:00Z')))).not.toContain(t)
    expect(titles(await get(approver, 'stale', new Date('2027-07-01T00:00:00Z')))).toContain(t)
  })

  it('a global sweep run by another spec at its latest date does not change that list', async () => {
    const t = uniq('stale')
    await publishedDue(t)
    await runLifecycleSweep(payload, {
      now: new Date('2027-03-01T10:00:00.000Z'),
      collections: ['notices'],
      context: system.context,
    })
    expect(titles(await get(approver, 'stale', new Date('2027-05-01T00:00:00Z')))).not.toContain(t)
    expect(titles(await get(approver, 'stale', new Date('2027-07-01T00:00:00Z')))).toContain(t)
  })

  it('images without alt text are listed for reviewers only', async () => {
    const { default: sharp } = await import('sharp')
    const { randomBytes } = await import('node:crypto')
    const data = await sharp(randomBytes(20 * 20 * 3), {
      raw: { width: 20, height: 20, channels: 3 },
    })
      .png()
      .toBuffer()
    const m = await payload.create({
      collection: 'media',
      data: { sourcePage: 'https://example.test/old' } as never,
      file: { data, mimetype: 'image/png', name: `${uniq('dash')}.png`, size: data.length },
      ...system,
    })
    const q = await get(approver, 'needsAlt')
    expect(q!.items.map((i) => i.id)).toContain(m.id)
    expect(q!.items.find((i) => i.id === m.id)!.title).toMatch(/\.png$/)
    expect(await get(editor, 'needsAlt')).toBeUndefined()
  })

  it('the auditor gets no queues, and every queue loads without error', async () => {
    expect(await loadDashboard(payload, auditor as never)).toEqual([])
    const t0 = Date.now()
    const all = await loadDashboard(payload, approver as never)
    const ms = Date.now() - t0
    expect(all.map((q) => q.key)).toEqual([
      'review',
      'toPublish',
      'myDrafts',
      'stale',
      'expiring',
      'needsAlt',
    ])
    expect(all.every((q) => !q.partial)).toBe(true)
    console.info(`dashboard load for an approver: ${ms} ms`)
  })
})

describe('role dashboards (slice 3ai)', () => {
  let admin: User, manager: User, hod: User, coord: User, plainEditor: User
  let prog: { id: number }
  let office: string

  const progs = (id: number) => ({ collection: 'programmes' as const, id, draft: true })
  const stepProg = (id: number, user: User, governance: Record<string, unknown>, data = {}) =>
    payload.update({ ...progs(id), data: { ...data, governance } as never, ...as(user) })
  const getQ = async (user: User, key: string) =>
    (await loadDashboard(payload, user as never)).find((q) => q.key === key)

  beforeAll(async () => {
    payload = await getTestPayload()
    office = uniq('dcst')
    ;[admin, manager] = await Promise.all([
      makeUser(payload, 'platformAdmin'),
      makeUser(payload, 'siteManager'),
    ])
    const dept = (await payload.create({
      collection: 'departments',
      draft: true,
      data: {
        name: uniq('dept'),
        governance: { ownerOffice: office, source: 'https://e.test/s' },
      } as never,
      ...as(admin),
    })) as { id: number }
    prog = (await payload.create({
      collection: 'programmes',
      draft: true,
      data: {
        name: uniq('prog'),
        department: dept.id,
        governance: { source: 'https://e.test/s' },
      } as never,
      ...as(admin),
    })) as { id: number }
    hod = await makeUser(payload, 'approver', [office])
    plainEditor = await makeUser(payload, 'editor', [office])
    const c = await makeUser(payload, 'editor', [])
    await payload.update({
      collection: 'users',
      id: c.id,
      data: { programmes: [prog.id] } as never,
      overrideAccess: true,
    })
    coord = (await payload.findByID({
      collection: 'users',
      id: c.id,
      depth: 0,
      overrideAccess: true,
    })) as User
  })

  it('a coordinator gets "Ready for you to publish" once the head approved and verified, not before', async () => {
    await stepProg(prog.id, coord, { status: 'in_review' })
    expect(await getQ(coord, 'toPublish')).toMatchObject({
      title: 'Ready for you to publish',
      total: 0,
    })
    await stepProg(prog.id, hod, { status: 'approved' })
    expect((await getQ(coord, 'toPublish'))?.total).toBe(0) // approved but not verified yet
    await stepProg(prog.id, hod, { verificationStatus: 'verified' })
    const q = await getQ(coord, 'toPublish')
    expect(q?.items.map((i) => i.id)).toContain(prog.id)
  })

  it('the head sees the same page under "Approved, ready to publish"; an office editor has no such list', async () => {
    expect((await getQ(hod, 'toPublish'))?.items.map((i) => i.id)).toContain(prog.id)
    expect(await getQ(plainEditor, 'toPublish')).toBeUndefined()
  })

  it('the head’s review list has plainer words', async () => {
    expect((await getQ(hod, 'review'))?.title).toBe('Waiting for your review')
    expect((await getQ(admin, 'review'))?.title).toBe('Waiting for review')
  })

  it('a site manager is not asked to review their own item; an admin is (they may approve it)', async () => {
    const mk = async (user: User, title: string) => {
      const n = await notice(user, title, { ownerOffice: 'Registrar' })
      await step(n.id, user, { status: 'in_review' })
      return title
    }
    const mine = await mk(manager, uniq('manager-own'))
    const adminOwn = await mk(admin, uniq('admin-own'))
    expect(titles(await getQ(manager, 'review'))).not.toContain(mine)
    expect(titles(await getQ(admin, 'review'))).toContain(adminOwn)
    // Someone else's item waits for them as before.
    expect(titles(await getQ(admin, 'review'))).toContain(mine)
  })

  it('"Expiring soon" lists only what you look after: another office’s item is not shown to a head or a coordinator', async () => {
    const t = uniq('registrar-expiring')
    await toApproved(t, { expireAt: new Date(Date.now() + 3 * DAY).toISOString() })
    expect(titles(await getQ(approver, 'expiring'))).toContain(t) // the Registrar's own head
    expect(titles(await getQ(hod, 'expiring'))).not.toContain(t)
    expect(titles(await getQ(coord, 'expiring'))).not.toContain(t)
    expect(titles(await getQ(admin, 'expiring'))).toContain(t)
  })
})
