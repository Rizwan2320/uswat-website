// @vitest-environment node
/**
 * LIF-01 (expiry archives), scheduled publish, stale marking, current lists, LIF-03 (new
 * importer drafts are announced once). Real PostgreSQL; time is injected so the tests are exact.
 */
import type { Payload } from 'payload'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { currentWhere, reviewQueueWhere } from '../../src/governance/lifecycle'
import { resetNotifier, setNotifier, type ReviewNotification } from '../../src/governance/notify'
import { runLifecycleSweep } from '../../src/governance/sweep'
import { as, getTestPayload, makeUser, pageData, system, uniq } from '../helpers/governance'

const NOW = new Date('2027-03-01T10:00:00.000Z')
const PAST = '2027-02-01T00:00:00.000Z'
const FUTURE = '2027-06-01T00:00:00.000Z'

let payload: Payload
let editor: User, approver: User

const sweep = () =>
  runLifecycleSweep(payload, { now: NOW, collections: ['pages'], context: system.context })
const main = (id: number) =>
  payload.findByID({ collection: 'pages', id, overrideAccess: true, depth: 0 })
const draftOf = (id: number) =>
  payload.findByID({ collection: 'pages', id, draft: true, overrideAccess: true, depth: 0 })
const auditFor = async (id: number) =>
  (
    await payload.find({
      collection: 'audit-logs',
      where: { and: [{ collection: { equals: 'pages' } }, { recordId: { equals: String(id) } }] },
      sort: 'createdAt',
      overrideAccess: true,
      limit: 50,
    })
  ).docs

/** A page that is approved (and verified unless told otherwise). */
async function approvedPage(gov: Record<string, unknown> = {}, verified = true) {
  const p = await payload.create({
    collection: 'pages',
    draft: true,
    data: pageData(gov),
    ...as(editor),
  })
  await payload.update({
    collection: 'pages',
    id: p.id,
    draft: true,
    data: { governance: { status: 'in_review' } },
    ...as(editor),
  })
  await payload.update({
    collection: 'pages',
    id: p.id,
    draft: true,
    data: {
      governance: {
        status: 'approved',
        ...(verified ? { verificationStatus: 'verified' } : {}),
      },
    },
    ...as(approver),
  })
  return p
}

async function livePage(gov: Record<string, unknown> = {}) {
  const p = await approvedPage(gov)
  await payload.update({
    collection: 'pages',
    id: p.id,
    data: { _status: 'published', governance: {} },
    ...as(approver),
  })
  return p
}

describe('lifecycle sweep', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, approver] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
    ])
  })

  it('LIF-01: archives a live record at its expiry and writes an audit entry', async () => {
    const p = await livePage({ expireAt: PAST })
    const report = await sweep()
    expect(report.collections.pages.archived).toBeGreaterThanOrEqual(1)

    expect((await main(p.id)).governance?.status).toBe('archived')
    const last = (await auditFor(p.id)).at(-1)
    expect(last).toMatchObject({ actorKind: 'system', action: 'update' })
    expect(JSON.stringify(last?.changes)).toContain('archived')
  })

  it('leaves records alone before their expiry, and is idempotent', async () => {
    const p = await livePage({ expireAt: FUTURE })
    await sweep()
    expect((await main(p.id)).governance?.status).toBe('published')

    const q = await livePage({ expireAt: PAST })
    await sweep()
    const entries = (await auditFor(q.id)).length
    await sweep()
    expect((await auditFor(q.id)).length).toBe(entries)
  })

  it('archiving keeps the title, layout and any pending draft untouched', async () => {
    const p = await livePage({ expireAt: PAST })
    const before = await main(p.id)
    await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { title: 'Pending edit' },
      ...as(approver),
    })
    await sweep()
    const after = await main(p.id)
    expect(after.title).toBe(before.title)
    expect(after.layout).toEqual(before.layout)
    expect(after.governance?.status).toBe('archived')
    expect((await draftOf(p.id)).title).toBe('Pending edit')
  })

  it('marks a verified live record Stale when its review is overdue', async () => {
    const p = await livePage({ reviewDueAt: PAST })
    const report = await sweep()
    expect(report.collections.pages.markedStale).toBeGreaterThanOrEqual(1)
    expect((await main(p.id)).governance).toMatchObject({
      status: 'published',
      verificationStatus: 'stale',
    })
    const queue = await payload.find({
      collection: 'pages',
      where: { and: [reviewQueueWhere(), { id: { equals: p.id } }] },
      overrideAccess: true,
      depth: 0,
    })
    expect(queue.totalDocs).toBe(1)
  })

  it('publishes an approved, verified record when its publish time arrives', async () => {
    const due = await approvedPage({ publishAt: PAST })
    const later = await approvedPage({ publishAt: FUTURE })
    const report = await sweep()
    expect(report.collections.pages.published).toBeGreaterThanOrEqual(1)
    expect((await main(due.id)).governance?.status).toBe('published')
    expect((await main(due.id))._status).toBe('published')
    expect((await draftOf(later.id)).governance?.status).toBe('approved')
  })

  it('VER-01: a scheduled publish of an unverified record is refused and reported', async () => {
    const p = await approvedPage({ publishAt: PAST }, false)
    const report = await sweep()
    expect(report.collections.pages.skipped.some((s) => String(s.id) === String(p.id))).toBe(true)
    expect((await draftOf(p.id)).governance?.status).toBe('approved')
    expect((await draftOf(p.id))._status).toBe('draft')
  })

  it('never publishes something that has already expired', async () => {
    const p = await approvedPage({ publishAt: PAST, expireAt: PAST })
    const report = await sweep()
    expect(
      report.collections.pages.skipped.find((s) => String(s.id) === String(p.id)),
    ).toMatchObject({ reason: 'ALREADY_EXPIRED' })
    expect((await draftOf(p.id))._status).toBe('draft')
  })
})

