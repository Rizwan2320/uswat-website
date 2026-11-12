/**
 * Portal auth API. Answers 404 unless the owner has enabled the portal on its own project
 * (see src/modules/identity/config.ts); the public site's deployment never sets those variables.
 */
import { readPortalConfig } from '@/modules/identity/config'
import { createPortalAuth, type PortalAuth } from '@/modules/identity/auth'
import { createPgAssuranceStore } from '@/modules/identity/assuranceStore'
import { getIdentityPool } from '@/modules/identity/db'
import { createPgSessionStore } from '@/modules/identity/sessionStore'
import { createSignInThrottle } from '@/modules/identity/signInThrottle'
import { createPgThrottleStore } from '@/modules/identity/signInThrottleStore'
import { loadFactors } from '@/modules/identity/factors'
import { createAuthHandlers, type AuthLike } from '@/modules/identity/handlers'

export const dynamic = 'force-dynamic'

let auth: PortalAuth | null = null

function getAuth(): AuthLike {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  auth ??= createPortalAuth(config)
  return auth as unknown as AuthLike
}

/** Built per call from the pool, so importing this file opens no connection (ADR-0020). */
function throttle() {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createSignInThrottle({ store: createPgThrottleStore(getIdentityPool(config.databaseUrl)) })
}

export const { GET, POST } = createAuthHandlers({
  env: process.env,
  getAuth,
  loadFactors: (userId) => {
    const config = readPortalConfig(process.env)
    if (!config.enabled) throw new Error('portal disabled')
    return loadFactors(getIdentityPool(config.databaseUrl), userId)
  },
  isStrongSession: (sessionId) => {
    const config = readPortalConfig(process.env)
    if (!config.enabled) throw new Error('portal disabled')
    return createPgAssuranceStore(getIdentityPool(config.databaseUrl)).isStrong(sessionId)
  },
  endSession: (sessionId) => {
    const config = readPortalConfig(process.env)
    if (!config.enabled) throw new Error('portal disabled')
    return createPgSessionStore(getIdentityPool(config.databaseUrl)).end(sessionId)
  },
  touchSession: (sessionId, now) => {
    const config = readPortalConfig(process.env)
    if (!config.enabled) throw new Error('portal disabled')
    return createPgSessionStore(getIdentityPool(config.databaseUrl)).touch(sessionId, now)
  },
  signInThrottle: {
    check: (target, now) => throttle().check(target, now),
    failed: (target, now) => throttle().failed(target, now),
    succeeded: (target) => throttle().succeeded(target),
  },
})
