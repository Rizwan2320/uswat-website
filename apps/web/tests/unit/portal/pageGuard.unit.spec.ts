import { describe, expect, it, vi } from 'vitest'

import type { AccountStatus } from '@/modules/identity/accountStatus'
import type { FactorState } from '@/modules/identity/gate'
import { accountFrom, guardPage, type GuardDeps } from '@/modules/portal/pageGuard'

const ON = {
  PORTAL_ENABLED: 'true',
  PORTAL_ORIGIN: 'https://portal.uswat.edu.pk',
  PORTAL_DATABASE_URL: 'postgres://x',
  PORTAL_AUTH_SECRET: 'x'.repeat(40),
}
const none: FactorState = { passkeys: 0, totpVerified: false, recoveryCodesRemaining: 0 }
const passkey: FactorState = { passkeys: 1, totpVerified: false, recoveryCodesRemaining: 0 }

function setup(o: { env?: Record<string, string | undefined>; session?: boolean | 'throw' | 'expired'; factors?: FactorState | 'throw'; strong?: boolean; verifiedAgoMs?: number | null; status?: AccountStatus | 'throw' } = {}) {
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
    accountStatus: async () => {
      if (o.status === 'throw') throw new Error('db down')
      return o.status ?? 'active'
    },
    lastVerifiedAt: async () => (o.verifiedAgoMs === null ? null : Date.now() - (o.verifiedAgoMs ?? 1_000)),
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
    expect(await s.run('/portal/sign-in')).toEqual({ action: 'render', userId: null, email: null, strong: false, factors: null, fresh: false })
    expect(await s.run('/portal/recover')).toEqual({ action: 'render', userId: null, email: null, strong: false, factors: null, fresh: false })
  })

  it('the sign-in page still renders when the session lookup fails', async () => {
    expect(await setup({ session: 'throw' }).run('/portal/sign-in')).toEqual({ action: 'render', userId: null, email: null, strong: false, factors: null, fresh: false })
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
      userId: 'u1',
      email: 'dr.sample@example.test',
      strong: true,
      factors: passkey,
      fresh: true,
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
          const d = decide({ hasSession: true, sessionStrong: strong, factors: f, pathname: api, verifiedAt: Date.now(), now: Date.now() })
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

  it('AUTH-09: the security page says whether the second factor was proved in the last ten minutes', async () => {
    expect(await setup({ session: true, factors: passkey, strong: true, verifiedAgoMs: 60_000 }).run('/portal/security')).toMatchObject({ action: 'render', fresh: true })
    expect(await setup({ session: true, factors: passkey, strong: true, verifiedAgoMs: 11 * 60_000 }).run('/portal/security')).toMatchObject({ action: 'render', fresh: false })
    expect(await setup({ session: true, factors: passkey, strong: true, verifiedAgoMs: null }).run('/portal/security')).toMatchObject({ action: 'render', fresh: false })
  })
})

describe('accountFrom (what a server action may act for)', () => {
  const ok = { action: 'render', userId: 'u1', email: 'a@example.test', strong: true, factors: passkey, fresh: true } as const
  it('returns the account for a strong render and nothing otherwise', () => {
    expect(accountFrom(ok)).toEqual({ id: 'u1', email: 'a@example.test' })
    expect(accountFrom({ ...ok, strong: false })).toBeNull()
    expect(accountFrom({ ...ok, userId: null })).toBeNull()
    expect(accountFrom({ ...ok, email: null })).toBeNull()
    expect(accountFrom({ action: 'notFound' })).toBeNull()
    expect(accountFrom({ action: 'redirect', to: '/portal/sign-in' })).toBeNull()
  })
})

describe('account status (FP-17)', () => {
  const strongDeps = { session: true, strong: true, factors: { passkeys: 1, totpVerified: false, recoveryCodesRemaining: 0 } as FactorState }
  it('an active account, and one with no status row, renders portal pages as before', async () => {
    expect(await setup({ ...strongDeps }).run('/portal/profile')).toMatchObject({ action: 'render' })
  })
  it('a pending account is sent to the waiting page from every other portal page, and may see the waiting page', async () => {
    const { run } = setup({ ...strongDeps, status: 'pending-activation' })
    for (const p of ['/portal', '/portal/profile', '/portal/review', '/portal/security', '/portal/cv']) expect(await run(p), p).toEqual({ action: 'redirect', to: '/portal/pending' })
    expect(await run('/portal/pending')).toMatchObject({ action: 'render' })
  })
  it('a pending account may still enrol and sign out', async () => {
    const weak = setup({ session: true, strong: false, factors: { passkeys: 0, totpVerified: false, recoveryCodesRemaining: 0 }, status: 'pending-activation' })
    expect(await weak.run('/portal/enrol')).toMatchObject({ action: 'render' })
  })
  it('a suspended or left account is treated as signed out and its session is ended', async () => {
    for (const status of ['suspended', 'left'] as const) {
      const { run, endSession } = setup({ ...strongDeps, status })
      expect(await run('/portal/profile'), status).toEqual({ action: 'redirect', to: '/portal/sign-in' })
      expect(endSession).toHaveBeenCalledWith('s1')
    }
  })
  it('an unreadable status closes the portal pages (fail closed) without ending the session', async () => {
    const { run, endSession } = setup({ ...strongDeps, status: 'throw' })
    expect(await run('/portal/profile')).toEqual({ action: 'notFound' })
    expect(endSession).not.toHaveBeenCalled()
  })
})
