/**
 * Who is a reviewer, and which department an account belongs to (Sample text until People supplies real ones).
 * Used only by the operator command `pnpm identity:roles`: no screen and no request can grant or change either.
 */
import type pg from 'pg'

import { normaliseDepartment } from './rules'

export type RoleRow = { email: string; department: string | null; reviewer: boolean; head: boolean }
export type RoleResult = 'ok' | 'no-account' | 'invalid' | 'no-department' | 'not-reviewer'

export type RoleStore = {
  setDepartment(email: string, department: string): Promise<RoleResult>
  grantReviewer(email: string): Promise<RoleResult>
  revokeReviewer(email: string): Promise<RoleResult>
  /** Department head: may activate claimed accounts in their own department (FP-01). Needs a department. */
  grantHead(email: string): Promise<RoleResult>
  revokeHead(email: string): Promise<RoleResult>
  list(): Promise<RoleRow[]>
}

export function createPgRoleStore(pool: pg.Pool): RoleStore {
  const idOf = async (email: string) => (await pool.query<{ id: string }>(`select "id" from "user" where lower("email") = lower($1)`, [email.trim()])).rows[0]?.id ?? null
  return {
    async setDepartment(email, department) {
      const dept = normaliseDepartment(department)
      if (!dept) return 'invalid'
      const id = await idOf(email)
      if (!id) return 'no-account'
      await pool.query(
        `insert into "account_department" ("userId", "department") values ($1, $2) on conflict ("userId") do update set "department" = excluded."department"`,
        [id, dept],
      )
      return 'ok'
    },
    async grantReviewer(email) {
      const id = await idOf(email)
      if (!id) return 'no-account'
      const has = await pool.query(`select 1 from "account_department" where "userId" = $1`, [id])
      if (has.rowCount !== 1) return 'no-department'
      await pool.query(`insert into "reviewer_role" ("userId") values ($1) on conflict do nothing`, [id])
      return 'ok'
    },
    async revokeReviewer(email) {
      const id = await idOf(email)
      if (!id) return 'no-account'
      const r = await pool.query(`delete from "reviewer_role" where "userId" = $1`, [id])
      return r.rowCount === 1 ? 'ok' : 'not-reviewer'
    },
    async grantHead(email) {
      const id = await idOf(email)
      if (!id) return 'no-account'
      const has = await pool.query(`select 1 from "account_department" where "userId" = $1`, [id])
      if (has.rowCount !== 1) return 'no-department'
      await pool.query(`insert into "head_role" ("userId") values ($1) on conflict do nothing`, [id])
      return 'ok'
    },
    async revokeHead(email) {
      const id = await idOf(email)
      if (!id) return 'no-account'
      const r = await pool.query(`delete from "head_role" where "userId" = $1`, [id])
      return r.rowCount === 1 ? 'ok' : 'not-reviewer'
    },
    async list() {
      const { rows } = await pool.query<RoleRow>(
        `select u."email", d."department", (r."userId" is not null) as reviewer, (h."userId" is not null) as head
         from "user" u left join "account_department" d on d."userId" = u."id" left join "reviewer_role" r on r."userId" = u."id" left join "head_role" h on h."userId" = u."id"
         where d."userId" is not null or r."userId" is not null or h."userId" is not null order by lower(d."department"), u."email"`,
      )
      return rows
    },
  }
}
