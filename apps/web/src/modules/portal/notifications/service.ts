/** What the notifications screen and the digest command do, free of Next and PostgreSQL. The account always comes from the session. */
import { buildLines } from './digest'
import { LOG_PAGE } from './kinds'
import { validatePref, type PrefErrors } from './rules'
import type { NotificationStore, Overview } from './types'

export type SaveResult = { ok: true } | { ok: false; error: 'session' | 'invalid'; errors?: PrefErrors }
export { buildLines }

export function createNotificationService(deps: { store: NotificationStore; getAccount: () => Promise<{ id: string } | null>; now?: () => number }) {
  const now = deps.now ?? Date.now
  return {
    async overview(): Promise<{ ok: true; value: Overview } | { ok: false; error: 'session' }> {
      const me = await deps.getAccount()
      if (!me) return { ok: false, error: 'session' }
      const [cadence, waiting, log] = await Promise.all([deps.store.getCadence(me.id), deps.store.waiting(me.id), deps.store.log(me.id, LOG_PAGE)])
      return { ok: true, value: { cadence, waiting, log } }
    },
    async setCadence(input: unknown): Promise<SaveResult> {
      const me = await deps.getAccount()
      if (!me) return { ok: false, error: 'session' }
      const v = validatePref(input)
      if (!v.ok) return { ok: false, error: 'invalid', errors: v.errors }
      await deps.store.setCadence(me.id, v.value, now())
      return { ok: true }
    },
  }
}

/** The operator command's loop: every person with waiting items, one `buildDigest` each. Returns counts only. */
export async function runDigests(store: NotificationStore, now: number, opts: { dryRun?: boolean; limit?: number } = {}): Promise<{ people: number; built: number; skipped: number }> {
  const ids = await store.withWaiting(opts.limit ?? 1000)
  let built = 0
  for (const id of ids) {
    if (opts.dryRun) continue
    const r = await store.buildDigest(id, now)
    if (r.built) built++
  }
  return { people: ids.length, built, skipped: ids.length - built }
}
