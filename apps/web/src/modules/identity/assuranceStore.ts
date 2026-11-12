/** PostgreSQL store for session assurance (table `session_assurance`, migration 0002). Default deny: no row, not strong. */
import type pg from 'pg'

export type AssuranceStore = {
  mark(sessionId: string): Promise<void>
  isStrong(sessionId: string): Promise<boolean>
}

export function createPgAssuranceStore(pool: pg.Pool): AssuranceStore {
  return {
    async mark(sessionId) {
      // The foreign key refuses a session that no longer exists, so a revoked session cannot be marked.
      await pool.query(
        `insert into "session_assurance" ("sessionId") values ($1) on conflict ("sessionId") do nothing`,
        [sessionId],
      )
    },
    async isStrong(sessionId) {
      const { rowCount } = await pool.query(`select 1 from "session_assurance" where "sessionId" = $1`, [sessionId])
      return rowCount === 1
    },
  }
}
