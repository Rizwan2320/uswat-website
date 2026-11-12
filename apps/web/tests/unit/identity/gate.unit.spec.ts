import { describe, expect, it } from 'vitest'

import {
  AUTH_BASE,
  classifyPath,
  decide,
  hasSecondFactor,
  type FactorState,
} from '@/modules/identity/gate'

const none: FactorState = { passkeys: 0, totpVerified: false, recoveryCodesRemaining: 0 }
const passkey: FactorState = { passkeys: 1, totpVerified: false, recoveryCodesRemaining: 10 }
const totp: FactorState = { passkeys: 0, totpVerified: true, recoveryCodesRemaining: 10 }
const recoveryOnly: FactorState = { passkeys: 0, totpVerified: false, recoveryCodesRemaining: 10 }

describe('hasSecondFactor (AUTH-01)', () => {
  it('needs a passkey or a verified TOTP secret', () => {
    expect(hasSecondFactor(none)).toBe(false)
    expect(hasSecondFactor(passkey)).toBe(true)
    expect(hasSecondFactor(totp)).toBe(true)
  })

  it('does not count recovery codes on their own', () => {
    expect(hasSecondFactor(recoveryOnly)).toBe(false)
  })

  it('does not count a TOTP secret that was never verified', () => {
    expect(hasSecondFactor({ passkeys: 0, totpVerified: false, recoveryCodesRemaining: 0 })).toBe(false)
  })
})

describe('classifyPath', () => {
  it.each([
    ['/portal/sign-in', 'public'],
    [`${AUTH_BASE}/sign-in/email`, 'public'],
    [`${AUTH_BASE}/passkey/generate-authenticate-options`, 'public'],
    [`${AUTH_BASE}/passkey/verify-authentication`, 'public'],
    [`${AUTH_BASE}/two-factor/verify-totp`, 'public'],
    ['/portal/enrol', 'enrolment'],
    [`${AUTH_BASE}/passkey/generate-register-options`, 'enrolment'],
    [`${AUTH_BASE}/passkey/verify-registration`, 'enrolment'],
    [`${AUTH_BASE}/two-factor/enable`, 'enrolment'],
    [`${AUTH_BASE}/get-session`, 'enrolment'],
    [`${AUTH_BASE}/sign-out`, 'signout'],
    ['/portal', 'portal'],
    ['/portal/profile', 'portal'],
    [`${AUTH_BASE}/passkey/delete-passkey`, 'portal'],
    [`${AUTH_BASE}/two-factor/disable`, 'portal'],
    [`${AUTH_BASE}/something-new-in-a-later-release`, 'portal'],
    [`${AUTH_BASE}/two-factor/send-otp`, 'forbidden'],
    [`${AUTH_BASE}/two-factor/verify-otp`, 'forbidden'],
    [`${AUTH_BASE}/sign-up/email`, 'forbidden'],
    // The library's own backup codes are stored reversibly; ours replace them (AUTH-05).
    [`${AUTH_BASE}/two-factor/verify-backup-code`, 'forbidden'],
    [`${AUTH_BASE}/two-factor/generate-backup-codes`, 'forbidden'],
  ])('%s is %s', (path, expected) => {
    expect(classifyPath(path)).toBe(expected)
  })

  it('refuses any path that is not plain: encoded, traversal, doubled slash, backslash, NUL', () => {
    for (const p of [
      '/portal/sign-in/../profile',
      `${AUTH_BASE}//sign-in/email`,
      '/portal/sign-in%2f..%2fprofile',
      `${AUTH_BASE}/sign-in/email%00`,
      `${AUTH_BASE}\\sign-in\\email`,
      `${AUTH_BASE}/sign-in/email\0`,
    ]) {
      expect(classifyPath(p), p).toBe('forbidden')
    }
  })

  const FORBIDDEN_ENDPOINTS = [
    'two-factor/send-otp',
    'two-factor/verify-otp',
    'sign-up/email',
    'two-factor/verify-backup-code',
    'two-factor/generate-backup-codes',
  ]

  it.each(FORBIDDEN_ENDPOINTS)('%s stays forbidden in every spelling (encoded, upper case, mixed case, trailing slash)', (ep) => {
    const plain = `${AUTH_BASE}/${ep}`
    const spellings = [
      plain,
      `${plain}/`,
      plain.toUpperCase(),
      plain.replace(/(^|[-/])([a-z])/g, (_m, a: string, b: string) => a + b.toUpperCase()),
      plain.replace('-', '%2D'),
      plain.replace('/two-factor/', '/two-factor%2F'),
      plain.replace('portal-api', 'Portal-Api'),
      `${AUTH_BASE}/./${ep}`,
      `${AUTH_BASE}//${ep}`,
    ]
    for (const sp of spellings) expect(classifyPath(sp), sp).toBe('forbidden')
  })

  it('does not widen an allow-list entry by case: a differently cased public path needs a session and a factor', () => {
    expect(classifyPath('/Portal/Sign-In')).toBe('portal')
    expect(classifyPath(`${AUTH_BASE}/Sign-In/Email`)).toBe('portal')
    expect(classifyPath(`${AUTH_BASE}/GET-SESSION`)).toBe('portal')
  })

  it('does not let a longer name ride on a public prefix', () => {
    expect(classifyPath('/portal/sign-in-admin')).toBe('portal')
    expect(classifyPath(`${AUTH_BASE}/sign-in/email-and-more`)).toBe('portal')
  })
})

