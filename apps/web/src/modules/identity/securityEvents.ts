/**
 * The security log and the Platform Admin alert queue (FP-51, PJ8; tables `security_event` and `security_alert`, migration 0010).
 *
 * The log keeps what the spec lists and no more: account, type, outcome, a coarse network prefix and the time.
 * It never holds a password, code, token or full address. Recording an event must never stop a sign-in, so
 * `recordEvent` swallows its own errors; the alert path is the one place a failure is reported back.
 */
import type pg from 'pg'

export const EVENT_TYPES = [
  'sign-in-password', // the password was accepted (a session with no second factor yet, or the first step)
  'sign-in-passkey',
  'sign-in-authenticator',
  'sign-in-recovery',
  'sign-in-failed',
  'passkey-added',
  'passkey-removed',
  'recovery-codes-issued',
  'sign-out-everywhere',
  'not-me',
] as const
export type EventType = (typeof EVENT_TYPES)[number]
export type Outcome = 'success' | 'failure'

export const isEventType = (v: unknown): v is EventType => typeof v === 'string' && (EVENT_TYPES as readonly string[]).includes(v)

/** How many events the page shows (FP-51: "the last 50 sign-in events"). */
export const RECENT_LIMIT = 50
/** A failed password attempt is recorded at most once in this window per account, so failures cannot push real events out of the last 50. */
export const FAILURE_COALESCE_MS = 10 * 60_000
/** Events older than this are removed by the purge. A demo choice, not a policy: retention is a data-protection decision for the university. */
export const EVENT_RETENTION_MS = 180 * 24 * 60 * 60_000

export type NewEvent = { userId: string; type: EventType; outcome: Outcome; ipPrefix: string | null }
export type SecurityEvent = { id: string; type: EventType; outcome: Outcome; ipPrefix: string | null; at: Date }

export type EventStore = {
  record(event: NewEvent, now: number): Promise<void>
  /** Newest first, at most RECENT_LIMIT, this account only. */
  recent(userId: string, limit?: number): Promise<SecurityEvent[]>
}

export function createPgEventStore(pool: pg.Pool): EventStore {
  return {
    async record(e, now) {
      if (!isEventType(e.type)) throw new Error('unknown security event type')
      const at = new Date(now)
      if (e.type === 'sign-in-failed') {
        await pool.query(
          `insert into "security_event" ("userId","type","outcome","ipPrefix","at")
           select $1,$2,$3,$4,$5
           where not exists (select 1 from "security_event" where "userId" = $1 and "type" = 'sign-in-failed' and "at" > $6)`,
          [e.userId, e.type, e.outcome, e.ipPrefix, at, new Date(now - FAILURE_COALESCE_MS)],
        )
        return
      }
      await pool.query(`insert into "security_event" ("userId","type","outcome","ipPrefix","at") values ($1,$2,$3,$4,$5)`, [e.userId, e.type, e.outcome, e.ipPrefix, at])
    },
    async recent(userId, limit = RECENT_LIMIT) {
      const n = Math.min(Math.max(Math.trunc(limit) || RECENT_LIMIT, 1), RECENT_LIMIT)
      const { rows } = await pool.query<SecurityEvent>(
        `select "id","type","outcome","ipPrefix","at" from "security_event" where "userId" = $1 order by "at" desc, "id" desc limit $2`,
        [userId, n],
      )
      return rows
    },
  }
}

/** Records an event and never throws: a log failure must not stop a sign-in or a sign-out. */
export async function recordEvent(events: EventStore, event: NewEvent, now: number = Date.now()): Promise<boolean> {
  try {
    await events.record(event, now)
    return true
  } catch {
    return false
  }
}

export type AlertRow = { id: string; userId: string; email: string; ipPrefix: string | null; raisedAt: Date }
export type AlertStore = {
  raise(userId: string, ipPrefix: string | null, now: number): Promise<string>
  listOpen(): Promise<AlertRow[]>
  /** True if an open alert with this id existed and is now acknowledged. */
  acknowledge(id: string, now: number): Promise<boolean>
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createPgAlertStore(pool: pg.Pool): AlertStore {
  return {
    async raise(userId, ipPrefix, now) {
      const { rows } = await pool.query<{ id: string }>(
        `insert into "security_alert" ("userId","reason","ipPrefix","raisedAt") values ($1,'not-me',$2,$3) returning "id"`,
        [userId, ipPrefix, new Date(now)],
      )
      return rows[0]!.id
    },
    async listOpen() {
      const { rows } = await pool.query<AlertRow>(
        `select a."id", a."userId", u."email", a."ipPrefix", a."raisedAt"
         from "security_alert" a join "user" u on u."id" = a."userId"
         where a."status" = 'open' order by a."raisedAt", a."id"`,
      )
      return rows
    },
    async acknowledge(id, now) {
      if (!UUID.test(id)) return false
      const r = await pool.query(`update "security_alert" set "status" = 'acknowledged', "acknowledgedAt" = $2 where "id" = $1 and "status" = 'open'`, [id, new Date(now)])
      return r.rowCount === 1
    },
  }
}

/**
 * The two protective actions (FP-51). Pure orchestration over injected parts so the order and the failure
 * behaviour can be tested without the library.
 *
 * "This wasn't me": sessions are ended FIRST, because that is what protects the account; the alert and the log
 * entry come after and may each fail without undoing it. The answer says whether the alert was written, so the
 * page never claims the administrator was told when they were not. If ending the sessions fails, the alert is
 * still attempted (the administrator should know) and the error is passed on.
 */
export type ActionDeps = {
  events: EventStore
  alerts: AlertStore
  endAllSessions: (userId: string) => Promise<void>
  now: () => number
}

export async function signOutEverywhere(userId: string, ipPrefix: string | null, d: ActionDeps): Promise<void> {
  await d.endAllSessions(userId)
  await recordEvent(d.events, { userId, type: 'sign-out-everywhere', outcome: 'success', ipPrefix }, d.now())
}

export async function thisWasNotMe(userId: string, ipPrefix: string | null, d: ActionDeps): Promise<{ alerted: boolean }> {
  let ended: unknown = null
  try {
    await d.endAllSessions(userId)
  } catch (e) {
    ended = e ?? new Error('could not end sessions')
  }
  let alerted = false
  try {
    await d.alerts.raise(userId, ipPrefix, d.now())
    alerted = true
  } catch {
    alerted = false
  }
  await recordEvent(d.events, { userId, type: 'not-me', outcome: ended ? 'failure' : 'success', ipPrefix }, d.now())
  if (ended) throw ended
  return { alerted }
}
