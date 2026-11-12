import { describe, expect, it, vi } from 'vitest'

import { AUTH_BASE, type FactorState } from '@/modules/identity/gate'
import { createAuthHandlers, type AuthLike } from '@/modules/identity/handlers'

const env = {
  PORTAL_ENABLED: 'true',
  PORTAL_ORIGIN: 'https://portal.uswat.edu.pk',
  PORTAL_DATABASE_URL: 'postgres://u:p@db.example/identity',
  PORTAL_AUTH_SECRET: 'x'.repeat(32),
}
const noFactor: FactorState = { passkeys: 0, totpVerified: false, recoveryCodesRemaining: 0 }
const withPasskey: FactorState = { passkeys: 1, totpVerified: false, recoveryCodesRemaining: 10 }

function setup(opts: { env?: Record<string, string | undefined>; session?: boolean; factors?: FactorState | 'throw'; strong?: boolean | 'throw' } = {}) {
  const libHandler = vi.fn(async () => new Response('library', { status: 200 }))
  const getSession = vi.fn(async () => (opts.session ? { user: { id: 'u1' }, session: { id: 's1' } } : null))
  const auth: AuthLike = { handler: libHandler, api: { getSession } }
  const getAuth = vi.fn(() => auth)
  const loadFactors = vi.fn(async () => {
    if (opts.factors === 'throw') throw new Error('db down')
    return opts.factors ?? noFactor
  })
  const isStrongSession = vi.fn(async () => {
    if (opts.strong === 'throw') throw new Error('db down')
    return opts.strong ?? true
  })
  const h = createAuthHandlers({ env: opts.env ?? env, getAuth, loadFactors, isStrongSession })
  return { h, libHandler, getSession, getAuth, loadFactors, isStrongSession }
}
const req = (path: string, method = 'GET') => new Request(`https://portal.uswat.edu.pk${path}`, { method })

describe('portal auth route handlers', () => {
  it('answers 404 and touches nothing when the portal is not enabled', async () => {
    const s = setup({ env: {} })
    for (const m of ['GET', 'POST'] as const) {
      const res = await s.h[m](req(`${AUTH_BASE}/sign-in/email`, m))
      expect(res.status).toBe(404)
    }
    expect(s.getAuth).not.toHaveBeenCalled()
    expect(s.getSession).not.toHaveBeenCalled()
    expect(s.loadFactors).not.toHaveBeenCalled()
  })

  it('forwards a public path without reading a session', async () => {
    const s = setup()
    const res = await s.h.POST(req(`${AUTH_BASE}/sign-in/email`, 'POST'))
    expect(res.status).toBe(200)
    expect(s.libHandler).toHaveBeenCalledTimes(1)
    expect(s.getSession).not.toHaveBeenCalled()
  })

  it('answers 404 for endpoints that are never offered, and does not call the library', async () => {
    const s = setup({ session: true, factors: withPasskey })
    for (const p of ['two-factor/send-otp', 'two-factor/verify-otp', 'sign-up/email', 'two-factor/verify-backup-code', 'two-factor/generate-backup-codes']) {
      const res = await s.h.POST(req(`${AUTH_BASE}/${p}`, 'POST'))
      expect(res.status, p).toBe(404)
    }
    expect(s.libHandler).not.toHaveBeenCalled()
  })

  it('answers 404 for encoded, upper-case or traversal spellings of closed endpoints and never calls the library', async () => {
    const s = setup({ session: true, factors: withPasskey })
    for (const p of [
      'two-factor/generate-backup%2Dcodes',
      'TWO-FACTOR/SEND-OTP',
      'two-factor/../two-factor/verify-otp',
      'Sign-Up/Email',
      'two-factor%2Fverify-backup-code',
    ]) {
      const res = await s.h.POST(req(`${AUTH_BASE}/${p}`, 'POST'))
      expect(res.status, p).toBe(404)
    }
    expect(s.libHandler).not.toHaveBeenCalled()
    expect(s.getSession).not.toHaveBeenCalled()
  })

  it('answers 401 without a session on a protected path', async () => {
    const s = setup({ session: false })
    const res = await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(res.status).toBe(401)
    expect(s.libHandler).not.toHaveBeenCalled()
  })

  it('confines a session without a second factor: 403 on protected paths, enrolment allowed', async () => {
    const s = setup({ session: true, factors: noFactor })
    const denied = await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(denied.status).toBe(403)
    expect(await denied.json()).toMatchObject({ redirectTo: '/portal/enrol' })
    expect(s.libHandler).not.toHaveBeenCalled()
    const ok = await s.h.POST(req(`${AUTH_BASE}/passkey/generate-register-options`, 'POST'))
    expect(ok.status).toBe(200)
    expect(s.libHandler).toHaveBeenCalledTimes(1)
  })

  it('lets a session with a passkey reach protected paths', async () => {
    const s = setup({ session: true, factors: withPasskey })
    const res = await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(res.status).toBe(200)
  })

  it('fails closed when the factor state cannot be read', async () => {
    const s = setup({ session: true, factors: 'throw' })
    const res = await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(res.status).toBe(403)
    expect(s.libHandler).not.toHaveBeenCalled()
  })

  it('fails closed when the session lookup throws', async () => {
    const s = setup({ session: true, factors: withPasskey })
    s.getSession.mockRejectedValueOnce(new Error('db down'))
    const res = await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(res.status).toBe(401)
    expect(s.libHandler).not.toHaveBeenCalled()
  })

  it('marks every refusal as not cacheable and does not echo internal error text', async () => {
    const s = setup({ session: true, factors: 'throw' })
    const res = await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(JSON.stringify(await res.json())).not.toContain('db down')
  })

  it('FP-2: refuses a password-only session at a protected path even when a passkey is registered', async () => {
    const s = setup({ session: true, factors: withPasskey, strong: false })
    const res = await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({ redirectTo: '/portal/sign-in' })
    expect(s.libHandler).not.toHaveBeenCalled()
    expect(s.isStrongSession).toHaveBeenCalledWith('s1')
  })

  it('FP-2: refuses enrolment to a password-only session once a factor exists, and allows the first factor', async () => {
    const withFactor = setup({ session: true, factors: withPasskey, strong: false })
    expect((await withFactor.h.POST(req(`${AUTH_BASE}/two-factor/enable`, 'POST'))).status).toBe(403)
    expect(withFactor.libHandler).not.toHaveBeenCalled()
    const first = setup({ session: true, factors: noFactor, strong: false })
    expect((await first.h.POST(req(`${AUTH_BASE}/two-factor/enable`, 'POST'))).status).toBe(200)
  })

  it('FP-2: fails closed when the session strength cannot be read', async () => {
    const s = setup({ session: true, factors: withPasskey, strong: 'throw' })
    expect((await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))).status).toBe(403)
    expect(s.libHandler).not.toHaveBeenCalled()
  })

  it('FP-2: reading the session and signing out need no factor lookup', async () => {
    const s = setup({ session: true, factors: 'throw', strong: false })
    expect((await s.h.GET(req(`${AUTH_BASE}/get-session`))).status).toBe(200)
    expect((await s.h.POST(req(`${AUTH_BASE}/sign-out`, 'POST'))).status).toBe(200)
    expect(s.loadFactors).not.toHaveBeenCalled()
  })
})
