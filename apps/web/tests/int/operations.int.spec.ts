// @vitest-environment node
/** P3t-b: the Operations loader on a real database. Who may see it, and that the office tally reads draft versions. */
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { loadOperations } from '../../src/governance/operations'
import { as, getTestPayload, makeUser, pageData, system, uniq } from '../helpers/governance'

let payload: Payload
const users: Record<string, User> = {}
const pages: number[] = []
const jobs: string[] = []
// Offices are stored in lower case by the governance hook.
const OFFICE = uniq('office').toLowerCase()

const find = (o: Awaited<ReturnType<typeof loadOperations>>) => o?.offices.find((t) => t.office === OFFICE)

beforeAll(async () => {
  payload = await getTestPayload()
  for (const role of ['platformAdmin', 'siteManager', 'auditor', 'approver', 'editor', 'contributor'] as const)
    users[role] = await makeUser(payload, role, [OFFICE])

  // Two drafts and one record the editor sends for review, all in one office.
  for (let i = 0; i < 3; i++) {
    const p = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({ ownerOffice: OFFICE }),
      overrideAccess: true,
      ...system,
    })
    pages.push(p.id)
  }
  await payload.update({
    collection: 'pages',
    id: pages[2],
    draft: true,
    data: { governance: { status: 'in_review' } },
    ...as(users.editor),
  })

  const job = await payload.db.create({
    collection: 'payload-jobs',
    data: { taskSlug: 'lifecycleSweep', queue: 'lifecycle', completedAt: new Date().toISOString(), hasError: false },
  })
  jobs.push(String((job as { id: string | number }).id))
}, 120_000)

afterAll(async () => {
  if (pages.length)
    await payload.delete({ collection: 'pages', where: { id: { in: pages } }, overrideAccess: true, ...system })
  if (jobs.length) await payload.delete({ collection: 'payload-jobs', where: { id: { in: jobs } }, overrideAccess: true })
})

describe('loadOperations', () => {
  it('is for platform admin, site manager and auditor only', async () => {
    for (const role of ['platformAdmin', 'siteManager', 'auditor'])
      expect(await loadOperations(payload, users[role]), role).not.toBeNull()
    for (const role of ['approver', 'editor', 'contributor'])
      expect(await loadOperations(payload, users[role]), role).toBeNull()
    expect(await loadOperations(payload, null)).toBeNull()
  })

  it('counts the latest saved version by office and reads draft versions', async () => {
    const ops = await loadOperations(payload, users.siteManager)
    expect(find(ops)).toMatchObject({ drafts: 2, inReview: 1 })
  })

  it('sees a recent sweep run', async () => {
    const ops = await loadOperations(payload, users.auditor)
    expect(ops?.sweep.last).not.toBeNull()
    expect(['ok', 'late', 'failed']).toContain(ops?.sweep.state)
  })

  it('answers quickly with a small number of records (P3t-b: under one second)', async () => {
    const t0 = performance.now()
    await loadOperations(payload, users.platformAdmin)
    const ms = performance.now() - t0
    console.log(`loadOperations took ${Math.round(ms)} ms`)
    expect(ms).toBeLessThan(1000)
  })
})
