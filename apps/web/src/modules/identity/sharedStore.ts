/** PostgreSQL store for the shared-computer flag (table `session_shared`, migration 0006). */
import type pg from 'pg'

export type SharedStore = {
  mark(sessionId: string): Promise<void>
  isShared(sessionId: string): Promise<boolean>
}

export function createPgSharedStore(pool: pg.Pool): SharedStore {
  return {
    async mark(sessionId) {
      await pool.query(`insert into "session_shared" ("sessionId") values ($1) on conflict ("sessionId") do nothing`, [sessionId])
    },
    async isShared(sessionId) {
      const { rowCount } = await pool.query(`select 1 from "session_shared" where "sessionId" = $1`, [sessionId])
      return rowCount === 1
    },
  }
}
