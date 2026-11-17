/** PostgreSQL store for the sign-in throttle (table `signin_failure`, migration 0004). Keys are hashes. */
import type pg from 'pg'

import { DECAY_MS, type ThrottleStore } from './signInThrottle'

export function createPgThrottleStore(pool: pg.Pool): ThrottleStore {
  return {
    async get(key) {
      const { rows } = await pool.query<{ failures: number; lastFailureAt: Date }>(
        `select "failures", "lastFailureAt" from "signin_failure" where "key" = $1`,
        [key],
      )
      const r = rows[0]
      return r ? { failures: r.failures, lastFailureAt: r.lastFailureAt.getTime() } : null
    },
    async recordFailure(key, now) {
      // One statement, so simultaneous failures are all counted: no read-then-write.
      await pool.query(
        `insert into "signin_failure" ("key", "failures", "lastFailureAt") values ($1, 1, $2)
         on conflict ("key") do update set
           "failures" = case when "signin_failure"."lastFailureAt" < $3 then 1 else "signin_failure"."failures" + 1 end,
           "lastFailureAt" = greatest("signin_failure"."lastFailureAt", excluded."lastFailureAt")`,
        [key, new Date(now), new Date(now - DECAY_MS)],
      )
    },
    async reset(key) {
      await pool.query(`delete from "signin_failure" where "key" = $1`, [key])
    },
  }
}
