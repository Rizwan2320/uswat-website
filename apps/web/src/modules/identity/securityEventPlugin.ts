/**
 * Better Auth plugin: the security log, "Sign out everywhere" and "This wasn't me" (FP-51, PJ8).
 *
 * Hooks only read what already happened (a new session, a successful call) and write one log row each.
 * The two endpoints are ours, so they sit in the gate's default class `portal`: a session made with a second
 * factor is needed, and an unknown path is closed. They are not step-up: protective actions stay easy to reach.
 */
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthEndpoint, createAuthMiddleware, sessionMiddleware } from 'better-auth/api'
import { deleteSessionCookie } from 'better-auth/cookies'

import { clientAddress, ipPrefix } from './clientAddress'
import { recordEvent, signOutEverywhere, thisWasNotMe, type ActionDeps, type AlertStore, type EventStore, type EventType } from './securityEvents'

const NO_STORE = { 'cache-control': 'no-store' }

/** Paths whose success, with a new session, is a sign-in, and what kind. */
const SIGN_IN_EVENTS: Record<string, EventType> = {
  '/sign-in/email': 'sign-in-password',
  '/passkey/verify-authentication': 'sign-in-passkey',
  '/two-factor/verify-totp': 'sign-in-authenticator',
  '/recovery/sign-in': 'sign-in-recovery',
}
/** Paths whose success, inside an existing session, changes how the account signs in. */
const CHANGE_EVENTS: Record<string, EventType> = {
  '/passkey/verify-registration': 'passkey-added',
  '/passkey/delete-passkey': 'passkey-removed',
  '/recovery/issue': 'recovery-codes-issued',
}

export function securityEventPlugin(events: EventStore, alerts: AlertStore, now: () => number = Date.now): BetterAuthPlugin {
  const failed = (returned: unknown) => returned instanceof Error || (returned instanceof Response && returned.status !== 200)

  return {
    id: 'portal-security-events',
    hooks: {
      after: [
        {
          matcher: (ctx) => typeof ctx.path === 'string' && ctx.path in SIGN_IN_EVENTS,
          handler: createAuthMiddleware(async (ctx) => {
            if (failed(ctx.context.returned)) return
            const user = ctx.context.newSession?.user
            if (!user) return
            await recordEvent(events, { userId: user.id, type: SIGN_IN_EVENTS[ctx.path]!, outcome: 'success', ipPrefix: ipPrefix(clientAddress(ctx.headers)) }, now())
          }),
        },
        {
          matcher: (ctx) => typeof ctx.path === 'string' && ctx.path in CHANGE_EVENTS,
          handler: createAuthMiddleware(async (ctx) => {
            if (failed(ctx.context.returned)) return
            const token = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret)
            if (typeof token !== 'string' || !token) return
            const found = await ctx.context.internalAdapter.findSession(token).catch(() => null)
            if (!found) return
            await recordEvent(events, { userId: found.user.id, type: CHANGE_EVENTS[ctx.path]!, outcome: 'success', ipPrefix: ipPrefix(clientAddress(ctx.headers)) }, now())
          }),
        },
      ],
    },
    endpoints: {
      signOutEverywhere: createAuthEndpoint('/security/sign-out-everywhere', { method: 'POST', use: [sessionMiddleware] }, async (ctx) => {
        const deps: ActionDeps = { events, alerts, now, endAllSessions: (id) => ctx.context.internalAdapter.deleteUserSessions(id) }
        await signOutEverywhere(ctx.context.session.user.id, ipPrefix(clientAddress(ctx.headers)), deps)
        deleteSessionCookie(ctx)
        for (const [k, v] of Object.entries(NO_STORE)) ctx.setHeader(k, v)
        return ctx.json({ ok: true })
      }),
      thisWasNotMe: createAuthEndpoint('/security/not-me', { method: 'POST', use: [sessionMiddleware] }, async (ctx) => {
        const deps: ActionDeps = { events, alerts, now, endAllSessions: (id) => ctx.context.internalAdapter.deleteUserSessions(id) }
        let result: { alerted: boolean }
        try {
          result = await thisWasNotMe(ctx.context.session.user.id, ipPrefix(clientAddress(ctx.headers)), deps)
        } catch {
          // Sessions could not be ended. Say so plainly: the page must not tell the person they are safe.
          throw new APIError('INTERNAL_SERVER_ERROR', { message: 'could not end every session' })
        }
        deleteSessionCookie(ctx)
        for (const [k, v] of Object.entries(NO_STORE)) ctx.setHeader(k, v)
        return ctx.json({ ok: true, alerted: result.alerted })
      }),
    },
    rateLimit: [{ pathMatcher: (path) => path.startsWith('/security/'), window: 60, max: 10 }],
  }
}
