import { readFileSync } from 'node:fs'

import { describe, expect, it, vi } from 'vitest'

import { classifyPath, needsStepUp, AUTH_BASE } from '@/modules/identity/gate'
import { clientAddress, ipPrefix } from '@/modules/identity/clientAddress'
import { EVENT_TYPES, isEventType, recordEvent, signOutEverywhere, thisWasNotMe, type ActionDeps, type EventStore } from '@/modules/identity/securityEvents'

describe('ipPrefix: only a coarse network is ever kept', () => {
  it.each([
    ['203.0.113.77', '203.0.113.0/24'],
    [' 198.51.100.9 ', '198.51.100.0/24'],
    ['2001:db8:abcd:12::1', '2001:db8:abcd::/48'],
    ['2001:0DB8:00AB:0001:0000:0000:0000:0001', '2001:db8:ab::/48'],
    ['[2001:db8::5]', '2001:db8:0::/48'],
    ['fe80::1%eth0', 'fe80:0:0::/48'],
    ['::ffff:203.0.113.77', '203.0.113.0/24'],
    ['::ffff:cb00:714d', '203.0.113.0/24'],
    ['::1', '0:0:0::/48'],
  ])('%s -> %s', (input, expected) => {
    expect(ipPrefix(input)).toBe(expected)
  })
  it.each(['', 'unknown', 'not an ip', '999.1.1.1', '1.2.3', '1.2.3.4.5', '2001:db8::g', '1::2::3', null, undefined])('%s -> null', (input) => {
    expect(ipPrefix(input as string | null | undefined)).toBeNull()
  })
  it('never returns more than the prefix: the last byte or the last 80 bits are not in the result', () => {
    expect(ipPrefix('203.0.113.77')).not.toContain('77')
    expect(ipPrefix('2001:db8:1:2:3:4:5:6')).toBe('2001:db8:1::/48')
    expect(ipPrefix('2001:db8:1:2:3:4:5:6')).not.toMatch(/:2:|:3:|:4:|:5:|:6/)
  })
})

describe('clientAddress', () => {
  const h = (o: Record<string, string>) => new Headers(o)
  it('prefers x-real-ip, then the first x-forwarded-for entry, else unknown', () => {
    expect(clientAddress(h({ 'x-real-ip': ' 1.1.1.1 ', 'x-forwarded-for': '2.2.2.2' }))).toBe('1.1.1.1')
    expect(clientAddress(h({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }))).toBe('2.2.2.2')
    expect(clientAddress(h({}))).toBe('unknown')
    expect(clientAddress(h({ 'x-forwarded-for': ' ' }))).toBe('unknown')
    expect(clientAddress(null)).toBe('unknown')
    expect(clientAddress(undefined)).toBe('unknown')
  })
})

describe('event types', () => {
  it('are exactly the ones the database accepts (the SQL check and the list cannot drift)', () => {
    const sql = readFileSync('src/modules/identity/sql/0010_security_event.up.sql', 'utf8')
    const check = /"type" text not null check \("type" in \(([^)]*)\)\)/.exec(sql)![1]!
    const inSql = [...check.matchAll(/'([^']+)'/g)].map((m) => m[1])
    expect([...inSql].sort()).toEqual([...EVENT_TYPES].sort())
  })
  it('isEventType accepts the list and nothing else', () => {
    for (const t of EVENT_TYPES) expect(isEventType(t)).toBe(true)
    for (const bad of ['', 'sign-in', 'NOT-ME', 'not-me ', null, 3, undefined]) expect(isEventType(bad)).toBe(false)
  })
})

describe('the gate treats the two endpoints as portal paths and does not ask for step-up', () => {
  for (const p of ['/security/sign-out-everywhere', '/security/not-me']) {
    it(p, () => {
      expect(classifyPath(`${AUTH_BASE}${p}`)).toBe('portal')
      expect(needsStepUp(`${AUTH_BASE}${p}`)).toBe(false)
    })
  }
})

function deps(over: Partial<{ end: () => Promise<void>; raise: () => Promise<string>; record: () => Promise<void> }> = {}) {
  const calls: string[] = []
  const events: EventStore = {
    record: vi.fn(async (e) => { calls.push(`event:${e.type}:${e.outcome}`); await over.record?.() }),
    recent: vi.fn(async () => []),
  }
  const d: ActionDeps = {
    events,
    alerts: { raise: vi.fn(async () => { calls.push('alert'); return over.raise ? over.raise() : 'a1' }), listOpen: vi.fn(), acknowledge: vi.fn() },
    endAllSessions: vi.fn(async () => { calls.push('end'); await over.end?.() }),
    now: () => 1_000,
  }
  return { d, calls, events }
}

describe('This wasn’t me', () => {
  it('ends the sessions first, then raises the alert, then logs; says the admin was alerted', async () => {
    const { d, calls } = deps()
    expect(await thisWasNotMe('u1', '203.0.113.0/24', d)).toEqual({ alerted: true })
    expect(calls).toEqual(['end', 'alert', 'event:not-me:success'])
    expect(d.alerts.raise).toHaveBeenCalledWith('u1', '203.0.113.0/24', 1_000)
  })
  it('still ends the sessions when the alert cannot be written, and says it was not alerted', async () => {
    const { d, calls } = deps({ raise: async () => { throw new Error('db') } })
    expect(await thisWasNotMe('u1', null, d)).toEqual({ alerted: false })
    expect(calls).toEqual(['end', 'alert', 'event:not-me:success'])
  })
  it('still answers when the log cannot be written', async () => {
    const { d } = deps({ record: async () => { throw new Error('db') } })
    expect(await thisWasNotMe('u1', null, d)).toEqual({ alerted: true })
  })
  it('when the sessions cannot be ended it still tries the alert, logs a failure, and passes the error on', async () => {
    const { d, calls } = deps({ end: async () => { throw new Error('cannot end') } })
    await expect(thisWasNotMe('u1', null, d)).rejects.toThrow('cannot end')
    expect(calls).toEqual(['end', 'alert', 'event:not-me:failure'])
  })
})

describe('Sign out everywhere', () => {
  it('ends the sessions, then logs', async () => {
    const { d, calls } = deps()
    await signOutEverywhere('u1', null, d)
    expect(calls).toEqual(['end', 'event:sign-out-everywhere:success'])
  })
  it('does not log a success when the sessions could not be ended', async () => {
    const { d, calls } = deps({ end: async () => { throw new Error('cannot end') } })
    await expect(signOutEverywhere('u1', null, d)).rejects.toThrow('cannot end')
    expect(calls).toEqual(['end'])
  })
  it('a log failure does not undo or hide the sign-out', async () => {
    const { d } = deps({ record: async () => { throw new Error('db') } })
    await expect(signOutEverywhere('u1', null, d)).resolves.toBeUndefined()
  })
})

describe('recordEvent never throws', () => {
  it('returns false when the store fails and true when it works', async () => {
    const bad: EventStore = { record: async () => { throw new Error('x') }, recent: async () => [] }
    const good: EventStore = { record: async () => {}, recent: async () => [] }
    const e = { userId: 'u', type: 'sign-in-password' as const, outcome: 'success' as const, ipPrefix: null }
    expect(await recordEvent(bad, e)).toBe(false)
    expect(await recordEvent(good, e)).toBe(true)
  })
})
