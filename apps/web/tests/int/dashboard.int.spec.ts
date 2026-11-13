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

  it('"needs a fresh check" lists live items past their review date', async () => {
    const t = uniq('stale')
    const n = await toApproved(t, { reviewDueAt: '2026-12-01T00:00:00.000Z' })
    await payload.update({
      collection: 'notices',
      id: n.id,
      data: { _status: 'published', governance: {} } as never,
      ...as(approver),
    })
    expect(titles(await get(approver, 'stale', new Date('2026-11-20T00:00:00Z')))).not.toContain(t)
    expect(titles(await get(approver, 'stale', new Date('2027-01-01T00:00:00Z')))).toContain(t)
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
    expect(all.map((q) => q.key)).toEqual(['myDrafts', 'review', 'expiring', 'stale', 'needsAlt'])
    expect(all.every((q) => !q.partial)).toBe(true)
    console.info(`dashboard load for an approver: ${ms} ms`)
  })
})
