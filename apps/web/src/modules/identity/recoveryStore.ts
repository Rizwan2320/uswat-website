/** PostgreSQL stores for recovery codes and the failure counter. Every write is one statement or one transaction. */
import { randomUUID } from 'node:crypto'

import type pg from 'pg'

import { LOCK_WINDOW_MS, MAX_FAILURES, type AttemptStore, type RecoveryStore } from './recoveryService'

export function createPgRecoveryStore(pool: pg.Pool): RecoveryStore {
  return {
    async list(userId) {
      const { rows } = await pool.query<{ id: string; salt: string; hash: string; usedAt: Date | null }>(
        `select "id", "salt", "hash", "usedAt" from "recovery_code" where "userId" = $1 order by "createdAt", "id"`,
        [userId],
      )
      return rows.map((r) => ({ id: r.id, salt: r.salt, hash: r.hash, usedAt: r.usedAt ? r.usedAt.getTime() : null }))
    },
    async consume(id, now) {
      const { rowCount } = await pool.query(
        `update "recovery_code" set "usedAt" = $2 where "id" = $1 and "usedAt" is null`,
        [id, new Date(now)],
      )
      return rowCount === 1
    },
    async replaceAll(userId, records) {
      const client = await pool.connect()
      try {
        await client.query('begin')
        await client.query(`delete from "recovery_code" where "userId" = $1`, [userId])
        for (const r of records) {
          await client.query(`insert into "recovery_code" ("id", "userId", "salt", "hash") values ($1, $2, $3, $4)`, [
            randomUUID(),
            userId,
            r.salt,
            r.hash,
          ])
        }
        await client.query('commit')
      } catch (e) {
        await client.query('rollback')
        throw e
      } finally {
        client.release()
      }
    },
  }
}

export function createPgAttemptStore(pool: pg.Pool): AttemptStore {
  return {
    async isLocked(userId, now) {
      const { rowCount } = await pool.query(
        `select 1 from "recovery_attempt" where "userId" = $1 and "failures" >= $2 and "windowStart" > $3`,
        [userId, MAX_FAILURES, new Date(now - LOCK_WINDOW_MS)],
      )
      return rowCount === 1
    },
    async recordFailure(userId, now) {
      // One statement: start a new window if the old one has passed, otherwise count.
      await pool.query(
        `insert into "recovery_attempt" ("userId", "failures", "windowStart") values ($1, 1, $2)
         on conflict ("userId") do update set
           "failures" = case when "recovery_attempt"."windowStart" <= $3 then 1 else "recovery_attempt"."failures" + 1 end,
           "windowStart" = case when "recovery_attempt"."windowStart" <= $3 then excluded."windowStart" else "recovery_attempt"."windowStart" end`,
        [userId, new Date(now), new Date(now - LOCK_WINDOW_MS)],
      )
    },
    async reset(userId) {
      await pool.query(`delete from "recovery_attempt" where "userId" = $1`, [userId])
    },
  }
}
