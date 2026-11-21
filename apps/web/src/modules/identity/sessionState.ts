/**
 * What the portal knows about the caller's session, read the same way for the API route and for
 * pages (so a page and the API cannot drift apart). Pure of framework code: dependencies are injected.
 *
 * Lifetime (SES-04) is enforced here: an idle or too-old session is ended and reported as expired.
 * Our lookup does not refresh the session; activity is recorded with `touchSession`.
 */
import type { RouteClass, FactorState } from './gate'
import type { AccountStatus } from './accountStatus'
import { evaluateSession, shouldTouch } from './sessionLifetime'

export type SessionLookup = {
  user: { id: string; email?: string; name?: string }
  session: { id: string; createdAt?: Date | string | number; updatedAt?: Date | string | number }
}

export type SessionDeps = {
  getAuth: () => {
    api: {
      getSession: (opts: { headers: Headers; query?: { disableRefresh?: boolean } }) => Promise<SessionLookup | null>
    }
  }
  loadFactors: (userId: string) => Promise<FactorState>
  isStrongSession: (sessionId: string) => Promise<boolean>
  /** Required, not optional: a caller that forgets it must not silently let a pending or suspended account in. */
  accountStatus: (userId: string) => Promise<AccountStatus>
  /** Epoch ms of the last second-factor proof (step-up). Optional so older callers fail closed (not fresh). */
  lastVerifiedAt?: (sessionId: string) => Promise<number | null>
  /** Whether the session was made with "shared computer" (15 minutes idle). Absent means not shared; throwing means shared (stricter). */
  isSharedSession?: (sessionId: string) => Promise<boolean>
  endSession: (sessionId: string) => Promise<void>
  touchSession: (sessionId: string, now: number) => Promise<void>
}

export type SessionState =
  | { kind: 'none' }
  | { kind: 'expired' }
  | {
      kind: 'active'
      userId: string
      sessionId: string
      email: string | null
      /** null means the factor state could not be read (fail closed). Only read for portal and enrolment paths. */
      factors: FactorState | null
      /** false when unknown or unreadable. Only read for portal and enrolment paths. */
      sessionStrong: boolean
      /** Epoch ms of the last second-factor proof; null when unknown. Only read for portal and enrolment paths. */
      verifiedAt: number | null
      /** 'unknown' when it could not be read (fail closed). Only read for portal and enrolment paths. */
      accountStatus: AccountStatus | 'unknown'
    }

export async function readSessionState(
  deps: SessionDeps,
  headers: Headers,
  cls: RouteClass,
  now: number,
): Promise<SessionState> {
  if (cls === 'public' || cls === 'forbidden') return { kind: 'none' }

  let found: SessionLookup | null
  try {
    // No refresh: our own lookup must not reset the idle clock; activity is recorded below.
    found = await deps.getAuth().api.getSession({ headers, query: { disableRefresh: true } })
  } catch {
    return { kind: 'none' }
  }
  if (!found) return { kind: 'none' }

  let shared = false
  try {
    shared = (await deps.isSharedSession?.(found.session.id)) ?? false
  } catch {
    shared = true // cannot tell: use the stricter limit
  }
  const verdict = evaluateSession({ createdAt: found.session.createdAt, updatedAt: found.session.updatedAt, now, shared })
  if (verdict !== 'ok') {
    await deps.endSession(found.session.id).catch(() => {})
    return { kind: 'expired' }
  }
  const updated = new Date(found.session.updatedAt as Date | string | number)
  if (shouldTouch(updated, now)) await deps.touchSession(found.session.id, now).catch(() => {})

  let factors: FactorState | null = null
  let sessionStrong = false
  let verifiedAt: number | null = null
  let accountStatus: AccountStatus | 'unknown' = 'active'
  if (cls === 'portal' || cls === 'enrolment') {
    try {
      accountStatus = await deps.accountStatus(found.user.id)
    } catch {
      accountStatus = 'unknown'
    }
    if (accountStatus === 'suspended' || accountStatus === 'left') {
      // Treated as signed out, and the session is ended: the same answer as a wrong password, so nothing about the account leaks.
      await deps.endSession(found.session.id).catch(() => {})
      return { kind: 'none' }
    }
    try {
      factors = await deps.loadFactors(found.user.id)
    } catch {
      factors = null
    }
    try {
      sessionStrong = await deps.isStrongSession(found.session.id)
    } catch {
      sessionStrong = false
    }
    try {
      verifiedAt = (await deps.lastVerifiedAt?.(found.session.id)) ?? null
    } catch {
      verifiedAt = null
    }
  }
  return {
    kind: 'active',
    userId: found.user.id,
    sessionId: found.session.id,
    email: found.user.email ?? null,
    factors,
    sessionStrong,
    verifiedAt,
    accountStatus,
  }
}
