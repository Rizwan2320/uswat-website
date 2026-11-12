/**
 * Better Auth plugin that records which sessions were made with a second factor (AUTH-01, FP-2).
 *
 * Why: the library gives a full session after a password for any account whose two-factor flag is
 * off, and a user who has only a passkey has that flag off. The enrolment gate therefore cannot
 * infer "second factor used" from "second factor registered". This plugin marks a session strong
 * only after one of three things succeeds, and the gate treats an unmarked session as password-only:
 *   - passkey sign-in (user verification is required by configuration);
 *   - a completed TOTP step, at sign-in or when confirming enrolment;
 *   - registering a passkey. The enrolment gate lets a password-only session do this only while
 *     the account has no factor yet, so this is first-factor enrolment, not an upgrade for an
 *     account that already has one.
 * A failed call marks nothing.
 */
import type { BetterAuthPlugin } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'

import type { AssuranceStore } from './assuranceStore'

const STRONG_PATHS = new Set(['/passkey/verify-authentication', '/passkey/verify-registration', '/two-factor/verify-totp'])

export function sessionAssurancePlugin(store: AssuranceStore): BetterAuthPlugin {
  return {
    id: 'portal-session-assurance',
    hooks: {
      after: [
        {
          matcher: (ctx) => typeof ctx.path === 'string' && STRONG_PATHS.has(ctx.path),
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.returned
            if (returned instanceof Error) return
            if (returned instanceof Response && returned.status !== 200) return

            // A sign-in creates a new session; enrolment runs inside the existing one.
            let sessionId: string | undefined = ctx.context.newSession?.session.id
            if (!sessionId) {
              const token = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret)
              if (typeof token === 'string' && token) {
                const found = await ctx.context.internalAdapter.findSession(token).catch(() => null)
                sessionId = found?.session.id
              }
            }
            if (sessionId) await store.mark(sessionId)
          }),
        },
      ],
    },
  }
}
