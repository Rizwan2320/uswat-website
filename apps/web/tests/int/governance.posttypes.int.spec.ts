// @vitest-environment node
/**
 * Slice 3d: Notices, Events, Jobs and Tenders go through the same workflow as every governed
 * type, and the expiry rules of Addendum 7 hold: LIF-04 (Jobs, Tenders, Events need an expiry),
 * LIF-01 (expiry archives), LIF-02 (no-expiry notices age out after 90 days unless pinned).
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { NOTICE_LISTING } from '../../src/collections/Notices'
import type { User } from '../../src/payload-types'
import { currentWhere } from '../../src/governance/lifecycle'
import { runLifecycleSweep } from '../../src/governance/sweep'
import { as, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

type Slug = 'notices' | 'events' | 'jobs' | 'tenders'
const SLUGS: Slug[] = ['notices', 'events', 'jobs', 'tenders']
const REQUIRE_EXPIRY: Slug[] = ['events', 'jobs', 'tenders']

const DAY = 86_400_000
const iso = (ms: number) => new Date(ms).toISOString()

let payload: Payload
let editor: User, approver: User

const gov = (extra: Record<string, unknown> = {}) => ({
  ownerOffice: 'Registrar',
  source: 'https://example.test/source',
  ...extra,
})
const data = (slug: Slug, extra: Record<string, unknown> = {}, g: Record<string, unknown> = {}) =>
  ({
    title: uniq(slug),
    excerpt: 'Sample text',
    ...(slug === 'events' ? { startsAt: iso(Date.now() + DAY) } : {}),
    ...extra,
    governance: gov(g),
  }) as never

const create = (slug: Slug, user: User, extra = {}, g = {}) =>
  payload.create({
    collection: slug,
    draft: true,
    data: data(slug, extra, g),
    ...as(user),
  }) as Promise<{ id: number; governance?: Record<string, unknown> }>
const step = (slug: Slug, user: User, id: number, governance: Record<string, unknown>) =>
  payload.update({
    collection: slug,
    id,
    draft: true,
    data: { governance } as never,
    ...as(user),
  })
const main = (slug: Slug, id: number) =>
  payload.findByID({ collection: slug, id, overrideAccess: true, depth: 0 }) as Promise<{
    _status?: string
    governance?: Record<string, unknown>
    bodyStatus?: string
  }>

async function toApproved(slug: Slug, extra = {}, g: Record<string, unknown> = {}) {
  const p = await create(slug, editor, extra, g)
  await step(slug, editor, p.id, { status: 'in_review' })
  await step(slug, approver, p.id, { status: 'approved', verificationStatus: 'verified' })
  return p
}
async function toLive(slug: Slug, extra = {}, g: Record<string, unknown> = {}) {
  const p = await toApproved(slug, extra, g)
  await payload.update({
    collection: slug,
    id: p.id,
    data: { _status: 'published', governance: {} } as never,
    ...as(approver),
  })
  return p
}

describe('post types', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, approver] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
    ])
  })

  describe.each(SLUGS)('%s', (slug) => {
    const expireAt = iso(Date.now() + 30 * DAY)

    it('walks draft > review > approved > published with the usual rules', async () => {
      const p = await create(slug, editor, {}, { expireAt })
      expect(p.governance).toMatchObject({ status: 'draft', verificationStatus: 'unverified' })
      expect((await main(slug, p.id)).bodyStatus ?? 'full').toBe('full')

      await step(slug, editor, p.id, { status: 'in_review' })
      expect(
        await refusal(() => step(slug, editor, p.id, { verificationStatus: 'verified' })),
      ).toBe('VERIFY_FORBIDDEN')
      await step(slug, approver, p.id, { status: 'approved', verificationStatus: 'verified' })
      await payload.update({
        collection: slug,
        id: p.id,
        data: { _status: 'published', governance: {} } as never,
        ...as(approver),
      })
      const live = await main(slug, p.id)
      expect(live._status).toBe('published')
      expect(live.governance?.status).toBe('published')
    })

    it('VER-01: an unverified record cannot be published', async () => {
      const p = await create(slug, editor, {}, { expireAt })
      await step(slug, editor, p.id, { status: 'in_review' })
      await step(slug, approver, p.id, { status: 'approved' })
      expect(
        await refusal(() =>
          payload.update({
            collection: slug,
            id: p.id,
            data: { _status: 'published', governance: {} } as never,
            ...as(approver),
          }),
        ),
      ).not.toBeNull()
    })

    it('records its changes in the audit log', async () => {
      const p = await create(slug, editor, {}, { expireAt })
      const log = await payload.find({
        collection: 'audit-logs',
        where: { and: [{ collection: { equals: slug } }, { recordId: { equals: String(p.id) } }] },
        overrideAccess: true,
      })
      expect(log.totalDocs).toBeGreaterThanOrEqual(1)
    })
  })

  describe('LIF-04: expiry required', () => {
    it.each(REQUIRE_EXPIRY)('%s: cannot leave draft without an expiry', async (slug) => {
      const p = await create(slug, editor) // a draft may be saved without one
      expect(await refusal(() => step(slug, editor, p.id, { status: 'in_review' }))).toBe(
        'EXPIRY_REQUIRED',
      )
      await step(slug, editor, p.id, { expireAt: iso(Date.now() + DAY), status: 'in_review' })
    })

    it('notices do not need one', async () => {
      const p = await create('notices', editor)
      await step('notices', editor, p.id, { status: 'in_review' })
    })

    it('an approver cannot publish a job that has no expiry either', async () => {
      const p = await create('jobs', editor)
      expect(await refusal(() => step('jobs', approver, p.id, { status: 'approved' }))).toBe(
        'EXPIRY_REQUIRED',
      )
    })
  })

  describe('LIF-01 and LIF-02', () => {
    it('the sweep archives an expired job and an expired event', async () => {
      const job = await toLive('jobs', {}, { expireAt: iso(Date.now() + DAY) })
      const event = await toLive('events', {}, { expireAt: iso(Date.now() + DAY) })
      const report = await runLifecycleSweep(payload, {
        now: new Date(Date.now() + 2 * DAY),
        collections: ['jobs', 'events'],
        context: system.context,
      })
      expect(report.collections.jobs.archived).toBeGreaterThanOrEqual(1)
      expect(report.collections.events.archived).toBeGreaterThanOrEqual(1)
      expect((await main('jobs', job.id)).governance?.status).toBe('archived')
      expect((await main('events', event.id)).governance?.status).toBe('archived')
    })

    it('a notice with no expiry ages out after 90 days unless pinned or given an expiry', async () => {
      const old = iso(Date.now() - 100 * DAY)
      const recent = await toLive('notices', { publishedAt: iso(Date.now() - 10 * DAY) })
      const aged = await toLive('notices', { publishedAt: old })
      const withEnd = await toLive(
        'notices',
        { publishedAt: old },
        { expireAt: iso(Date.now() + 5 * DAY) },
      )
      // Only a reviewer can pin, so the approver creates this one.
      const pinned = await create('notices', approver, { publishedAt: old }, { pinned: true })
      await step('notices', approver, pinned.id, { status: 'in_review' })
      await step('notices', approver, pinned.id, {
        status: 'approved',
        verificationStatus: 'verified',
      })
      await payload.update({
        collection: 'notices',
        id: pinned.id,
        data: { _status: 'published', governance: {} } as never,
        ...as(approver),
      })

      const ids = [recent.id, aged.id, withEnd.id, pinned.id]
      const found = (
        await payload.find({
          collection: 'notices',
          where: { and: [currentWhere(new Date(), NOTICE_LISTING), { id: { in: ids } }] },
          overrideAccess: true,
          depth: 0,
        })
      ).docs.map((d) => d.id)

      expect(found.sort()).toEqual([recent.id, withEnd.id, pinned.id].sort())
      expect(found).not.toContain(aged.id)
    })

    it('the publish date is filled in when a record is published without one', async () => {
      const p = await toLive('notices')
      const row = (await payload.findByID({
        collection: 'notices',
        id: p.id,
        overrideAccess: true,
        depth: 0,
      })) as { publishedAt?: string | null }
      expect(row.publishedAt).toBeTruthy()
    })
  })

  describe('News (posts)', () => {
    it('has the body status field with the default', async () => {
      const post = await payload.create({
        collection: 'posts',
        draft: true,
        data: {
          title: uniq('post'),
          governance: gov(),
        } as never,
        ...as(editor),
      })
      expect((post as { bodyStatus?: string }).bodyStatus).toBe('full')
    })
  })
})