describe('current lists', () => {
  it('hide expired records before the sweep has run, and age notices out unless pinned', async () => {
    const expired = await livePage({ expireAt: PAST })
    const open = await livePage({ expireAt: FUTURE })
    const plain = await livePage()
    const ids = [expired.id, open.id, plain.id]
    const find = async (where: ReturnType<typeof currentWhere>) =>
      (
        await payload.find({
          collection: 'pages',
          where: { and: [where, { id: { in: ids } }] },
          overrideAccess: true,
          depth: 0,
        })
      ).docs.map((d) => d.id)

    expect((await find(currentWhere(NOW))).sort()).toEqual([open.id, plain.id].sort())

    // 100 days later a record with no end date has aged out; one with its own end date has not.
    const later = new Date(Date.now() + 100 * 86_400_000)
    const aged = await find(
      currentWhere(new Date(later.getTime()), { ageOutDays: 90, dateField: 'createdAt' }),
    )
    expect(aged).toContain(open.id)
    expect(aged).not.toContain(plain.id)
    expect(aged).not.toContain(expired.id)
  })
})

describe('LIF-03 notification', () => {
  afterEach(() => resetNotifier())

  it('announces a new importer draft once, and not later edits or editor drafts', async () => {
    const sent: ReviewNotification[] = []
    setNotifier({ send: (n) => void sent.push(n) })

    const p = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({ origin: 'importer' }, uniq('imported')),
      ...system,
    })
    await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { title: uniq('retitled') },
      ...system,
    })
    await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({}),
      ...as(editor),
    })

    expect(sent.filter((n) => String(n.id) === String(p.id))).toHaveLength(1)
    expect(sent.every((n) => n.origin === 'importer')).toBe(true)
  })
})

describe('the scheduled task', () => {
  it('runs the sweep through the job queue and stores the report', async () => {
    const p = await livePage({ expireAt: '2026-01-01T00:00:00.000Z' })
    await payload.jobs.queue({ task: 'lifecycleSweep', input: {}, queue: 'lifecycle' })
    await payload.jobs.run({ queue: 'lifecycle', overrideAccess: true })

    expect((await main(p.id)).governance?.status).toBe('archived')
    // Finished jobs are deleted by default; a failed one would stay behind with its error.
    const failed = await payload.find({
      collection: 'payload-jobs',
      where: { and: [{ taskSlug: { equals: 'lifecycleSweep' } }, { hasError: { equals: true } }] },
      overrideAccess: true,
    })
    expect(failed.totalDocs).toBe(0)
  })
})
