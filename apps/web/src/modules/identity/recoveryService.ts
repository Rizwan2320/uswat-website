/**
 * Recovery codes, issue and redeem (Addendum C AUTH-05, section 5.6 "lost device").
 *
 * Pure logic over two small stores, so it is tested without a database. It knows nothing about
 * sessions or the library: the plugin checks the password, then asks this service to redeem.
 *
 * Redeem order matters: a locked account refuses even a correct code (otherwise the lock would
 * only slow a guesser down by one request), and a code is consumed by one atomic store call, so
 * two simultaneous uses cannot both succeed.
 */
import { generateRecoveryCodes, matchRecoveryCode, type RecoveryRecord } from './recoveryCodes'

export const MAX_FAILURES = 5
export const LOCK_WINDOW_MS = 15 * 60_000

export type StoredRecovery = RecoveryRecord & { id: string }

export interface RecoveryStore {
  list(userId: string): Promise<StoredRecovery[]>
  /** Marks the record used if and only if it is still unused. True for exactly one caller. */
  consume(id: string, now: number): Promise<boolean>
  /** Deletes the account's old set and stores the new one, in one transaction. */
  replaceAll(userId: string, records: RecoveryRecord[]): Promise<void>
}

export interface AttemptStore {
  isLocked(userId: string, now: number): Promise<boolean>
  recordFailure(userId: string, now: number): Promise<void>
  reset(userId: string): Promise<void>
}

export type RedeemResult = { status: 'ok'; remaining: number } | { status: 'invalid' } | { status: 'locked' }

export function createRecoveryService(deps: { recovery: RecoveryStore; attempts: AttemptStore }) {
  return {
    /** Replaces the account's set with ten new codes and returns them. The only time the plain codes exist. */
    async issue(userId: string): Promise<string[]> {
      const { codes, records } = generateRecoveryCodes()
      await deps.recovery.replaceAll(userId, records)
      return codes
    },

    async redeem(userId: string, code: string, now: number): Promise<RedeemResult> {
      if (await deps.attempts.isLocked(userId, now)) return { status: 'locked' }
      const rows = await deps.recovery.list(userId)
      const i = typeof code === 'string' ? matchRecoveryCode(rows, code) : -1
      if (i !== -1 && (await deps.recovery.consume(rows[i]!.id, now))) {
        await deps.attempts.reset(userId)
        return { status: 'ok', remaining: rows.filter((r, j) => r.usedAt === null && j !== i).length }
      }
      await deps.attempts.recordFailure(userId, now)
      return { status: 'invalid' }
    },
  }
}

export function createMemoryRecoveryStore(): RecoveryStore {
  const byUser = new Map<string, StoredRecovery[]>()
  let seq = 0
  return {
    async list(userId) {
      return (byUser.get(userId) ?? []).map((r) => ({ ...r }))
    },
    async consume(id, now) {
      for (const rows of byUser.values()) {
        const r = rows.find((x) => x.id === id)
        if (r) {
          if (r.usedAt !== null) return false
          r.usedAt = now
          return true
        }
      }
      return false
    },
    async replaceAll(userId, records) {
      byUser.set(userId, records.map((r) => ({ ...r, id: `r${++seq}` })))
    },
  }
}

export function createMemoryAttemptStore(): AttemptStore {
  const state = new Map<string, { failures: number; windowStart: number }>()
  return {
    async isLocked(userId, now) {
      const s = state.get(userId)
      return s !== undefined && s.failures >= MAX_FAILURES && now - s.windowStart < LOCK_WINDOW_MS
    },
    async recordFailure(userId, now) {
      const s = state.get(userId)
      if (!s || now - s.windowStart >= LOCK_WINDOW_MS) state.set(userId, { failures: 1, windowStart: now })
      else s.failures += 1
    },
    async reset(userId) {
      state.delete(userId)
    },
  }
}
