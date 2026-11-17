import { describe, expect, it, vi } from 'vitest'

import type { FactorState } from '@/modules/identity/gate'
import { guardPage, type GuardDeps } from '@/modules/portal/pageGuard'

const ON = {
  PORTAL_ENABLED: 'true',
  PORTAL_ORIGIN: 'https://portal.uswat.edu.pk',
  PORTAL_DATABASE_URL: 'postgres://x',
  PORTAL_AUTH_SECRET: 'x'.repeat(40),
}
const none: FactorState = { passkeys: 0, totpVerified: false, recoveryCodesRemaining: 0 }
const passkey: FactorState = { passkeys: 1, totpVerified: false, recoveryCodesRemaining: 0 }

function setup(o: { env?: Record<string, string | undefined>; session?: boolean | 'throw' | 'expired'; factors?: FactorState | 'throw'; strong?: boolean } = {}) {
  const updatedMsAgo = o.session === 'expired' ? 31 * 60_000 : 1_000
  const getSession = vi.fn(async () => {
    if (o.session === 'throw') throw new Error('db down')
    if (!o.session) return null
    return {
      user: { id: 'u1', email: 'dr.sample@example.test' },
      session: { id: 's1', createdAt: new Date(Date.now() - 60_000), updatedAt: new Date(Date.now() - updatedMsAgo) },
    }
  })
  const endSession = vi.fn(async () => {})
  const deps: GuardDeps = {
    env: o.env ?? ON,
    getAuth: () => ({ api: { getSession } }),
    loadFactors: async () => {
      if (o.factors === 'throw') throw new Error('db down')
      return o.factors ?? none
    },
    isStrongSession: async () => o.strong ?? false,
    endSession,
    touchSession: async () => {},
  }
  return { deps, getSession, endSession, run: (path: string) => guardPage(deps, new Headers(), path, Date.now()) }
}

describe('guardPage: the same rules as the route, applied to pages', () => {
  it('every page is a 404 when the portal is off, and nothing is looked up', async () => {
    for (const env of [{}, { ...ON, PORTAL_ENABLED: 'false' }, { ...ON, PORTAL_AUTH_SECRET: 'short' }]) {
      const s = setup({ env, session: true })
      for (const p of ['/portal', '/portal/sign-in', '/portal/enrol', '/portal/security']) {
        expect(await s.run(p), p).toEqual({ action: 'notFound' })
      }
      expect(s.getSession).not.toHaveBeenCalled()
    }
  })

  it('the sign-in and recovery pages render for a signed-out visitor', async () => {
    const s = setup({ session: false })
    expect(await s.run('/portal/sign-in')).toEqual({ action: 'render', email: null, strong: false, factors: null })
    expect(await s.run('/portal/recover')).toEqual({ action: 'render', email: null, strong: false, factors: null })
  })

  it('the sign-in page still renders when the session lookup fails', async () => {
    expect(await setup({ session: 'throw' }).run('/portal/sign-in')).toEqual({ action: 'render', email: null, strong: false, factors: null })
  })

  it('a path that is not a portal page (odd encodings, dot segments) is a 404', async () => {
    const s = setup({ session: true, factors: passkey, strong: true })
    for (const p of ['/portal/../x', '/portal//enrol', '/portal/%2e%2e/x', '/portal\\enrol']) {
      expect(await s.run(p), p).toEqual({ action: 'notFound' })
    }
  })

  it('the home page sends a signed-out visitor to sign-in', async () => {
    expect(await setup({ session: false }).run('/portal')).toEqual({ action: 'redirect', to: '/portal/sign-in' })
  })

  it('the home page sends a password-only session with no factor to enrolment', async () => {
    expect(await setup({ session: true, factors: none, strong: false }).run('/portal')).toEqual({ action: 'redirect', to: '/portal/enrol' })
  })

  it('AUTH-01: the home page does NOT open for a password-only session on an account that has a passkey', async () => {
    expect(await setup({ session: true, factors: passkey, strong: false }).run('/portal')).toEqual({ action: 'redirect', to: '/portal/sign-in?reason=second-factor' })
  })

  it('the home page opens for a strong session with a registered factor, and says whose it is', async () => {
    expect(await setup({ session: true, factors: passkey, strong: true }).run('/portal')).toEqual({
      action: 'render',
      email: 'dr.sample@example.test',
      strong: true,
      factors: passkey,
    })
  })

  it('the enrolment page: first factor from a password session; refused to a password session once a factor exists; open to a strong one', async () => {
    expect((await setup({ session: true, factors: none, strong: false }).run('/portal/enrol')).action).toBe('render')
    expect(await setup({ session: true, factors: passkey, strong: false }).run('/portal/enrol')).toEqual({ action: 'redirect', to: '/portal/sign-in?reason=second-factor' })
    expect((await setup({ session: true, factors: passkey, strong: true }).run('/portal/enrol')).action).toBe('render')
  })

  it('the enrolment page sends a signed-out visitor to sign-in', async () => {
    expect(await setup({ session: false }).run('/portal/enrol')).toEqual({ action: 'redirect', to: '/portal/sign-in' })
  })

  it('the sign-in page sends someone who is already fully signed in to the home page, but not a weak session', async () => {
    expect(await setup({ session: true, factors: passkey, strong: true }).run('/portal/sign-in')).toEqual({ action: 'redirect', to: '/portal' })
    expect((await setup({ session: true, factors: passkey, strong: false }).run('/portal/sign-in')).action).toBe('render')
  })

  it('SES-04: an expired session is ended and the visitor is sent to sign-in with the reason', async () => {
    const s = setup({ session: 'expired', factors: passkey, strong: true })
    expect(await s.run('/portal')).toEqual({ action: 'redirect', to: '/portal/sign-in?reason=expired' })
    expect(s.endSession).toHaveBeenCalledWith('s1')
  })

  it('fails closed: a lookup that throws is a signed-out visitor; unreadable factors never open a protected page', async () => {
    expect(await setup({ session: 'throw' }).run('/portal')).toEqual({ action: 'redirect', to: '/portal/sign-in' })
    const r = await setup({ session: true, factors: 'throw', strong: true }).run('/portal')
    expect(r.action).not.toBe('render')
  })

  it('the same states give the same answer as the route gate (page and API cannot drift)', async () => {
    const { decide } = await import('@/modules/identity/gate')
    for (const strong of [true, false]) {
      for (const f of [none, passkey]) {
        for (const [page, api] of [['/portal', '/portal-api/auth/passkey/list-user-passkeys'], ['/portal/enrol', '/portal-api/auth/two-factor/enable']] as const) {
          const d = decide({ hasSession: true, sessionStrong: strong, factors: f, pathname: api })
          const g = await setup({ session: true, factors: f, strong }).run(page)
          expect(g.action === 'render', `${page} strong=${strong} passkeys=${f.passkeys}`).toBe(d.allow)
        }
      }
    }
  })

  it('the security page: strong session with a factor opens and carries the factor state; password-only, signed-out and no-factor do not', async () => {
    const strong = await setup({ session: true, factors: passkey, strong: true }).run('/portal/security')
    expect(strong).toMatchObject({ action: 'render', strong: true, factors: passkey })
    expect(await setup({ session: true, factors: passkey, strong: false }).run('/portal/security')).toEqual({ action: 'redirect', to: '/portal/sign-in?reason=second-factor' })
    expect(await setup({}).run('/portal/security')).toEqual({ action: 'redirect', to: '/portal/sign-in' })
    expect(await setup({ session: true, factors: none, strong: false }).run('/portal/security')).toEqual({ action: 'redirect', to: '/portal/enrol' })
  })
})
