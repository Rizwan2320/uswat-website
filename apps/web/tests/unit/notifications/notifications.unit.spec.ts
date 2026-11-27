import { describe, expect, it, vi } from 'vitest'

import { NOTICE_EVENT_TYPES } from '@/modules/identity/securityEvents'
import { COPY } from '@/modules/portal/copy'
import { buildLines, isDue } from '@/modules/portal/notifications/digest'
import { ALL_KINDS, DIGEST_KINDS, HOUR, PERIOD_MS, SECURITY_KINDS, isCadence, isNoticeKind, isSecurityKind } from '@/modules/portal/notifications/kinds'
import { validatePref } from '@/modules/portal/notifications/rules'
import { createNotificationService, runDigests } from '@/modules/portal/notifications/service'
import type { NotificationStore } from '@/modules/portal/notifications/types'

describe('kinds', () => {
  it('security and digest kinds are disjoint and every one is known', () => {
    expect(SECURITY_KINDS.filter((k) => (DIGEST_KINDS as readonly string[]).includes(k))).toEqual([])
    for (const k of ALL_KINDS) expect(isNoticeKind(k)).toBe(true)
    for (const v of ['', 'x', null, 5, 'passkey_added', 'Passkey-added']) expect(isNoticeKind(v)).toBe(false)
    expect(isSecurityKind('delegation-given')).toBe(true)
    expect(isSecurityKind('works-found')).toBe(false)
  })
  it('every security event that writes a notice is a security notice kind', () => {
    for (const t of NOTICE_EVENT_TYPES) expect(isSecurityKind(t), t).toBe(true)
    expect(NOTICE_EVENT_TYPES).not.toContain('sign-in-failed')
    expect(NOTICE_EVENT_TYPES).not.toContain('sign-in-password')
  })
  it('only three cadences, and the periods are a day and a week', () => {
    for (const c of ['daily', 'weekly', 'off']) expect(isCadence(c)).toBe(true)
    for (const c of ['hourly', '', null, 'Daily', undefined]) expect(isCadence(c)).toBe(false)
    expect(PERIOD_MS).toEqual({ daily: 24 * HOUR, weekly: 168 * HOUR })
  })
  it('every kind has a plain-words line, with no developer names', () => {
    for (const k of ALL_KINDS) {
      for (const n of [1, 3]) {
        const t = COPY.notifications.lineLabel(k, n)
        expect(t, k).not.toBe('An update.')
        expect(t, k).not.toMatch(/[a-z]-[a-z]|undefined|\[object/)
      }
    }
  })
})

describe('isDue', () => {
  const D = PERIOD_MS.daily, W = PERIOD_MS.weekly
  it('is never due for off, for nothing waiting, or an unknown cadence', () => {
    expect(isDue('off', null, 5, 1e12)).toBe(false)
    expect(isDue('daily', null, 0, 1e12)).toBe(false)
    expect(isDue('hourly' as never, null, 5, 1e12)).toBe(false)
  })
  it('is due at once with no earlier digest, and at exactly one period after the last', () => {
    expect(isDue('daily', null, 1, 100)).toBe(true)
    expect(isDue('daily', 1000, 1, 1000 + D - 1)).toBe(false)
    expect(isDue('daily', 1000, 1, 1000 + D)).toBe(true)
    expect(isDue('weekly', 1000, 1, 1000 + D)).toBe(false)
    expect(isDue('weekly', 1000, 1, 1000 + W - 1)).toBe(false)
    expect(isDue('weekly', 1000, 1, 1000 + W)).toBe(true)
  })
})

describe('buildLines', () => {
  it('groups by kind, sums counts, keeps first and last time, and uses the fixed kind order', () => {
    const lines = buildLines([
      { kind: 'works-found', n: 4, at: 50 },
      { kind: 'profile-approved', n: 1, at: 30 },
      { kind: 'works-found', n: 2, at: 10 },
      { kind: 'works-found', n: 1, at: 90 },
    ])
    expect(lines).toEqual([
      { kind: 'profile-approved', count: 1, firstAt: 30, lastAt: 30 },
      { kind: 'works-found', count: 7, firstAt: 10, lastAt: 90 },
    ])
    expect(buildLines([])).toEqual([])
  })
})

describe('validatePref', () => {
  it('accepts exactly { cadence } with a known value', () => {
    for (const c of ['daily', 'weekly', 'off']) expect(validatePref({ cadence: c })).toEqual({ ok: true, value: c })
  })
  it('refuses anything else whole', () => {
    for (const v of [null, undefined, 'daily', [], { cadence: 'hourly' }, { cadence: '' }, {}, { cadence: 'daily', userId: 'x' }, { cadence: 'daily', security: false }]) expect(validatePref(v).ok, JSON.stringify(v)).toBe(false)
  })
})

const store = (over: Partial<NotificationStore> = {}): NotificationStore => ({
  getCadence: vi.fn(async () => 'daily' as const),
  setCadence: vi.fn(async () => {}),
  waiting: vi.fn(async () => []),
  log: vi.fn(async () => []),
  withWaiting: vi.fn(async () => []),
  buildDigest: vi.fn(async () => ({ built: false as const, reason: 'nothing' as const })),
  ...over,
})

describe('notification service', () => {
  it('needs a session and never reaches the store without one', async () => {
    const s = store()
    const svc = createNotificationService({ store: s, getAccount: async () => null })
    expect(await svc.overview()).toEqual({ ok: false, error: 'session' })
    expect(await svc.setCadence({ cadence: 'weekly' })).toEqual({ ok: false, error: 'session' })
    for (const f of Object.values(s)) expect(f).not.toHaveBeenCalled()
  })
  it('validates before writing, and writes for the session account only', async () => {
    const s = store()
    const svc = createNotificationService({ store: s, getAccount: async () => ({ id: 'me' }), now: () => 7 })
    expect(await svc.setCadence({ cadence: 'hourly' })).toMatchObject({ ok: false, error: 'invalid' })
    expect(await svc.setCadence({ cadence: 'weekly', userId: 'other' })).toMatchObject({ ok: false, error: 'invalid' })
    expect(s.setCadence).not.toHaveBeenCalled()
    expect(await svc.setCadence({ cadence: 'weekly' })).toEqual({ ok: true })
    expect(s.setCadence).toHaveBeenCalledWith('me', 'weekly', 7)
  })
  it('lists the log for the session account, thirty at most', async () => {
    const s = store()
    await createNotificationService({ store: s, getAccount: async () => ({ id: 'me' }) }).overview()
    expect(s.log).toHaveBeenCalledWith('me', 30)
    expect(s.waiting).toHaveBeenCalledWith('me')
  })
})

describe('runDigests', () => {
  it('builds one digest per person with waiting items and counts the ones built', async () => {
    const s = store({ withWaiting: vi.fn(async () => ['a', 'b', 'c']), buildDigest: vi.fn(async (id: string) => (id === 'b' ? { built: false as const, reason: 'not-due' as const } : { built: true as const, lines: [] })) })
    expect(await runDigests(s, 5)).toEqual({ people: 3, built: 2, skipped: 1 })
    expect(s.buildDigest).toHaveBeenCalledTimes(3)
  })
  it('does nothing in a dry run', async () => {
    const s = store({ withWaiting: vi.fn(async () => ['a', 'b']) })
    expect(await runDigests(s, 5, { dryRun: true })).toEqual({ people: 2, built: 0, skipped: 2 })
    expect(s.buildDigest).not.toHaveBeenCalled()
  })
})
