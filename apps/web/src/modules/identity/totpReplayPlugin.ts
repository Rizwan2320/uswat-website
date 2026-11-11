/**
 * Better Auth plugin that runs the replay guard before the library verifies a TOTP code.
 *
 * Which account a verify call is for: a signed-in user (enrolment confirmation) is identified
 * by the session; a user in the middle of sign-in by the library's signed two-factor cookie,
 * whose verification record holds the user id. The guard claims the code first: a wrong code
 * burns only that one value for the window, which costs an attacker nothing they did not
 * already need to guess.
 */
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'

import { createReplayGuard, type ReplayStore } from './totpReplay'

// Library constant (better-auth/plugins/two-factor/constant): the name before any prefix.
const TWO_FACTOR_COOKIE = 'two_factor'

export function totpReplayPlugin(store: ReplayStore, now: () => number = Date.now): BetterAuthPlugin {
  const guard = createReplayGuard(store)
  return {
    id: 'portal-totp-replay',
    hooks: {
      before: [
        {
          matcher: (ctx) => ctx.path === '/two-factor/verify-totp',
          handler: createAuthMiddleware(async (ctx) => {
            const body = (ctx.body ?? {}) as { code?: unknown }
            const code = typeof body.code === 'string' ? body.code : ''

            let userId: string | null = null
            const cookie = ctx.context.createAuthCookie(TWO_FACTOR_COOKIE)
            const signed = await ctx.getSignedCookie(cookie.name, ctx.context.secret)
            if (signed) {
              const v = await ctx.context.internalAdapter.findVerificationValue(signed)
              userId = v?.value ?? null
            }
            if (!userId) {
              const token = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret)
              if (typeof token === 'string' && token) {
                const session = await ctx.context.internalAdapter.findSession(token).catch(() => null)
                userId = session?.user.id ?? null
              }
            }
            // No identifiable account: leave it to the library, which will refuse the call itself.
            if (!userId) return

            const first = await guard.claim(userId, code, now())
            if (!first) throw new APIError('UNAUTHORIZED', { message: 'Invalid code' })
          }),
        },
      ],
    },
  }
}
