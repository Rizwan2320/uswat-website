/** What the bridge reads and remembers, in the portal database. The account id always comes from the session. */
import type pg from 'pg'

import type { ProfileEdit } from '../profile/types'
import { pickEditable } from '../profile/sampleStore'

export type BridgeSource = { recordRef: string | null; edit: ProfileEdit | null; approvedAt: Date | null }
export type SyncState = { lastAttemptAt: Date; lastOkAt: Date | null; lastHash: string | null; lastError: string | null } | null

export interface BridgeStore {
  source(accountId: string): Promise<BridgeSource>
  state(accountId: string): Promise<SyncState>
  record(accountId: string, outcome: { ok: true; hash: string; at: Date } | { ok: false; error: string; at: Date }): Promise<void>
}

export function createPgBridgeStore(pool: pg.Pool): BridgeStore {
  return {
    async source(accountId) {
      const ref = await pool.query<{ recordRef: string | null }>(`select "recordRef" from "account_status" where "userId" = $1`, [accountId])
      const pub = await pool.query<{ edit: Partial<ProfileEdit>; approvedAt: Date }>(`select "edit","approvedAt" from "profile_published" where "userId" = $1`, [accountId])
      return { recordRef: ref.rows[0]?.recordRef ?? null, edit: pub.rows[0] ? pickEditable(pub.rows[0].edit) : null, approvedAt: pub.rows[0]?.approvedAt ?? null }
    },
    async state(accountId) {
      const r = await pool.query<NonNullable<SyncState>>(`select "lastAttemptAt","lastOkAt","lastHash","lastError" from "public_sync" where "userId" = $1`, [accountId])
      return r.rows[0] ?? null
    },
    async record(accountId, o) {
      if (o.ok) {
        await pool.query(
          `insert into "public_sync" ("userId","lastAttemptAt","lastOkAt","lastHash","lastError") values ($1,$2,$2,$3,null)
           on conflict ("userId") do update set "lastAttemptAt" = excluded."lastAttemptAt", "lastOkAt" = excluded."lastOkAt", "lastHash" = excluded."lastHash", "lastError" = null`,
          [accountId, o.at, o.hash],
        )
      } else {
        await pool.query(
          `insert into "public_sync" ("userId","lastAttemptAt","lastError") values ($1,$2,$3)
           on conflict ("userId") do update set "lastAttemptAt" = excluded."lastAttemptAt", "lastError" = excluded."lastError"`,
          [accountId, o.at, o.error.slice(0, 200)],
        )
      }
    },
  }
}
