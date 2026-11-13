/**
 * Progressive delay after failed password sign-ins (Addendum C ABU-01).
 *
 * Two counters: per account (keyed by a hash of the normalised email, whether or not the account
 * exists, so no answer shows which accounts exist, AUTH-10) and per client address (more generous,
 * because a campus sits behind few addresses). After the free failures the next attempt must wait
 * 1, 2, 4 ... seconds from the LAST failure, up to a cap. There is no permanent lockout: the spec
 * rules it out because an attacker could use it to block staff. Counts decay after an hour.
 * Pure logic over a small store, so it is tested without a database.
 */
import { createHash } from 'node:crypto'

export type ThrottlePolicy = { free: number; capMs: number }
export const ACCOUNT_POLICY: ThrottlePolicy = { free: 3, capMs: 15 * 60_000 }
export const ADDRESS_POLICY: ThrottlePolicy = { free: 20, capMs: 5 * 60_000 }
export const DECAY_MS = 60 * 60_000

/** Wait required after `failures` consecutive failures: none up to `free`, then 1 s doubling, capped. */
export function waitMs(failures: number, policy: ThrottlePolicy): number {
  if (failures <= policy.free) return 0
  const exp = Math.min(failures - policy.free - 1, 40) // 2^40 s is far above any cap; avoids Infinity
  return Math.min(policy.capMs, 1_000 * 2 ** exp)
}

export type ThrottleState = { failures: number; lastFailureAt: number }

export interface ThrottleStore {
  get(key: string): Promise<ThrottleState | null>
  /** Counts one failure; starts again from one if the last failure is older than DECAY_MS. */
  recordFailure(key: string, now: number): Promise<void>
  reset(key: string): Promise<void>
}

/** Password sign-in and recovery sign-in both take a password, so both are channels for guessing one. Counted apart: an attack on one must never delay the owner on the other. */
export type Channel = 'password' | 'recovery'
export type Target = { email: string; address: string; channel?: Channel }
export type CheckResult = { allowed: true } | { allowed: false; retryAfterMs: number }

const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const accountKey = (t: Target) => `${t.channel ?? 'password'}:a:${sha(t.email.trim().toLowerCase().slice(0, 254))}`
const addressKey = (t: Target) => `${t.channel ?? 'password'}:i:${sha(t.address.slice(0, 64))}`

function remaining(state: ThrottleState | null, policy: ThrottlePolicy, now: number): number {
  if (!state || now - state.lastFailureAt > DECAY_MS) return 0
  return Math.max(0, state.lastFailureAt + waitMs(state.failures, policy) - now)
}

export function createSignInThrottle(deps: { store: ThrottleStore }) {
  const { store } = deps
  return {
    /** Throws if the counters cannot be read: the caller refuses the request rather than wave it through. */
    async check(target: Target, now: number): Promise<CheckResult> {
      const [a, i] = await Promise.all([store.get(accountKey(target)), store.get(addressKey(target))])
      const retryAfterMs = Math.max(remaining(a, ACCOUNT_POLICY, now), remaining(i, ADDRESS_POLICY, now))
      return retryAfterMs > 0 ? { allowed: false, retryAfterMs } : { allowed: true }
    },
    async failed(target: Target, now: number): Promise<void> {
      await Promise.all([store.recordFailure(accountKey(target), now), store.recordFailure(addressKey(target), now)])
    },
    /** The password was right: clear the account counter. The address counter stays (one success proves nothing about a guesser). */
    async succeeded(target: { email: string; channel?: Channel }): Promise<void> {
      await store.reset(accountKey({ ...target, address: '' }))
    },
  }
}

export type SignInThrottle = ReturnType<typeof createSignInThrottle>

export function createMemoryThrottleStore(): ThrottleStore & { keys(): string[] } {
  const m = new Map<string, ThrottleState>()
  return {
    async get(key) {
      const s = m.get(key)
      return s ? { ...s } : null
    },
    async recordFailure(key, now) {
      const s = m.get(key)
      if (!s || now - s.lastFailureAt > DECAY_MS) m.set(key, { failures: 1, lastFailureAt: now })
      else m.set(key, { failures: s.failures + 1, lastFailureAt: now })
    },
    async reset(key) {
      m.delete(key)
    },
    keys: () => [...m.keys()],
  }
}