describe('decide (FPR-01: no password-only path to a portal page)', () => {
  const ok = { allow: true }

  it('lets anyone reach public routes', () => {
    expect(decide({ hasSession: false, factors: null, pathname: '/portal/sign-in' })).toEqual(ok)
    expect(decide({ hasSession: true, factors: none, pathname: '/portal/sign-in' })).toEqual(ok)
  })

  it('refuses everything else without a session', () => {
    for (const p of ['/portal', '/portal/profile', `${AUTH_BASE}/passkey/list-user-passkeys`, `${AUTH_BASE}/sign-out`]) {
      expect(decide({ hasSession: false, factors: null, pathname: p })).toMatchObject({ allow: false, status: 401 })
    }
  })

  it('confines a session with no second factor to enrolment and sign-out', () => {
    expect(decide({ hasSession: true, factors: none, pathname: '/portal/enrol' })).toEqual(ok)
    expect(decide({ hasSession: true, factors: none, pathname: `${AUTH_BASE}/two-factor/enable` })).toEqual(ok)
    expect(decide({ hasSession: true, factors: none, pathname: `${AUTH_BASE}/sign-out` })).toEqual(ok)
    for (const p of ['/portal', '/portal/profile', `${AUTH_BASE}/passkey/list-user-passkeys`, `${AUTH_BASE}/passkey/delete-passkey`]) {
      expect(decide({ hasSession: true, factors: none, pathname: p })).toMatchObject({
        allow: false,
        status: 403,
        redirectTo: '/portal/enrol',
      })
    }
  })

  it('treats recovery codes alone as no second factor', () => {
    expect(decide({ hasSession: true, factors: recoveryOnly, pathname: '/portal/profile' })).toMatchObject({
      allow: false,
      status: 403,
    })
  })

  it('opens the portal once a passkey or verified TOTP exists', () => {
    for (const f of [passkey, totp]) {
      expect(decide({ hasSession: true, factors: f, pathname: '/portal/profile' })).toEqual(ok)
      expect(decide({ hasSession: true, factors: f, pathname: `${AUTH_BASE}/passkey/list-user-passkeys` })).toEqual(ok)
    }
  })

  it('refuses a session whose factor state could not be read (fail closed)', () => {
    expect(decide({ hasSession: true, factors: null, pathname: '/portal/profile' })).toMatchObject({
      allow: false,
      status: 403,
    })
  })

  it('has no self-registration: sign-up is not offered, signed in or not (Addendum C 5.6)', () => {
    for (const hasSession of [true, false]) {
      expect(decide({ hasSession, factors: passkey, pathname: `${AUTH_BASE}/sign-up/email` })).toMatchObject({
        allow: false,
        status: 404,
      })
    }
  })

  it('never allows the email or SMS one-time-code endpoints, for anyone', () => {
    for (const f of [null, none, passkey, totp]) {
      for (const hasSession of [true, false]) {
        expect(
          decide({ hasSession, factors: f, pathname: `${AUTH_BASE}/two-factor/send-otp` }),
        ).toMatchObject({ allow: false, status: 404 })
        expect(
          decide({ hasSession, factors: f, pathname: `${AUTH_BASE}/two-factor/verify-otp` }),
        ).toMatchObject({ allow: false, status: 404 })
      }
    }
  })

  it('is deterministic over every combination (table check: no state allows a portal path without a second factor)', () => {
    const states: (FactorState | null)[] = [null, none, recoveryOnly, passkey, totp]
    for (const f of states) {
      const d = decide({ hasSession: true, factors: f, pathname: '/portal/profile' })
      expect(d.allow).toBe(f !== null && hasSecondFactor(f))
    }
  })
})
