/**
 * PostgreSQL adapter for activation. Authorisation is decided in the same transaction as the write: the head role (locked),
 * the same department (case ignored), not oneself, still pending, and a second factor already enrolled.
 */
import type pg from 'pg'

import { isSubjectId } from '../review/rules'
import type { ActivationInput, ActivationOutcome, ActivationStore, PendingItem } from './types'

const ENROLLED = `(exists (select 1 from "passkey" k where k."userId" = s."userId") or exists (select 1 from "twoFactor" t where t."userId" = s."userId" and t."verified" is true))`

export function createPgActivationStore(pool: pg.Pool): ActivationStore {
  return {
    async isHead(userId) {
      const { rows } = await pool.query(`select 1 from "head_role" h join "account_department" d on d."userId" = h."userId" where h."userId" = $1`, [userId])
      return rows.length === 1
    },

    async listPending(headId) {
      const { rows } = await pool.query<{ id: string; name: string; email: string; createdAt: Date; recordRef: string | null }>(
        `select s."userId" as id, u."name", u."email", s."createdAt", s."recordRef"
         from "head_role" h
         join "account_department" hd on hd."userId" = h."userId"
         join "account_department" sd on lower(sd."department") = lower(hd."department")
         join "account_status" s on s."userId" = sd."userId"
         join "user" u on u."id" = s."userId"
         where h."userId" = $1 and s."status" = 'pending-activation' and s."userId" <> h."userId" and ${ENROLLED}
         order by s."createdAt", s."userId" limit 200`,
        [headId],
      )
      return rows.map<PendingItem>((r) => ({ subjectId: r.id, name: r.name, email: r.email, claimedAt: r.createdAt.getTime(), recordRef: r.recordRef }))
    },

    async decide(headId, input: ActivationInput, now): Promise<ActivationOutcome> {
      if (!isSubjectId(input.subjectId)) return 'forbidden'
      const client = await pool.connect()
      try {
        await client.query('begin')
        const auth = await client.query(
          `select 1 from "head_role" h
             join "account_department" hd on hd."userId" = h."userId"
             join "account_department" sd on lower(sd."department") = lower(hd."department")
           where h."userId" = $1 and sd."userId" = $2 and h."userId" <> sd."userId"
           for share of h`,
          [headId, input.subjectId],
        )
        if (auth.rowCount !== 1) {
          await client.query('rollback')
          return 'forbidden'
        }
        const row = await client.query(`select 1 from "account_status" s where s."userId" = $1 and s."status" = 'pending-activation' and ${ENROLLED} for update of s`, [input.subjectId])
        if (row.rowCount !== 1) {
          await client.query('rollback')
          return 'stale'
        }
        const at = new Date(now)
        if (input.decision === 'activated') {
          await client.query(`update "account_status" set "status" = 'active', "activatedBy" = $2, "activatedAt" = $3 where "userId" = $1`, [input.subjectId, headId, at])
        } else {
          await client.query(`update "account_status" set "status" = 'suspended' where "userId" = $1`, [input.subjectId])
          await client.query(`delete from "session" where "userId" = $1`, [input.subjectId])
          await client.query(`update "delegation" set "revokedAt" = $2 where ("grantorId" = $1 or "delegateId" = $1) and "revokedAt" is null`, [input.subjectId, at])
        }
        await client.query(`insert into "account_review" ("userId","reviewerId","decision","at") values ($1,$2,$3,$4)`, [input.subjectId, headId, input.decision, at])
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
