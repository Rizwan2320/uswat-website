/**
 * The PostgreSQL adapter for the Registrar's screen. Authorisation is decided here, in the same transaction as the write:
 * the role, not-self, and a person who exists. The change, its source note and the log row are written together or not at all.
 */
import type pg from 'pg'

import { applyStatus } from '../../identity/accountStatus'
import { changedFields } from './rules'
import type { AccountState, ChangeRow, Departure, FixedValues, LeaveInput, LeaveOutcome, PersonDetail, PersonRow, RegistrarStore, SaveInput, SaveOutcome } from './types'

const SEARCH_LIMIT = 20

type Cur = { nameUr: string | null; designationEn: string | null; designationUr: string | null; department: string | null }

const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)

function valuesOf(c: Cur): FixedValues | null {
  if (c.designationEn === null && c.department === null) return null
  return { designationEn: c.designationEn ?? '', designationUr: c.designationUr, nameUr: c.nameUr, department: c.department ?? '' }
}

export function createPgRegistrarStore(pool: pg.Pool): RegistrarStore {
  const current = async (q: Pick<pg.Pool, 'query'>, id: string): Promise<Cur> =>
    (
      await q.query<Cur>(
        `select f."nameUr", f."designationEn", f."designationUr", d."department" from "user" u
           left join "account_fixed" f on f."userId" = u."id" left join "account_department" d on d."userId" = u."id" where u."id" = $1`,
        [id],
      )
    ).rows[0] ?? { nameUr: null, designationEn: null, designationUr: null, department: null }

  return {
    async isVerifier(userId) {
      return (await pool.query(`select 1 from "verifier_role" where "userId" = $1`, [userId])).rowCount === 1
    },

    async search(verifierId, q) {
      const like = `%${likeEscape(q)}%`
      const { rows } = await pool.query<PersonRow>(
        `select u."id" as "subjectId", u."name", u."email", d."department", f."designationEn"
           from "verifier_role" v cross join "user" u
           left join "account_department" d on d."userId" = u."id" left join "account_fixed" f on f."userId" = u."id"
          where v."userId" = $1 and u."id" <> $1 and (u."name" ilike $2 escape '\\' or u."email" ilike $2 escape '\\')
          order by lower(u."name"), u."email" limit ${SEARCH_LIMIT}`,
        [verifierId, like],
      )
      return rows
    },

    async load(verifierId, subjectId) {
      const who = await pool.query<{ name: string; email: string; holds: boolean }>(
        `select u."name", u."email", (exists (select 1 from "reviewer_role" r where r."userId" = u."id") or exists (select 1 from "head_role" h where h."userId" = u."id")) as holds
           from "verifier_role" v cross join "user" u where v."userId" = $1 and u."id" = $2 and u."id" <> $1`,
        [verifierId, subjectId],
      )
      const w = who.rows[0]
      if (!w) return null
      const hist = await pool.query<{ at: Date; source: string; before: FixedValues | null; after: FixedValues }>(
        `select "at", "source", "before", "after" from "fixed_change" where "subjectId" = $1 order by "at" desc limit 10`,
        [subjectId],
      )
      const history: ChangeRow[] = hist.rows.map((r) => ({ at: r.at.getTime(), source: r.source, fields: changedFields(r.before, r.after) }))
      const st = await pool.query<{ status: AccountState; recordRef: string | null }>(`select "status", "recordRef" from "account_status" where "userId" = $1`, [subjectId])
      const dep = await pool.query<{ at: Date; outcome: Departure['outcome']; source: string; rolesRemoved: string[] }>(
        `select "at", "outcome", "source", "rolesRemoved" from "account_departure" where "subjectId" = $1 order by "at" desc, "id" desc limit 1`,
        [subjectId],
      )
      const d = dep.rows[0]
      const detail: PersonDetail = {
        subjectId,
        name: w.name,
        email: w.email,
        current: valuesOf(await current(pool, subjectId)),
        holdsRole: w.holds,
        history,
        // No row means an active account (the existing sample accounts), as everywhere else.
        state: st.rows[0]?.status ?? 'active',
        linked: !!st.rows[0]?.recordRef,
        departure: d ? { at: d.at.getTime(), outcome: d.outcome, source: d.source, rolesRemoved: d.rolesRemoved } : null,
      }
      return detail
    },

    async save(verifierId, input: SaveInput, now): Promise<SaveOutcome> {
      const client = await pool.connect()
      try {
        await client.query('begin')
        // `for share` on the role row: a revocation waits for this change, or this change sees it.
        const auth = await client.query(
          `select 1 from "verifier_role" v join "user" u on u."id" = $2 where v."userId" = $1 and u."id" <> v."userId" for share of v`,
          [verifierId, input.subjectId],
        )
        if (auth.rowCount !== 1) {
          await client.query('rollback')
          return 'forbidden'
        }
        const before = valuesOf(await current(client, input.subjectId))
        const fields = changedFields(before, input.values)
        if (fields.includes('department')) {
          const holds = await client.query(
            `select 1 where exists (select 1 from "reviewer_role" where "userId" = $1) or exists (select 1 from "head_role" where "userId" = $1)`,
            [input.subjectId],
          )
          if (holds.rowCount === 1) {
            await client.query('rollback')
            return 'has-role'
          }
        }
        const v = input.values
        await client.query(
          `insert into "account_fixed" ("userId", "nameUr", "designationEn", "designationUr") values ($1, $2, $3, $4)
           on conflict ("userId") do update set "nameUr" = excluded."nameUr", "designationEn" = excluded."designationEn", "designationUr" = excluded."designationUr"`,
          [input.subjectId, v.nameUr, v.designationEn, v.designationUr],
        )
        await client.query(
          `insert into "account_department" ("userId", "department") values ($1, $2) on conflict ("userId") do update set "department" = excluded."department"`,
          [input.subjectId, fields.includes('department') || !before ? v.department : before.department],
        )
        await client.query(
          `insert into "fixed_change" ("subjectId", "verifierId", "before", "after", "source", "at") values ($1, $2, $3, $4, $5, $6)`,
          [input.subjectId, verifierId, before === null ? null : JSON.stringify(before), JSON.stringify(v), input.source, new Date(now)],
        )
        await client.query('commit')
        return 'ok'
      } catch (e) {
        await client.query('rollback').catch(() => {})
        throw e
      } finally {
        client.release()
      }
    },

    async leave(verifierId, input: LeaveInput, now): Promise<LeaveOutcome> {
      const client = await pool.connect()
      try {
        await client.query('begin')
        const auth = await client.query(
          `select 1 from "verifier_role" v join "user" u on u."id" = $2 where v."userId" = $1 and u."id" <> v."userId" for share of v`,
          [verifierId, input.subjectId],
        )
        if (auth.rowCount !== 1) {
          await client.query('rollback')
          return 'forbidden'
        }
        // Lock the subject's status row so two Registrars cannot both mark the same person.
        const st = await client.query<{ status: string }>(`select "status" from "account_status" where "userId" = $1 for update`, [input.subjectId])
        if (st.rows[0]?.status === 'left') {
          await client.query('rollback')
          return 'already'
        }
        // The roles go with the account: a person who has left must not keep a privilege that is only checked when they sign in.
        const removed: string[] = []
        for (const [table, label] of [['verifier_role', 'registrar'], ['reviewer_role', 'reviewer'], ['head_role', 'head']] as const) {
          const r = await client.query(`delete from "${table}" where "userId" = $1`, [input.subjectId])
          if (r.rowCount) removed.push(label)
        }
        if ((await applyStatus(client, input.subjectId, 'left', now)) !== 'ok') {
          await client.query('rollback')
          return 'forbidden'
        }
        await client.query(
          `insert into "account_departure" ("subjectId", "verifierId", "outcome", "source", "rolesRemoved", "at") values ($1, $2, $3, $4, $5, $6)`,
          [input.subjectId, verifierId, input.outcome, input.source, removed, new Date(now)],
        )
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
