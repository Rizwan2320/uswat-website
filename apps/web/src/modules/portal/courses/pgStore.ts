/**
 * PostgreSQL adapter for `CourseStore`. Every query carries the session account. The per-account limit is checked inside the
 * same transaction as the insert, under an advisory lock on the account, so two simultaneous adds cannot both pass at 59.
 */
import type pg from 'pg'

import { LIMITS } from './rules'
import type { AddOutcome, Course, CourseInput, CourseStore } from './types'

type Row = { id: string; code: string; title: string; season: Course['season']; year: number; programme: string; source: Course['source'] }
const SEASON_ORDER = `case "season" when 'Winter' then 4 when 'Fall' then 3 when 'Summer' then 2 else 1 end`

/**
 * Inserts one course inside a transaction the caller has opened. Takes the per-account advisory lock (held to the end of the
 * transaction), checks the limit, and skips a repeat of the same code and semester. Shared by the page and the import step.
 */
export async function insertCourseTx(client: pg.PoolClient, accountId: string, c: CourseInput, source: Course['source']): Promise<AddOutcome> {
  await client.query(`select pg_advisory_xact_lock(hashtext($1))`, [`course_taught:${accountId}`])
  const n = await client.query<{ n: number }>(`select count(*)::int as n from "course_taught" where "userId" = $1`, [accountId])
  if (n.rows[0].n >= LIMITS.perAccount) return 'limit'
  const r = await client.query(
    `insert into "course_taught" ("userId","code","title","season","year","programme","source") values ($1,$2,$3,$4,$5,$6,$7) on conflict ("userId","code","season","year") do nothing`,
    [accountId, c.code, c.title, c.season, c.year, c.programme, source],
  )
  return r.rowCount === 1 ? 'added' : 'duplicate'
}

export function createPgCourseStore(pool: pg.Pool): CourseStore {
  return {
    async list(accountId) {
      const { rows } = await pool.query<Row>(
        `select "id","code","title","season","year","programme","source" from "course_taught" where "userId" = $1 order by "year" desc, ${SEASON_ORDER} desc, "code", "id"`,
        [accountId],
      )
      return rows
    },
    async add(accountId, c): Promise<AddOutcome> {
      const client = await pool.connect()
      try {
        await client.query('begin')
        const outcome = await insertCourseTx(client, accountId, c, 'manual')
        await client.query(outcome === 'limit' ? 'rollback' : 'commit')
        return outcome
      } catch (e) {
        await client.query('rollback')
        throw e
      } finally {
        client.release()
      }
    },
    async remove(accountId, courseId) {
      const r = await pool.query(`delete from "course_taught" where "id" = $2 and "userId" = $1 and "source" = 'manual'`, [accountId, courseId])
      return r.rowCount === 1
    },
  }
}
