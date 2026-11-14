import { describe, expect, it } from 'vitest'

import { STEP_UP_WINDOW_MS, decide, isFresh, needsStepUp, type FactorState } from '@/modules/identity/gate'

const NOW = 1_800_000_000_000
const passkey: FactorState = { passkeys: 1, totpVerified: false, recoveryCodesRemaining: 10 }
const none: FactorState = { passkeys: 0, totpVerified: false, recoveryCodesRemaining: 0 }
const totp: FactorState = { passkeys: 0, totpVerified: true, recoveryCodesRemaining: 10 }

const CHANGES = [
  '/portal-api/auth/passkey/generate-register-options',
  '/portal-api/auth/passkey/verify-registration',
  '/portal-api/auth/passkey/delete-passkey',
  '/portal-api/auth/passkey/update-passkey',
  '/portal-api/auth/two-factor/enable',
  '/portal-api/auth/two-factor/disable',
  '/portal-api/auth/recovery/issue',
]

const strong = (pathname: string, factors: FactorState | null, verifiedAt: number | null | undefined) =>
  decide({ hasSession: true, sessionStrong: true, factors, pathname, verifiedAt, now: NOW })

describe('isFresh: ten minutes, fail closed', () => {
  it.each([
    [NOW - 1_000, true],
    [NOW - STEP_UP_WINDOW_MS, true],
    [NOW - STEP_UP_WINDOW_MS - 1, false],
    [NOW + 30_000, true], // small clock skew
    [NOW + 120_000, false], // a timestamp from the future is not trusted
    [null, false],
    [undefined, false],
    [Number.NaN, false],
  ])('%s -> %s', (v, ok) => expect(isFresh(v as number | null | undefined, NOW)).toBe(ok))
})

describe('AUTH-09: changing how someone signs in needs a recent second factor', () => {
  it('lists exactly the paths that change authenticators or recovery codes', () => {
    for (const p of CHANGES) expect(needsStepUp(p), p).toBe(true)
    for (const p of ['/portal-api/auth/get-session', '/portal-api/auth/list-sessions', '/portal-api/auth/passkey/list-user-passkeys', '/portal/security', '/portal-api/auth/revoke-session'])
      expect(needsStepUp(p), p).toBe(false)
  })

  it.each(CHANGES)('%s: refused to a strong session whose proof is stale, with a pointer to the security page', (p) => {
    const d = strong(p, passkey, NOW - STEP_UP_WINDOW_MS - 1)
    expect(d).toMatchObject({ allow: false, status: 403, redirectTo: '/portal/security', reason: 'step-up required' })
  })

  it.each(CHANGES)('%s: allowed when the proof is fresh', (p) => {
    expect(strong(p, passkey, NOW - 60_000)).toEqual({ allow: true })
  })

  it.each(CHANGES)('%s: unknown freshness, and a caller that forgets the clock, are both refused', (p) => {
    expect(strong(p, passkey, null).allow).toBe(false)
    expect(strong(p, passkey, undefined).allow).toBe(false)
    expect(decide({ hasSession: true, sessionStrong: true, factors: passkey, pathname: p, verifiedAt: NOW - 1_000 }).allow).toBe(false)
  })

  it('works the same for an account whose only factor is the authenticator app', () => {
    expect(strong('/portal-api/auth/recovery/issue', totp, NOW - STEP_UP_WINDOW_MS - 1).allow).toBe(false)
    expect(strong('/portal-api/auth/recovery/issue', totp, NOW - 5_000).allow).toBe(true)
  })

  it('does not ask the first factor to step up: a password session on an account with no factor can still enrol', () => {
    const weak = decide({ hasSession: true, sessionStrong: false, factors: none, pathname: '/portal-api/auth/passkey/verify-registration', verifiedAt: null, now: NOW })
    expect(weak).toEqual({ allow: true })
    expect(decide({ hasSession: true, sessionStrong: false, factors: none, pathname: '/portal-api/auth/two-factor/enable', verifiedAt: null, now: NOW })).toEqual({ allow: true })
  })

  it('a password-only session is still refused as before (step-up never loosens the older rules)', () => {
    const d = decide({ hasSession: true, sessionStrong: false, factors: passkey, pathname: '/portal-api/auth/passkey/delete-passkey', verifiedAt: NOW, now: NOW })
    expect(d.allow).toBe(false)
  })

  it('unreadable factor state never opens a step-up path', () => {
    expect(strong('/portal-api/auth/passkey/delete-passkey', null, NOW).allow).toBe(false)
  })

  it('other protected paths do not need a fresh proof', () => {
    expect(strong('/portal-api/auth/list-sessions', passkey, null).allow).toBe(true)
    expect(strong('/portal-api/auth/passkey/list-user-passkeys', passkey, NOW - 3 * STEP_UP_WINDOW_MS).allow).toBe(true)
  })
})
