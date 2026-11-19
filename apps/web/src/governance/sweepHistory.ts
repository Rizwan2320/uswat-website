/**
 * Keeps the sweep's own run history short (slice 3t). Payload's job rows are the history: with
 * `deleteJobOnComplete: false` each run stays, with `completedAt`, `hasError` and the report.
 * This removes `lifecycleSweep` runs older than SWEEP_HISTORY_DAYS. It touches no other task and
 * never a run from the last day, so a clock mistake cannot empty the history.
 */
import type { Payload } from 'payload'

import { SWEEP_HISTORY_DAYS } from './schedule'

const DAY_MS = 86_400_000

/** The moment before which a run is old enough to remove. Pure, so it can be tested. */
export function historyCutoff(nowMs: number, days: number = SWEEP_HISTORY_DAYS): string {
  return new Date(nowMs - Math.max(days, 1) * DAY_MS).toISOString()
}

/** Returns how many runs were removed. Never throws: failing to tidy must not fail the sweep. */
export async function pruneSweepHistory(payload: Payload, nowMs: number = Date.now()): Promise<number> {
  try {
    const removed = await payload.delete({
      collection: 'payload-jobs',
      where: {
        and: [
          { taskSlug: { equals: 'lifecycleSweep' } },
          { createdAt: { less_than: historyCutoff(nowMs) } },
        ],
      },
      overrideAccess: true,
    })
    return removed.docs.length
  } catch (error) {
    payload.logger.warn({ err: error }, 'Could not remove old sweep history')
    return 0
  }
}
