/** PostgreSQL adapter for delegation. The resolution and the audit row share one transaction. */
import type pg from 'pg'

import { isGrantId } from './rules'
import { SECTIONS, type AuditView, type Authorised, type DelegationStore, type GivenView, type ReceivedView, type Section } from './types'

const ACTIVE = `coalesce((select s."status" from "account_status" s where s."userId" = %ID%), 'active') = 'active'`
const activeOf = (id: string) => ACTIVE.replace('%ID%', id)
const DAY = 86_400_000

export function createPgDelegationStore(pool: pg.Pool): DelegationStore {
  return {
    async findDelegate(email) {
      const { rows } = await pool.query<{ id: string; name: string }>(
        `select u."id", u."name" from "user" u where lower(u."email") = lower($1) and ${activeOf('u."id"')}`,
        [email.trim()],
      )
      return rows[0] ?? null
    },

    async create(grantorId, input, now) {
      const at = new Date(now)
      const client = await pool.connect()
      try {
        await client.query('begin')
        await client.query(`update "delegation" set "revokedAt" = $3 where "grantorId" = $1 and "delegateId" = $2 and "revokedAt" is null`, [grantorId, input.delegateId, at])
        const expiresAt = new Date(now + input.days * DAY)
        const { rows } = await client.query<{ id: string }>(
          `insert into "delegation" ("grantorId","delegateId","sections","createdAt","expiresAt") values ($1,$2,$3,$4,$5) returning "id"`,
          [grantorId, input.delegateId, input.sections, at, expiresAt],
        )
        await client.query('commit')
        return { id: rows[0]!.id, expiresAt: expiresAt.getTime() }
      } catch (e) {
        await client.query('rollback').catch(() => {})
        throw e
      } finally {
        client.release()
      }
    },

    async listGiven(grantorId, now) {
      const { rows } = await pool.query<{ id: string; name: string; email: string; sections: Section[]; createdAt: Date; expiresAt: Date; revokedAt: Date | null }>(
        `select d."id", u."name", u."email", d."sections", d."createdAt", d."expiresAt", d."revokedAt"
         from "delegation" d join "user" u on u."id" = d."delegateId" where d."grantorId" = $1 order by d."createdAt" desc limit 100`,
        [grantorId],
      )
      return rows.map<GivenView>((r) => ({
        id: r.id, delegateName: r.name, delegateEmail: r.email, sections: r.sections, createdAt: r.createdAt.getTime(), expiresAt: r.expiresAt.getTime(),
        state: r.revokedAt ? 'revoked' : r.expiresAt.getTime() <= now ? 'expired' : 'active',
      }))
    },

    async listReceived(delegateId, now) {
      const { rows } = await pool.query<{ id: string; grantorId: string; name: string; sections: Section[]; expiresAt: Date }>(
        `select d."id", d."grantorId", u."name", d."sections", d."expiresAt" from "delegation" d join "user" u on u."id" = d."grantorId"
         where d."delegateId" = $1 and d."revokedAt" is null and d."expiresAt" > $2 and ${activeOf('d."grantorId"')} order by d."expiresAt"`,
        [delegateId, new Date(now)],
      )
      return rows.map<ReceivedView>((r) => ({ id: r.id, grantorId: r.grantorId, grantorName: r.name, sections: r.sections, expiresAt: r.expiresAt.getTime() }))
    },

    async revoke(grantorId, delegationId, now) {
      if (!isGrantId(delegationId)) return false
      const r = await pool.query(`update "delegation" set "revokedAt" = $3 where "id" = $1 and "grantorId" = $2 and "revokedAt" is null`, [delegationId, grantorId, new Date(now)])
      return r.rowCount === 1
    },

    async authorise(actorId, subjectId, section, action, now): Promise<Authorised | null> {
      if (!SECTIONS.includes(section) || !/^[a-z][a-zA-Z]{1,40}$/.test(action)) return null
      const client = await pool.connect()
      try {
        await client.query('begin')
        const { rows } = await client.query<{ id: string; email: string; name: string; did: string; expiresAt: Date }>(
          `select g."id", g."email", g."name", d."id" as did, d."expiresAt"
           from "delegation" d join "user" g on g."id" = d."grantorId"
           where d."delegateId" = $1 and d."grantorId" = $2 and d."revokedAt" is null and d."expiresAt" > $3 and $4 = any(d."sections")
             and d."delegateId" <> d."grantorId" and ${activeOf('d."grantorId"')} and ${activeOf('d."delegateId"')}
           for share of d`,
          [actorId, subjectId, new Date(now), section],
        )
        const r = rows[0]
        if (!r) {
          await client.query('rollback')
          return null
        }
        await client.query(`insert into "delegation_audit" ("at","actorId","subjectId","delegationId","section","action") values ($1,$2,$3,$4,$5,$6)`, [new Date(now), actorId, subjectId, r.did, section, action])
        await client.query('commit')
        return { delegationId: r.did, subject: { id: r.id, email: r.email, name: r.name }, expiresAt: r.expiresAt.getTime() }
      } catch (e) {
        await client.query('rollback').catch(() => {})
        throw e
      } finally {
        client.release()
      }
    },

    async recentAudit(grantorId, limit) {
      const { rows } = await pool.query<{ at: Date; name: string | null; section: Section; action: string }>(
        `select a."at", u."name", a."section", a."action" from "delegation_audit" a left join "user" u on u."id" = a."actorId"
         where a."subjectId" = $1 order by a."at" desc limit $2`,
        [grantorId, Math.min(Math.max(limit, 1), 100)],
      )
      return rows.map<AuditView>((r) => ({ at: r.at.getTime(), actorName: r.name, section: r.section, action: r.action }))
    },
  }
}
