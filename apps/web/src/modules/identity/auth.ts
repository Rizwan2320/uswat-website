/**
 * The portal's Better Auth instance (ADR-0023). Built lazily, once, from a validated config.
 *
 * Settings that differ from the library defaults, each proved in spike S-2:
 * - passkey user verification "required" (default is "preferred", which accepts UV=0);
 * - cookie `__Host-portal.session_token`: useSecureCookies false plus secure:true, because
 *   useSecureCookies:true forces a `__Secure-` prefix and the name becomes `__Secure-__Host-...`;
 * - library session cookie cache left off, so revocation is immediate (SES-05);
 * - no SMS or email second factor: those endpoints are closed in ./gate.ts.
 */
import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { twoFactor } from 'better-auth/plugins'

import { getIdentityPool } from './db'
import type { PortalConfig } from './config'
import { createPgReplayStore } from './replayStore'
import { totpReplayPlugin } from './totpReplayPlugin'

type EnabledConfig = Extract<PortalConfig, { enabled: true }>

export function createPortalAuth(config: EnabledConfig) {
  const pool = getIdentityPool(config.databaseUrl)
  return betterAuth({
    baseURL: config.origin,
    basePath: '/portal-api/auth',
    secret: config.secret,
    database: pool,
    emailAndPassword: { enabled: true, minPasswordLength: 15, maxPasswordLength: 128, autoSignIn: true },
    session: { expiresIn: 60 * 60 * 12 },
    advanced: {
      useSecureCookies: false,
      cookiePrefix: '__Host-portal',
      defaultCookieAttributes: { secure: true, httpOnly: true, sameSite: 'lax', path: '/' },
    },
    plugins: [
      passkey({
        rpID: config.rpID,
        rpName: 'University of Swat faculty portal',
        origin: config.origin,
        authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' },
      }),
      twoFactor({
        issuer: 'University of Swat',
        totpOptions: { digits: 6, period: 30 },
        backupCodeOptions: { amount: 0 },
      }),
      totpReplayPlugin(createPgReplayStore(pool)),
    ],
  })
}

export type PortalAuth = ReturnType<typeof createPortalAuth>
