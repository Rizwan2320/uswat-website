/**
 * Removes identity rows that can no longer change an answer (FP-10). Every cut-off is the constant the
 * check itself uses, so the purge never removes a session `evaluateSession` would still accept, nor a counter
 * or mark that still matters. `now` comes from the caller, so the database clock cannot disagree with the app.
 * Touches schema `identity` only; returns counts, never row contents.
 */
import type pg from 'pg'

import { ABSOLUTE_MS, IDLE_MS, SHARED_IDLE_MS } from './sessionLifetime'
import { DECAY_MS } from './signInThrottle'
import { LOCK_WINDOW_MS } from './recoveryService'
import { EVENT_RETENTION_MS } from './securityEvents'
import { REPLAY_WINDOW_MS } from './totpReplay'

export type PurgeCounts = {
  sessions: number
  verifications: number
  signInFailures: number
  recoveryAttempts: number
  totpReplays: number
  securityEvents: number
}

const at = (now: number, agoMs: number) => new Date(now - agoMs)

/** Delete (or, with `dryRun`, only count) rows that are past every limit. Runs in one transaction. */
export async function purgeExpired(pool: pg.Pool, now: number, opts: { dryRun?: boolean } = {}): Promise<PurgeCounts> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    const run = async (del: string, where: string, params: unknown[], table: string): Promise<number> => {
      if (opts.dryRun) {
        const r = await client.query(`select count(*)::int as n from ${table} where ${where}`, params)
        return r.rows[0].n as number
      }
      const r = await client.query(`${del} where ${where}`, params)
      return r.rowCount ?? 0
    }
    const counts: PurgeCounts = {
      // A session is dead once it is past the absolute limit, or idle past its own limit (15 minutes when shared).
      // Cascades remove its session_assurance and session_shared rows.
      sessions: await run(
        'delete from "session"',
        `("createdAt" < $1
           or ("updatedAt" < $2 and "id" not in (select "sessionId" from "session_shared"))
           or ("updatedAt" < $3 and "id" in (select "sessionId" from "session_shared")))`,
        [at(now, ABSOLUTE_MS), at(now, IDLE_MS), at(now, SHARED_IDLE_MS)],
        '"session"',
      ),
      verifications: await run('delete from "verification"', '"expiresAt" < $1', [new Date(now)], '"verification"'),
      signInFailures: await run('delete from "signin_failure"', '"lastFailureAt" < $1', [at(now, DECAY_MS)], '"signin_failure"'),
      recoveryAttempts: await run('delete from "recovery_attempt"', '"windowStart" <= $1', [at(now, LOCK_WINDOW_MS)], '"recovery_attempt"'),
      totpReplays: await run('delete from "totp_replay"', '"usedAt" <= $1', [at(now, REPLAY_WINDOW_MS)], '"totp_replay"'),
      securityEvents: await run('delete from "security_event"', '"at" < $1', [at(now, EVENT_RETENTION_MS)], '"security_event"'),
    }
    await client.query(opts.dryRun ? 'rollback' : 'commit')
    return counts
  } catch (e) {
    await client.query('rollback').catch(() => {})
    throw e
  } finally {
    client.release()
  }
}
