/**
 * The one cadence setting for the lifecycle sweep (main agent review of PR #3).
 *
 * Payload queues the task when `handle-schedules` is called, so this cron says how often a job may
 * be queued, and the GitHub Actions cron in `.github/workflows/lifecycle-sweep.yml` says how often
 * the site is called. They must match; `tests/unit/lifecycleSchedule.unit.spec.ts` fails if not.
 *
 * Hourly by default: every five minutes would query the database about 8,600 times a month and
 * keep the free Neon compute awake all day. Scheduled publish and expiry are therefore accurate to
 * about an hour. To tighten it, change this constant and the workflow cron together (for example
 * `*\/15 * * * *`), after checking the compute allowance of the database plan.
 * The minute is 17, not 0, because GitHub delays scheduled runs at the top of the hour.
 */
export const LIFECYCLE_CRON = '17 * * * *'
export const LIFECYCLE_QUEUE = 'lifecycle'
