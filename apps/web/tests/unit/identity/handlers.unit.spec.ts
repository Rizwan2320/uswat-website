import { describe, expect, it, vi } from 'vitest'

import { AUTH_BASE, type FactorState } from '@/modules/identity/gate'
import { createAuthHandlers, type AuthLike } from '@/modules/identity/handlers'
import { createMemoryThrottleStore, createSignInThrottle } from '@/modules/identity/signInThrottle'

const env = {
  PORTAL_ENABLED: 'true',
  PORTAL_ORIGIN: 'https://portal.uswat.edu.pk',
  PORTAL_DATABASE_URL: 'postgres://u:p@db.example/identity',
  PORTAL_AUTH_SECRET: 'x'.repeat(32),
}
const noFactor: FactorState = { passkeys: 0, totpVerified: false, recoveryCodesRemaining: 0 }
const withPasskey: FactorState = { passkeys: 1, totpVerified: false, recoveryCodesRemaining: 10 }

function setup(opts: { env?: Record<string, string | undefined>; session?: boolean; factors?: FactorState | 'throw'; strong?: boolean | 'throw'; createdMsAgo?: number; updatedMsAgo?: number } = {}) {
  const libHandler = vi.fn(async (_req: Request) => new Response('library', { status: 200 }))
  const getSession = vi.fn(async () => (opts.session ? { user: { id: 'u1' }, session: { id: 's1', createdAt: new Date(Date.now() - (opts.createdMsAgo ?? 60_000)), updatedAt: new Date(Date.now() - (opts.updatedMsAgo ?? 1_000)) } } : null))
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
  const endSession = vi.fn(async () => {})
  const touchSession = vi.fn(async () => {})
  const store = createMemoryThrottleStore()
  const signInThrottle = createSignInThrottle({ store })
  const h = createAuthHandlers({ env: opts.env ?? env, getAuth, loadFactors, isStrongSession, endSession, touchSession, signInThrottle })
  return { h, libHandler, getSession, getAuth, loadFactors, isStrongSession, endSession, touchSession, signInThrottle, store }
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

  it('SES-04: a session idle for over 30 minutes is ended and refused, and the library is not called', async () => {
    const s = setup({ session: true, factors: withPasskey, updatedMsAgo: 31 * 60_000 })
    const res = await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(res.status).toBe(401)
    expect(await res.json()).toMatchObject({ redirectTo: '/portal/sign-in' })
    expect(s.endSession).toHaveBeenCalledWith('s1')
    expect(s.libHandler).not.toHaveBeenCalled()
  })

  it('SES-04: a session older than 12 hours is ended however recently it was used', async () => {
    const s = setup({ session: true, factors: withPasskey, createdMsAgo: 12 * 3_600_000 + 60_000, updatedMsAgo: 1_000 })
    expect((await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))).status).toBe(401)
    expect(s.endSession).toHaveBeenCalledWith('s1')
  })

  it('SES-04: an expired session is refused on every path that needs a session, including get-session and sign-out', async () => {
    for (const p of ['get-session', 'sign-out', 'two-factor/enable']) {
      const s = setup({ session: true, factors: noFactor, updatedMsAgo: 31 * 60_000 })
      expect((await s.h.POST(req(`${AUTH_BASE}/${p}`, 'POST'))).status, p).toBe(401)
      expect(s.libHandler).not.toHaveBeenCalled()
    }
  })

  it('SES-04: the session is read without refresh, so our own lookup cannot reset the idle clock', async () => {
    const s = setup({ session: true, factors: withPasskey })
    await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))
    expect(s.getSession).toHaveBeenCalledWith(expect.objectContaining({ query: { disableRefresh: true } }))
  })

  it('SES-04: an active session is touched and the request goes through', async () => {
    const s = setup({ session: true, factors: withPasskey, updatedMsAgo: 5 * 60_000 })
    expect((await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))).status).toBe(200)
    expect(s.touchSession).toHaveBeenCalledWith('s1', expect.any(Number))
  })

  it('SES-04: a failing touch does not fail the request', async () => {
    const s = setup({ session: true, factors: withPasskey, updatedMsAgo: 5 * 60_000 })
    s.touchSession.mockRejectedValueOnce(new Error('db down'))
    expect((await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))).status).toBe(200)
  })

  it('SES-04: a failing endSession still refuses the request', async () => {
    const s = setup({ session: true, factors: withPasskey, updatedMsAgo: 31 * 60_000 })
    s.endSession.mockRejectedValueOnce(new Error('db down'))
    expect((await s.h.GET(req(`${AUTH_BASE}/passkey/list-user-passkeys`))).status).toBe(401)
  })

  it('SES-04: public paths do not read the session at all', async () => {
    const s = setup({ session: true, updatedMsAgo: 31 * 60_000 })
    expect((await s.h.POST(req(`${AUTH_BASE}/sign-in/email`, 'POST'))).status).toBe(200)
    expect(s.endSession).not.toHaveBeenCalled()
  })

  // --- FP-5: progressive delay on password sign-in (ABU-01) ---
  const signIn = (email: string, ip = '203.0.113.7') =>
    new Request(`https://portal.uswat.edu.pk${AUTH_BASE}/sign-in/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': ip },
      body: JSON.stringify({ email, password: 'whatever password' }),
    })

  it('ABU-01: counts library 401s, then answers 429 with Retry-After and does not call the library during the wait', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 4; i++) expect((await s.h.POST(signIn('a@example.test'))).status).toBe(401)
    const calls = s.libHandler.mock.calls.length
    const res = await s.h.POST(signIn('a@example.test'))
    expect(res.status).toBe(429)
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThanOrEqual(1)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(s.libHandler.mock.calls.length).toBe(calls)
  })

  it('ABU-01: a right password during the wait is refused too, and a success afterwards clears the account', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 4; i++) await s.h.POST(signIn('a@example.test'))
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 200 }))
    expect((await s.h.POST(signIn('a@example.test'))).status).toBe(429)
    await new Promise((r) => setTimeout(r, 1_050))
    expect((await s.h.POST(signIn('a@example.test'))).status).toBe(200)
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 3; i++) expect((await s.h.POST(signIn('a@example.test'))).status).toBe(401)
  })

  it('ABU-01: the 429 is the same for an unknown email as for a real one', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 4; i++) await s.h.POST(signIn('nobody@example.test'))
    const res = await s.h.POST(signIn('nobody@example.test'))
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'too many attempts, wait and try again' })
  })

  it('ABU-01: other statuses from the library (429 from its own limiter, 400, 500) are not counted as failed passwords', async () => {
    const s = setup()
    for (const status of [429, 400, 500]) {
      s.libHandler.mockImplementation(async () => new Response('{}', { status }))
      for (let i = 0; i < 6; i++) await s.h.POST(signIn(`s${status}@example.test`))
      s.libHandler.mockImplementation(async () => new Response('{}', { status: 200 }))
      expect((await s.h.POST(signIn(`s${status}@example.test`))).status, String(status)).toBe(200)
    }
  })

  it('ABU-01: only password sign-in is throttled: passkey sign-in and recovery paths are untouched', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 8; i++) await s.h.POST(signIn('a@example.test'))
    for (const p of ['/passkey/generate-authenticate-options', '/passkey/verify-authentication', '/recovery/sign-in']) {
      const res = await s.h.POST(new Request(`https://portal.uswat.edu.pk${AUTH_BASE}${p}`, { method: 'POST', headers: { 'x-real-ip': '203.0.113.7' }, body: '{}' }))
      expect(res.status, p).not.toBe(429)
    }
  })

  it('ABU-01: a body that is not JSON is passed to the library and counts only against the address', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    const res = await s.h.POST(new Request(`https://portal.uswat.edu.pk${AUTH_BASE}/sign-in/email`, { method: 'POST', headers: { 'x-real-ip': '198.51.100.4' }, body: 'not json' }))
    expect(res.status).toBe(401)
    expect(s.libHandler).toHaveBeenCalledTimes(1)
  })

  it('ABU-01: the library still receives the original body (the request was cloned, not consumed)', async () => {
    const s = setup()
    let seen = ''
    s.libHandler.mockImplementation(async (r: Request) => {
      seen = await r.text()
      return new Response('{}', { status: 200 })
    })
    await s.h.POST(signIn('a@example.test'))
    expect(JSON.parse(seen)).toMatchObject({ email: 'a@example.test' })
  })

  it('ABU-01: when the counters cannot be read the request is refused, not waved through', async () => {
    const s = setup()
    vi.spyOn(s.store, 'get').mockRejectedValue(new Error('db down'))
    expect((await s.h.POST(signIn('a@example.test'))).status).toBe(503)
    expect(s.libHandler).not.toHaveBeenCalled()
  })

  it('ABU-01: when recording a failure fails, the sign-in answer is still the library answer', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    vi.spyOn(s.store, 'recordFailure').mockRejectedValue(new Error('db down'))
    expect((await s.h.POST(signIn('a@example.test'))).status).toBe(401)
  })

  const recover = (email: string, ip = '203.0.113.7') =>
    new Request(`https://portal.uswat.edu.pk${AUTH_BASE}/recovery/sign-in`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': ip },
      body: JSON.stringify({ email, password: 'whatever password', code: 'AAAAA-AAAAA' }),
    })

  it('ABU-01: failed recovery sign-ins (wrong password or wrong code) count against the account and the address too', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 4; i++) expect((await s.h.POST(recover('a@example.test'))).status).toBe(401)
    const calls = s.libHandler.mock.calls.length
    const res = await s.h.POST(recover('a@example.test'))
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBeTruthy()
    expect(s.libHandler.mock.calls.length).toBe(calls)
  })

  it('ABU-01: password sign-in and recovery sign-in are counted apart: an attack on one never delays the owner on the other', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 6; i++) await s.h.POST(signIn('a@example.test'))
    expect((await s.h.POST(signIn('a@example.test'))).status).toBe(429)
    expect((await s.h.POST(recover('a@example.test'))).status).toBe(401)
  })

  it('ABU-01: a successful recovery sign-in clears the recovery counter', async () => {
    const s = setup()
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 3; i++) await s.h.POST(recover('a@example.test'))
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 200 }))
    expect((await s.h.POST(recover('a@example.test'))).status).toBe(200)
    s.libHandler.mockImplementation(async () => new Response('{}', { status: 401 }))
    for (let i = 0; i < 3; i++) expect((await s.h.POST(recover('a@example.test'))).status).toBe(401)
  })
})
