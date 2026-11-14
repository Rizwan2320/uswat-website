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
import { createPgSessionStore } from '../identity/sessionStore'
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
  endSession: (sessionId) => createPgSessionStore(pool()).end(sessionId),
  touchSession: (sessionId, now) => createPgSessionStore(pool()).touch(sessionId, now),
  signInThrottle: {
    check: (target, now) => throttle().check(target, now),
    failed: (target, now) => throttle().failed(target, now),
    succeeded: (target) => throttle().succeeded(target),
  },
}
