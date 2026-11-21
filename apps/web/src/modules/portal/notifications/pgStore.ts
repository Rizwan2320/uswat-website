/** PostgreSQL adapter for notifications. Building a digest is one transaction under a per-person advisory lock. */
import { randomUUID } from 'node:crypto'
import type pg from 'pg'

import { buildLines, isDue } from './digest'
import { DEFAULT_CADENCE, DIGEST_KINDS, isCadence, isNoticeKind, type Cadence, type DigestKind } from './kinds'
import type { BuildOutcome, LogEntry, NotificationStore } from './types'

export function createPgNotificationStore(pool: pg.Pool): NotificationStore {
  return {
    async getCadence(userId) {
      const { rows } = await pool.query<{ cadence: string }>(`select "cadence" from "notification_pref" where "userId" = $1`, [userId])
      const c = rows[0]?.cadence
      return c === undefined ? DEFAULT_CADENCE : isCadence(c) ? c : 'off' // an unreadable value fails closed: nothing is queued
    },
    async setCadence(userId, cadence, now) {
      if (!isCadence(cadence)) throw new Error('unknown cadence')
      await pool.query(
        `insert into "notification_pref" ("userId","cadence","updatedAt") values ($1,$2,$3)
         on conflict ("userId") do update set "cadence" = excluded."cadence", "updatedAt" = excluded."updatedAt"`,
        [userId, cadence, new Date(now)],
      )
    },
    async waiting(userId) {
      const { rows } = await pool.query<{ kind: DigestKind; count: string }>(`select "kind", sum("n")::text as count from "notification" where "userId" = $1 and "digestId" is null group by "kind"`, [userId])
      return DIGEST_KINDS.filter((k) => rows.some((r) => r.kind === k)).map((k) => ({ kind: k, count: Number(rows.find((r) => r.kind === k)!.count) }))
    },
    async log(userId, limit) {
      const { rows } = await pool.query<{ id: string; class: 'security' | 'digest'; cadence: 'daily' | 'weekly' | null; at: Date; lines: { kind: string; count: number; firstAt: string; lastAt: string }[] }>(
        `select "id","class","cadence","at","lines" from "notice_log" where "userId" = $1 order by "at" desc, "id" desc limit $2`,
        [userId, Math.min(Math.max(Math.trunc(limit) || 30, 1), 100)],
      )
      return rows.map<LogEntry>((r) => ({
        id: r.id,
        class: r.class,
        cadence: r.cadence,
        at: r.at.getTime(),
        lines: r.lines.filter((l) => isNoticeKind(l.kind)).map((l) => ({ kind: l.kind as never, count: l.count, firstAt: Date.parse(l.firstAt), lastAt: Date.parse(l.lastAt) })),
      }))
    },
    async withWaiting(limit) {
      const { rows } = await pool.query<{ userId: string }>(`select distinct "userId" from "notification" where "digestId" is null limit $1`, [Math.min(Math.max(Math.trunc(limit) || 1000, 1), 5000)])
      return rows.map((r) => r.userId)
    },
    async buildDigest(userId, now): Promise<BuildOutcome> {
      const client = await pool.connect()
      try {
        await client.query('begin')
        // Two runs at once for the same person take turns; the second sees the first's digest and finds nothing due.
        await client.query(`select pg_advisory_xact_lock(hashtext($1))`, [`digest:${userId}`])
        const pref = (await client.query<{ cadence: string }>(`select "cadence" from "notification_pref" where "userId" = $1`, [userId])).rows[0]?.cadence
        const cadence: Cadence = pref === undefined ? DEFAULT_CADENCE : isCadence(pref) ? pref : 'off'
        if (cadence === 'off') {
          await client.query('rollback')
          return { built: false, reason: 'off' }
        }
        const last = (await client.query<{ at: Date }>(`select max("at") as at from "notice_log" where "userId" = $1 and "class" = 'digest'`, [userId])).rows[0]?.at
        const at = new Date(now)
        const id = randomUUID()
        // Marking and reading are one statement, so an item that arrives meanwhile is neither lost nor listed twice.
        const { rows } = await client.query<{ kind: DigestKind; n: number; at: Date }>(
          `update "notification" set "digestId" = $2 where "userId" = $1 and "digestId" is null and "at" <= $3 returning "kind","n","at"`,
          [userId, id, at],
        )
        if (!isDue(cadence, last ? last.getTime() : null, rows.length, now)) {
          await client.query('rollback')
          return { built: false, reason: rows.length === 0 ? 'nothing' : 'not-due' }
        }
        const lines = buildLines(rows.map((r) => ({ kind: r.kind, n: r.n, at: r.at.getTime() })))
        await client.query(`insert into "notice_log" ("id","userId","class","cadence","at","lines") values ($1,$2,'digest',$3,$4,$5)`, [
          id,
          userId,
          cadence,
          at,
          JSON.stringify(lines.map((l) => ({ kind: l.kind, count: l.count, firstAt: new Date(l.firstAt).toISOString(), lastAt: new Date(l.lastAt).toISOString() }))),
        ])
        await client.query('commit')
        return { built: true, lines }
      } catch (e) {
        await client.query('rollback').catch(() => {})
        throw e
      } finally {
        client.release()
      }
    },
  }
}
