/**
 * PostgreSQL store for session assurance (table `session_assurance`, migrations 0002 and 0005).
 * Default deny: no row means not strong, and not fresh.
 */
import type pg from 'pg'

export type AssuranceStore = {
  /**
   * Marks the session strong. `verified: true` is for an authentication event (passkey sign-in, TOTP, recovery):
   * it sets the time the second factor was last proved to now. `verified: false` is for registering a passkey:
   * it creates the row (first-factor enrolment, which is itself a proof) but never refreshes an existing one,
   * so adding keys cannot extend its own permission.
   */
  mark(sessionId: string, opts?: { verified?: boolean }): Promise<void>
  isStrong(sessionId: string): Promise<boolean>
  /** Epoch milliseconds of the last second-factor proof, or null if the session is not strong. */
  lastVerifiedAt(sessionId: string): Promise<number | null>
}

export function createPgAssuranceStore(pool: pg.Pool): AssuranceStore {
  return {
    async mark(sessionId, opts) {
      const verified = opts?.verified !== false
      // The foreign key refuses a session that no longer exists, so a revoked session cannot be marked.
      await pool.query(
        verified
          ? `insert into "session_assurance" ("sessionId") values ($1)
             on conflict ("sessionId") do update set "verifiedAt" = CURRENT_TIMESTAMP`
          : `insert into "session_assurance" ("sessionId") values ($1) on conflict ("sessionId") do nothing`,
        [sessionId],
      )
    },
    async isStrong(sessionId) {
      const { rowCount } = await pool.query(`select 1 from "session_assurance" where "sessionId" = $1`, [sessionId])
      return rowCount === 1
    },
    async lastVerifiedAt(sessionId) {
      const { rows } = await pool.query<{ ms: string }>(
        `select (extract(epoch from "verifiedAt") * 1000)::bigint::text as ms from "session_assurance" where "sessionId" = $1`,
        [sessionId],
      )
      return rows[0] ? Number(rows[0].ms) : null
    },
  }
}
