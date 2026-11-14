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
 *
 * Also (FP-8):
 *   - records when the second factor was last proved, for step-up (AUTH-09). Authentication events refresh it;
 *     registering a passkey does not (the row is only created, for first-factor enrolment);
 *   - rotation (SES-03): when a sign-in makes a new session and the request arrived with a different one,
 *     that old session is ended, so a session id never survives a sign-in or a step-up by passkey.
 */
import type { BetterAuthPlugin } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'

import type { AssuranceStore } from './assuranceStore'
import { sharedRequested } from './sharedComputer'
import type { SharedStore } from './sharedStore'

const STRONG_PATHS = new Set(['/passkey/verify-authentication', '/passkey/verify-registration', '/two-factor/verify-totp'])
/** Registering a key is not a proof of identity, so it never refreshes the step-up clock. */
const NOT_A_PROOF = new Set(['/passkey/verify-registration'])
/** Every endpoint that can make a new session. (The recovery sign-in does the same itself, see recoveryPlugin.) */
const SIGN_IN_PATHS = new Set(['/sign-in/email', '/passkey/verify-authentication', '/two-factor/verify-totp'])

/** Whether a successful call to this path proves the person's identity again (refreshes the step-up clock). */
export function refreshesProof(path: string): boolean {
  return STRONG_PATHS.has(path) && !NOT_A_PROOF.has(path)
}

/**
 * SES-03: the session the request arrived with is ended once a different new session exists for it.
 * Nothing is ended when there is no new session, no incoming session, or they are the same.
 */
export async function endReplacedSession(
  created: string | undefined,
  incomingToken: unknown,
  deps: {
    find: (token: string) => Promise<{ session: { id: string; token: string } } | null>
    remove: (token: string) => Promise<void>
  },
): Promise<'ended' | 'kept'> {
  if (!created || typeof incomingToken !== 'string' || !incomingToken) return 'kept'
  const old = await deps.find(incomingToken).catch(() => null)
  if (!old || old.session.id === created) return 'kept'
  await deps.remove(old.session.token).catch(() => {})
  return 'ended'
}

export function sessionAssurancePlugin(store: AssuranceStore, shared?: SharedStore): BetterAuthPlugin {
  return {
    id: 'portal-session-assurance',
    hooks: {
      after: [
        {
          matcher: (ctx) => typeof ctx.path === 'string' && SIGN_IN_PATHS.has(ctx.path),
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.returned
            if (returned instanceof Error) return
            if (returned instanceof Response && returned.status !== 200) return
            const created = ctx.context.newSession?.session.id
            if (!created) return
            // "Shared computer" (SES-04): the page set a cookie before signing in; record it on the new session.
            if (shared && sharedRequested(ctx.headers?.get('cookie'))) await shared.mark(created).catch(() => {})
            const token = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret)
            await endReplacedSession(created, token, {
              find: (t) => ctx.context.internalAdapter.findSession(t),
              remove: (t) => ctx.context.internalAdapter.deleteSession(t),
            })
          }),
        },
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
            if (sessionId) await store.mark(sessionId, { verified: refreshesProof(ctx.path) })
          }),
        },
      ],
    },
  }
}
