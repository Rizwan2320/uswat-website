/** PostgreSQL store for the TOTP replay guard. One statement, so two simultaneous claims cannot both win. */
import type pg from 'pg'

import type { ReplayStore } from './totpReplay'

export function createPgReplayStore(pool: pg.Pool): ReplayStore {
  return {
    async claim(key, now, windowMs) {
      const at = new Date(now)
      const oldest = new Date(now - windowMs)
      const { rowCount } = await pool.query(
        `insert into "totp_replay" ("key", "usedAt") values ($1, $2)
         on conflict ("key") do update set "usedAt" = excluded."usedAt"
           where "totp_replay"."usedAt" <= $3`,
        [key, at, oldest],
      )
      return rowCount === 1
    },
  }
}
