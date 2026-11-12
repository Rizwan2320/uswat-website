/**
 * Better Auth plugin: issue recovery codes and sign in with one (AUTH-05, PJ3, section 5.6).
 *
 * Only the library's public context calls are used: its password verifier, its session creation
 * and cookie setter, and its internal adapter. The library's own backup-code endpoints stay closed.
 *
 * Sign-in is one call with email, password and code, not the two-factor cookie: an account whose
 * only factor is a passkey has the library's two-factor flag off and is never given that cookie.
 * Every failure, whatever the cause, is the same 401 with the same body (AUTH-10); an unknown
 * email still pays for one password hash so timing does not show it.
 */
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthEndpoint, sessionMiddleware } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'
import * as z from 'zod'

import type { AssuranceStore } from './assuranceStore'
import type { createRecoveryService } from './recoveryService'

const NO_STORE = { 'cache-control': 'no-store' }

export function recoveryPlugin(
  service: ReturnType<typeof createRecoveryService>,
  assurance: AssuranceStore,
  now: () => number = Date.now,
): BetterAuthPlugin {
  const refuse = () => new APIError('UNAUTHORIZED', { message: 'Invalid credentials' })

  return {
    id: 'portal-recovery',
    endpoints: {
      issueRecoveryCodes: createAuthEndpoint(
        '/recovery/issue',
        { method: 'POST', use: [sessionMiddleware] },
        async (ctx) => {
          // The gate has already required a session made with a second factor; this is the account of that session.
          const codes = await service.issue(ctx.context.session.user.id)
          for (const [k, v] of Object.entries(NO_STORE)) ctx.setHeader(k, v)
          return ctx.json({ codes })
        },
      ),

      recoverySignIn: createAuthEndpoint(
        '/recovery/sign-in',
        {
          method: 'POST',
          body: z.object({ email: z.string().max(254), password: z.string().max(128), code: z.string().max(64) }),
        },
        async (ctx) => {
          const { email, password, code } = ctx.body
          const found = await ctx.context.internalAdapter.findUserByEmail(email.toLowerCase(), { includeAccounts: true })
          const account = found?.accounts.find((a) => a.providerId === 'credential' && a.accountId === found.user.id)
          if (!found || !account?.password) {
            await ctx.context.password.hash(password)
            throw refuse()
          }
          const passwordOk = await ctx.context.password.verify({ hash: account.password, password })
          if (!passwordOk) throw refuse()

          const result = await service.redeem(found.user.id, code, now())
          if (result.status !== 'ok') throw refuse()

          // Lost device: nothing made before this moment is trusted any more.
          await ctx.context.internalAdapter.deleteUserSessions(found.user.id)
          const session = await ctx.context.internalAdapter.createSession(found.user.id, false)
          if (!session) throw new APIError('INTERNAL_SERVER_ERROR', { message: 'failed to create session' })
          await assurance.mark(session.id)
          await setSessionCookie(ctx, { session, user: found.user })
          for (const [k, v] of Object.entries(NO_STORE)) ctx.setHeader(k, v)
          return ctx.json({ token: session.token, remaining: result.remaining })
        },
      ),
    },
    rateLimit: [{ pathMatcher: (path) => path.startsWith('/recovery/'), window: 60, max: 10 }],
  }
}
