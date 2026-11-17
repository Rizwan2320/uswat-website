/** PostgreSQL writes for session lifetime: end a session, and record activity. Library table `session`. */
import type pg from 'pg'

import { TOUCH_INTERVAL_MS } from './sessionLifetime'

export type SessionLifetimeStore = {
  end(sessionId: string): Promise<void>
  touch(sessionId: string, now: number): Promise<void>
}

export function createPgSessionStore(pool: pg.Pool): SessionLifetimeStore {
  return {
    async end(sessionId) {
      // Deleting the row is what makes the cookie worthless on the next request (SES-05).
      await pool.query(`delete from "session" where "id" = $1`, [sessionId])
    },
    async touch(sessionId, now) {
      // One conditional statement: a request inside the interval writes nothing.
      await pool.query(`update "session" set "updatedAt" = $2 where "id" = $1 and "updatedAt" <= $3`, [
        sessionId,
        new Date(now),
        new Date(now - TOUCH_INTERVAL_MS),
      ])
    },
  }
}
