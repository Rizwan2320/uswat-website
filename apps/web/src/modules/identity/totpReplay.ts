/**
 * TOTP replay guard (Addendum C AUTH-04: each code accepted once).
 *
 * The library verifies the code but accepts the same code again inside its time window
 * (spike S-2, check E5). This guard records every code that was accepted, per account,
 * for longer than the ±1 step tolerance (3 steps of 30 s), and refuses a second use.
 * It does no cryptography of its own: it is a once-only set keyed by a SHA-256 of
 * account and code, so the table holds neither.
 */
import { createHash } from 'node:crypto'

export const REPLAY_WINDOW_MS = 120_000

export interface ReplayStore {
  /**
   * Atomically: if `key` is absent or older than `windowMs`, record it at `now` and return
   * true; otherwise return false. Must be a single statement or lock in a real database.
   */
  claim(key: string, now: number, windowMs: number): Promise<boolean>
}

export type MemoryReplayStore = ReplayStore & { keys(): string[] }

export function createMemoryReplayStore(): MemoryReplayStore {
  const seen = new Map<string, number>()
  return {
    async claim(key, now, windowMs) {
      const at = seen.get(key)
      if (at !== undefined && now - at < windowMs) return false
      seen.set(key, now)
      return true
    },
    keys: () => [...seen.keys()],
  }
}

const SIX_DIGITS = /^[0-9]{6}$/

export function replayKey(accountId: string, code: string): string {
  return createHash('sha256').update(`totp-replay:${accountId}:${code}`).digest('hex')
}

export function createReplayGuard(store: ReplayStore, windowMs: number = REPLAY_WINDOW_MS) {
  return {
    /** True only the first time this account presents this code inside the window. */
    async claim(accountId: string, code: string, now: number): Promise<boolean> {
      if (!SIX_DIGITS.test(code)) return false
      return store.claim(replayKey(accountId, code), now, windowMs)
    },
  }
}
