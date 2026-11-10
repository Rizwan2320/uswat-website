import type { TaskConfig } from 'payload'

import { LIFECYCLE_CRON, LIFECYCLE_QUEUE } from './schedule'
import { runLifecycleSweep } from './sweep'

/**
 * Hourly (see schedule.ts): publish what is scheduled, archive what has expired, mark overdue
 * reviews Stale. Payload only queues scheduled tasks when `GET /api/payload-jobs/handle-schedules`
 * is called, and only runs them when `GET /api/payload-jobs/run?queue=lifecycle` is called, both
 * with `Authorization: Bearer $CRON_SECRET` (jobs.access.run in payload.config.ts). Something
 * outside the app has to make those two calls (see docs/briefs/p3c-lifecycle.md).
 */
export const lifecycleSweepTask: TaskConfig<'lifecycleSweep'> = {
  slug: 'lifecycleSweep',
  label: 'Lifecycle sweep',
  retries: 1,
  schedule: [{ cron: LIFECYCLE_CRON, queue: LIFECYCLE_QUEUE }],
  inputSchema: [],
  outputSchema: [{ name: 'report', type: 'json' }],
  handler: async ({ req }) => {
    const report = await runLifecycleSweep(req.payload)
    return { output: { report: report as unknown as Record<string, unknown> } }
  },
}
