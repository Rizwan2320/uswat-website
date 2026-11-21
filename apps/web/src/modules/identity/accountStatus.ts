/**
 * Account state (FP-01, AUTH-01, section 5.6). An account with no row is active: the existing sample accounts. Only the claim
 * flow writes rows. This is read in `readSessionState`, the one place pages and the API both read the session.
 */
import type pg from 'pg'

export type AccountStatus = 'pending-activation' | 'active' | 'suspended' | 'left'
export const ACCOUNT_STATUSES: readonly AccountStatus[] = ['pending-activation', 'active', 'suspended', 'left']

export type StatusStore = {
  get(userId: string): Promise<AccountStatus>
  /** Operator: mark someone as left or suspended, or reinstate. Ends their sessions when leaving active. */
  set(userId: string, status: AccountStatus, now: number): Promise<'ok' | 'no-account'>
}

export function createPgStatusStore(pool: pg.Pool): StatusStore {
  return {
    async get(userId) {
      const { rows } = await pool.query<{ status: AccountStatus }>(`select "status" from "account_status" where "userId" = $1`, [userId])
      const s = rows[0]?.status
      if (s === undefined) return 'active'
      if (!ACCOUNT_STATUSES.includes(s)) throw new Error('unknown account status') // fail closed; the caller treats a throw as unreadable
      return s
    },
    async set(userId, status, now) {
      if (!ACCOUNT_STATUSES.includes(status)) throw new Error('unknown account status')
      const client = await pool.connect()
      try {
        await client.query('begin')
        const user = await client.query(`select 1 from "user" where "id" = $1`, [userId])
        if (user.rowCount !== 1) {
          await client.query('rollback')
          return 'no-account'
        }
        await client.query(
          `insert into "account_status" ("userId","status") values ($1,$2)
           on conflict ("userId") do update set "status" = excluded."status"`,
          [userId, status],
        )
        if (status === 'suspended' || status === 'left') await client.query(`delete from "session" where "userId" = $1`, [userId])
        await client.query('commit')
        return 'ok'
      } catch (e) {
        await client.query('rollback').catch(() => {})
        throw e
      } finally {
        client.release()
      }
    },
  }
}
