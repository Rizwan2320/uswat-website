// @vitest-environment node
/** P3v-a: finished sweep runs are kept, and only old runs of the sweep task are pruned. */
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { pruneSweepHistory } from '../../src/governance/sweepHistory'
import { getTestPayload } from '../helpers/governance'

let payload: Payload
const made: string[] = []
const NOW = Date.parse('2027-03-31T10:00:00.000Z')
const DAY = 86_400_000

async function job(taskSlug: string, ageDays: number) {
  const created = await payload.db.create({
    collection: 'payload-jobs',
    data: {
      taskSlug,
      queue: 'lifecycle',
      completedAt: new Date(NOW - ageDays * DAY).toISOString(),
      hasError: false,
      createdAt: new Date(NOW - ageDays * DAY).toISOString(),
    },
  })
  const id = String((created as { id: string | number }).id)
  made.push(id)
  return id
}
const exists = async (id: string) =>
  (await payload.find({ collection: 'payload-jobs', where: { id: { equals: id } }, overrideAccess: true, limit: 1 }))
    .totalDocs === 1

beforeAll(async () => {
  payload = await getTestPayload()
}, 120_000)

afterAll(async () => {
  if (made.length)
    await payload.delete({
      collection: 'payload-jobs',
      where: { id: { in: made } },
      overrideAccess: true,
    })
})

describe('sweep history', () => {
  it('keeps finished jobs on this config', () => {
    expect(payload.config.jobs.deleteJobOnComplete).toBe(false)
  })

  it('removes sweep runs older than the retention period and nothing else', async () => {
    const old = await job('lifecycleSweep', 45)
    const recent = await job('lifecycleSweep', 5)
    const today = await job('lifecycleSweep', 0)
    const oldOther = await job('inline', 45)
    const removed = await pruneSweepHistory(payload, NOW)
    expect(removed).toBeGreaterThanOrEqual(1)
    expect(await exists(old)).toBe(false)
    expect(await exists(recent)).toBe(true)
    expect(await exists(today)).toBe(true)
    expect(await exists(oldOther)).toBe(true)
  }, 120_000)
})
