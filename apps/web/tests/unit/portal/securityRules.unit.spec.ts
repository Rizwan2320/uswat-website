import { describe, expect, it } from 'vitest'

import { readFileSync } from 'node:fs'

import { EVENT_TYPES } from '@/modules/identity/securityEvents'
import { COPY } from '@/modules/portal/copy'
import { canDeletePasskey, describeDevice, describeEvent, networkLabel, sessionNetwork } from '@/modules/portal/securityRules'

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

describe('describeEvent', () => {
  it('has plain wording for every event type the log can hold', () => {
    for (const t of EVENT_TYPES) {
      const d = describeEvent(t, 'success')
      expect(d.text, t).toBe(COPY.security.eventText[t])
      expect(d.text.length, t).toBeGreaterThan(5)
      expect(d.text, t).not.toBe(COPY.security.eventUnknown)
    }
    expect(Object.keys(COPY.security.eventText).sort()).toEqual([...EVENT_TYPES].sort())
  })
  it('marks a failure, and gives an unknown type a neutral line instead of failing', () => {
    expect(describeEvent('sign-in-failed', 'failure')).toEqual({ text: 'Wrong password tried', failed: true })
    expect(describeEvent('sign-in-passkey', 'success').failed).toBe(false)
    expect(describeEvent('from-a-later-release', 'success')).toEqual({ text: COPY.security.eventUnknown, failed: false })
    expect(describeEvent('', '').text).toBe(COPY.security.eventUnknown)
    expect(describeEvent('constructor', 'success').text).toBe(COPY.security.eventUnknown)
  })
})

describe('network labels show a prefix, never a full address', () => {
  it('turns a stored prefix into words', () => {
    expect(networkLabel('203.0.113.0/24')).toBe('203.0.113.x')
    expect(networkLabel('2001:db8:1::/48')).toBe('2001:db8:1::/48')
    expect(networkLabel(null)).toBe(COPY.security.networkUnknown)
    expect(networkLabel('')).toBe(COPY.security.networkUnknown)
  })
  it('turns a session address into the same label, and an unusable one into "unknown"', () => {
    expect(sessionNetwork('203.0.113.77')).toBe('203.0.113.x')
    expect(sessionNetwork('203.0.113.77')).not.toContain('77')
    expect(sessionNetwork('2001:db8:1:2:3:4:5:6')).toBe('2001:db8:1::/48')
    expect(sessionNetwork('unknown')).toBe(COPY.security.networkUnknown)
    expect(sessionNetwork(null)).toBe(COPY.security.networkUnknown)
  })
  it('the address helper has no Node import, so the browser bundle can include it', () => {
    expect(readFileSync('src/modules/identity/clientAddress.ts', 'utf8')).not.toMatch(/from ['"]node:|require\(/)
  })
})
