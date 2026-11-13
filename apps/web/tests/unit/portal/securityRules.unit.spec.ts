import { describe, expect, it } from 'vitest'

import { canDeletePasskey, describeDevice } from '@/modules/portal/securityRules'

describe('canDeletePasskey: the account must keep a second factor', () => {
  it.each([
    [{ passkeys: 1, totpVerified: false }, false],
    [{ passkeys: 0, totpVerified: false }, false],
    [{ passkeys: 1, totpVerified: true }, true],
    [{ passkeys: 2, totpVerified: false }, true],
    [{ passkeys: 3, totpVerified: true }, true],
  ])('%j -> %s', (f, ok) => expect(canDeletePasskey(f)).toBe(ok))
})

describe('describeDevice', () => {
  it('names browser and system in plain words', () => {
    expect(describeDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36')).toBe('Chrome on Windows')
    expect(describeDevice('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36 Edg/120')).toBe('Edge on Windows')
    expect(describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Version/17 Safari/604')).toBe('Safari on iOS')
    expect(describeDevice('Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile Safari/537')).toBe('Chrome on Android')
  })
  it('never fails on missing or odd input and never echoes it back', () => {
    expect(describeDevice(null)).toBe('Unknown device')
    expect(describeDevice('<script>alert(1)</script>')).toBe('Unknown device')
  })
})
