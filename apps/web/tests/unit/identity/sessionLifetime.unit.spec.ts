import { describe, expect, it } from 'vitest'

import { ABSOLUTE_MS, IDLE_MS, TOUCH_INTERVAL_MS, evaluateSession, shouldTouch } from '@/modules/identity/sessionLifetime'

const NOW = 1_800_000_000_000
const at = (msAgo: number) => new Date(NOW - msAgo)

describe('evaluateSession (SES-04)', () => {
  it('is 30 minutes idle and 12 hours absolute', () => {
    expect(IDLE_MS).toBe(30 * 60_000)
    expect(ABSOLUTE_MS).toBe(12 * 60 * 60_000)
  })

  it('accepts an active session', () => {
    expect(evaluateSession({ createdAt: at(60_000), updatedAt: at(1_000), now: NOW })).toBe('ok')
  })

  it('ends a session idle for more than 30 minutes, and keeps one at exactly 30', () => {
    expect(evaluateSession({ createdAt: at(3_600_000), updatedAt: at(IDLE_MS), now: NOW })).toBe('ok')
    expect(evaluateSession({ createdAt: at(3_600_000), updatedAt: at(IDLE_MS + 1), now: NOW })).toBe('idle')
  })

  it('ends a session older than 12 hours however active it is', () => {
    expect(evaluateSession({ createdAt: at(ABSOLUTE_MS), updatedAt: at(1_000), now: NOW })).toBe('ok')
    expect(evaluateSession({ createdAt: at(ABSOLUTE_MS + 1), updatedAt: at(1_000), now: NOW })).toBe('absolute')
  })

  it('fails closed on missing or invalid timestamps', () => {
    expect(evaluateSession({ createdAt: undefined, updatedAt: at(1), now: NOW })).toBe('invalid')
    expect(evaluateSession({ createdAt: at(1), updatedAt: undefined, now: NOW })).toBe('invalid')
    expect(evaluateSession({ createdAt: new Date('nope'), updatedAt: at(1), now: NOW })).toBe('invalid')
    expect(evaluateSession({ createdAt: 'x' as unknown as Date, updatedAt: at(1), now: NOW })).toBe('invalid')
  })

  it('accepts ISO strings and numbers as the library may return them', () => {
    expect(evaluateSession({ createdAt: at(1000).toISOString(), updatedAt: at(1000).getTime(), now: NOW })).toBe('ok')
  })

  it('treats a timestamp in the future (clock skew) as active, not as an error', () => {
    expect(evaluateSession({ createdAt: at(60_000), updatedAt: new Date(NOW + 5_000), now: NOW })).toBe('ok')
  })

  it('reports absolute before idle when both apply', () => {
    expect(evaluateSession({ createdAt: at(ABSOLUTE_MS + 1), updatedAt: at(IDLE_MS + 1), now: NOW })).toBe('absolute')
  })
})

describe('shouldTouch', () => {
  it('writes at most once a minute', () => {
    expect(TOUCH_INTERVAL_MS).toBe(60_000)
    expect(shouldTouch(at(TOUCH_INTERVAL_MS - 1), NOW)).toBe(false)
    expect(shouldTouch(at(TOUCH_INTERVAL_MS), NOW)).toBe(true)
  })
})
