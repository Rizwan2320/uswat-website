/**
 * How a seed run spends its time. Against a hosted database each statement costs a round trip (about 0.2 s to
 * Singapore), so a sequential seed of ~7,000 statements takes ~27 min. Independent records are written a few at a
 * time instead, and a run can stop cleanly at a deadline: every seed step skips finished work, so the next run
 * continues where this one stopped (prediction A4-q).
 */
export type Run = {
  /** Records in flight at once. 1 is the old, strictly sequential behaviour. */
  concurrency: number
  /** Epoch ms after which no new record is started. Unset means no limit. */
  deadline?: number
  /** Set by `runPool` when the deadline cut the work short. */
  stopped?: boolean
}

export const SEQUENTIAL: Run = { concurrency: 1 }
/** Payload's connection pool holds 10; leave room for the hooks that open a second connection. */
export const MAX_CONCURRENCY = 8
export const DEFAULT_CONCURRENCY = 6
export const DEFAULT_BUDGET_MS = 30 * 60 * 1000

export type RunEnv = Record<string, string | undefined>

/** SEED_CONCURRENCY (1..8, default 6) and SEED_TIME_BUDGET_MS (default 30 min, 0 means no limit), read once. */
export function runFromEnv(env: RunEnv, now = Date.now()): Run {
  const n = Number.parseInt(env.SEED_CONCURRENCY ?? '', 10)
  const concurrency = Number.isFinite(n) ? Math.min(MAX_CONCURRENCY, Math.max(1, n)) : DEFAULT_CONCURRENCY
  const b = Number.parseInt(env.SEED_TIME_BUDGET_MS ?? '', 10)
  const budget = Number.isFinite(b) && b >= 0 ? b : DEFAULT_BUDGET_MS
  return budget === 0 ? { concurrency } : { concurrency, deadline: now + budget }
}

/** The same concurrency without the deadline: used where stopping part-way would leave broken links. */
export const withoutDeadline = (run: Run): Run => ({ concurrency: run.concurrency })

/**
 * Runs `fn` over `items` with at most `run.concurrency` in flight. Items start in order. After the deadline no new
 * item starts (`run.stopped` is set). After a failure no new item starts, the ones already running finish, and the
 * first error is thrown.
 */
export async function runPool<T>(items: readonly T[], run: Run, fn: (item: T, index: number) => Promise<void>): Promise<void> {
  let next = 0
  let failed = false
  let firstError: unknown
  const worker = async (): Promise<void> => {
    while (!failed) {
      if (run.deadline !== undefined && Date.now() >= run.deadline) {
        if (next < items.length) run.stopped = true
        return
      }
      const i = next++
      if (i >= items.length) return
      try {
        await fn(items[i]!, i)
      } catch (e) {
        if (!failed) firstError = e
        failed = true
      }
    }
  }
  const workers = Math.max(1, Math.min(run.concurrency, items.length))
  await Promise.all(Array.from({ length: workers }, worker))
  if (failed) throw firstError
}
