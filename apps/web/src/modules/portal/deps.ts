/**
 * One place that wires the portal's identity module to PostgreSQL, used by the API route and by the
 * pages' guard, so the two cannot drift. Everything is built lazily on first use: importing this file
 * opens no connection and, with the portal off, builds nothing (ADR-0020).
 */
import { createPgAssuranceStore } from '../identity/assuranceStore'
import { createPortalAuth, type PortalAuth } from '../identity/auth'
import { readPortalConfig } from '../identity/config'
import { getIdentityPool } from '../identity/db'
import { loadFactors } from '../identity/factors'
import type { AuthLike, HandlerDeps } from '../identity/handlers'
import { createPgSharedStore } from '../identity/sharedStore'
import { createPgSessionStore } from '../identity/sessionStore'
import { ipPrefix } from '../identity/clientAddress'
import { createPgEventStore, recordEvent } from '../identity/securityEvents'
import { createSignInThrottle } from '../identity/signInThrottle'
import { createPgThrottleStore } from '../identity/signInThrottleStore'

let auth: PortalAuth | null = null

function enabledConfig() {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return config
}

export function getAuth(): AuthLike {
  auth ??= createPortalAuth(enabledConfig())
  return auth as unknown as AuthLike
}

const pool = () => getIdentityPool(enabledConfig().databaseUrl)
const throttle = () => createSignInThrottle({ store: createPgThrottleStore(pool()) })

export const portalDeps: Omit<HandlerDeps, 'env'> = {
  getAuth,
  loadFactors: (userId) => loadFactors(pool(), userId),
  isStrongSession: (sessionId) => createPgAssuranceStore(pool()).isStrong(sessionId),
  lastVerifiedAt: (sessionId) => createPgAssuranceStore(pool()).lastVerifiedAt(sessionId),
  isSharedSession: (sessionId) => createPgSharedStore(pool()).isShared(sessionId),
  endSession: (sessionId) => createPgSessionStore(pool()).end(sessionId),
  touchSession: (sessionId, now) => createPgSessionStore(pool()).touch(sessionId, now),
  recordSignInFailure: async (email, address) => {
    // Known accounts only: an unknown address leaves no row, so the log cannot be used to test which emails exist.
    const { rows } = await pool().query<{ id: string }>(`select "id" from "user" where lower("email") = lower($1)`, [email.trim()])
    if (rows[0]) await recordEvent(createPgEventStore(pool()), { userId: rows[0].id, type: 'sign-in-failed', outcome: 'failure', ipPrefix: ipPrefix(address) })
  },
  signInThrottle: {
    check: (target, now) => throttle().check(target, now),
    failed: (target, now) => throttle().failed(target, now),
    succeeded: (target) => throttle().succeeded(target),
  },
}
