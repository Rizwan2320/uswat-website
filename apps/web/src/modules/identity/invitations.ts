/**
 * Invitations (FP-01, section 5.6): a single-use link, valid 72 hours, bound to one record. Only a hash of the token is stored,
 * so a database read cannot be turned into a working link. Pure helpers plus a PostgreSQL store; no framework code.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type pg from 'pg'

export const INVITATION_TTL_MS = 72 * 60 * 60 * 1000
const TOKEN_BYTES = 32
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/
const RECORD = /^[A-Za-z0-9_-]{1,64}$/
const EMAIL = /^[^\s@<>()"',;:\\]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,}$/

export const newToken = (): string => randomBytes(TOKEN_BYTES).toString('base64url')
export const hashToken = (token: string): string => createHash('sha256').update(token, 'utf8').digest('hex')
export const looksLikeToken = (v: unknown): v is string => typeof v === 'string' && TOKEN_SHAPE.test(v)
export function sameHash(a: string, b: string): boolean {
  const x = Buffer.from(a, 'utf8')
  const y = Buffer.from(b, 'utf8')
  return x.length === y.length && timingSafeEqual(x, y)
}

export type InviteInput = { recordRef: string; email: string; name: string; department: string }
export type InviteCheck = { ok: true; value: InviteInput } | { ok: false; error: 'record' | 'email' | 'name' | 'department' }
const BAD = /[\u0000-\u001F\u007F-\u009F‪-‮⁦-⁩]/

/** Operator input for an invitation. Names and departments are Sample text; control and bidi characters are refused. */
export function checkInvite(i: { recordRef: unknown; email: unknown; name: unknown; department: unknown }): InviteCheck {
  const tidy = (v: unknown, max: number): string | null => {
    if (typeof v !== 'string' || BAD.test(v)) return null
    const t = v.replace(/\s+/g, ' ').trim()
    return t !== '' && [...t].length <= max ? t : null
  }
  if (typeof i.recordRef !== 'string' || !RECORD.test(i.recordRef)) return { ok: false, error: 'record' }
  if (typeof i.email !== 'string' || !EMAIL.test(i.email.trim())) return { ok: false, error: 'email' }
  const name = tidy(i.name, 120)
  if (!name) return { ok: false, error: 'name' }
  const department = tidy(i.department, 80)
  if (!department) return { ok: false, error: 'department' }
  return { ok: true, value: { recordRef: i.recordRef, email: i.email.trim().toLowerCase(), name, department } }
}

export type OpenInvitation = { id: string; recordRef: string; email: string; name: string; department: string; expiresAt: number }

export type ConsumeResult = 'ok' | 'unavailable'

export interface InvitationStore {
  /** Creates the invitation and revokes any earlier open one for the same record, in one transaction. Returns the one-time token. */
  create(input: InviteInput, now: number): Promise<{ token: string; expiresAt: number }>
  /** The invitation this token names, if it is unused, unrevoked and unexpired. Does not use it. */
  peek(token: string, now: number): Promise<OpenInvitation | null>
  /**
   * Uses the token for this new account: only if still open, and writes the account's pending status, department and claim in the
   * same transaction. 'unavailable' covers used, revoked, expired, unknown, and a record that has already been claimed.
   */
  consume(token: string, userId: string, now: number): Promise<ConsumeResult>
}

export function createPgInvitationStore(pool: pg.Pool): InvitationStore {
  return {
    async create(input, now) {
      const token = newToken()
      const at = new Date(now)
      const client = await pool.connect()
      try {
        await client.query('begin')
        await client.query(`update "invitation" set "revokedAt" = $2 where "recordRef" = $1 and "usedAt" is null and "revokedAt" is null`, [input.recordRef, at])
        await client.query(
          `insert into "invitation" ("tokenHash","recordRef","email","name","department","createdAt","expiresAt") values ($1,$2,$3,$4,$5,$6,$7)`,
          [hashToken(token), input.recordRef, input.email, input.name, input.department, at, new Date(now + INVITATION_TTL_MS)],
        )
        await client.query('commit')
        return { token, expiresAt: now + INVITATION_TTL_MS }
      } catch (e) {
        await client.query('rollback').catch(() => {})
        throw e
      } finally {
        client.release()
      }
    },

    async peek(token, now) {
      if (!looksLikeToken(token)) return null
      const { rows } = await pool.query<{ id: string; recordRef: string; email: string; name: string; department: string; expiresAt: Date }>(
        `select "id","recordRef","email","name","department","expiresAt" from "invitation"
         where "tokenHash" = $1 and "usedAt" is null and "revokedAt" is null and "expiresAt" > $2`,
        [hashToken(token), new Date(now)],
      )
      const r = rows[0]
      return r ? { id: r.id, recordRef: r.recordRef, email: r.email, name: r.name, department: r.department, expiresAt: r.expiresAt.getTime() } : null
    },

    async consume(token, userId, now) {
      if (!looksLikeToken(token)) return 'unavailable'
      const at = new Date(now)
      const client = await pool.connect()
      try {
        await client.query('begin')
        // The conditional update is the single-use guarantee: of two concurrent claims, one row update succeeds.
        const used = await client.query<{ recordRef: string; department: string }>(
          `update "invitation" set "usedAt" = $3, "userId" = $2
           where "tokenHash" = $1 and "usedAt" is null and "revokedAt" is null and "expiresAt" > $3 returning "recordRef","department"`,
          [hashToken(token), userId, at],
        )
        const inv = used.rows[0]
        if (!inv) {
          await client.query('rollback')
          return 'unavailable'
        }
        await client.query(`insert into "account_status" ("userId","status","recordRef","createdAt") values ($1,'pending-activation',$2,$3)`, [userId, inv.recordRef, at])
        await client.query(`insert into "account_department" ("userId","department") values ($1,$2) on conflict ("userId") do update set "department" = excluded."department"`, [userId, inv.department])
        await client.query('commit')
        return 'ok'
      } catch (e) {
        await client.query('rollback').catch(() => {})
        // A record that was claimed in the meantime trips the unique index: the same answer as a used link.
        if ((e as { code?: string }).code === '23505') return 'unavailable'
        throw e
      } finally {
        client.release()
      }
    },
  }
}
