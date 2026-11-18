/**
 * Session lifetime (Addendum C SES-04): idle timeout 30 minutes, absolute lifetime 12 hours.
 * [PROPOSED in the spec; university IT can adjust.] Pure functions, so the boundaries are tested
 * without a database. The "shared computer" option (15 minutes idle) is chosen at sign-in (sharedComputer.ts).
 */
export const IDLE_MS = 30 * 60_000
/** "Shared computer" sessions: idle limit 15 minutes. The absolute limit is the same. */
export const SHARED_IDLE_MS = 15 * 60_000
export const ABSOLUTE_MS = 12 * 60 * 60_000
/** Activity is written at most this often, so a busy page does not write on every request. */
export const TOUCH_INTERVAL_MS = 60_000

export type SessionVerdict = 'ok' | 'idle' | 'absolute' | 'invalid'

type Stamp = Date | string | number | undefined | null

function ms(v: Stamp): number | null {
  if (v === undefined || v === null) return null
  const t = v instanceof Date ? v.getTime() : typeof v === 'number' ? v : typeof v === 'string' ? Date.parse(v) : NaN
  return Number.isFinite(t) ? t : null
}

/** Unreadable timestamps fail closed ('invalid'): a session we cannot date is not trusted. */
export function evaluateSession(input: { createdAt: Stamp; updatedAt: Stamp; now: number; shared?: boolean }): SessionVerdict {
  const created = ms(input.createdAt)
  const updated = ms(input.updatedAt)
  if (created === null || updated === null) return 'invalid'
  if (input.now - created > ABSOLUTE_MS) return 'absolute'
  if (input.now - updated > (input.shared ? SHARED_IDLE_MS : IDLE_MS)) return 'idle'
  return 'ok'
}

export function shouldTouch(updatedAt: Date, now: number): boolean {
  return now - updatedAt.getTime() >= TOUCH_INTERVAL_MS
}
