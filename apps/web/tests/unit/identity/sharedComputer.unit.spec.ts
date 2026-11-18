import { describe, expect, it } from 'vitest'

import { sharedRequested } from '@/modules/identity/sharedComputer'
import { ABSOLUTE_MS, IDLE_MS, SHARED_IDLE_MS, evaluateSession } from '@/modules/identity/sessionLifetime'
import { readSessionState, type SessionDeps } from '@/modules/identity/sessionState'

const NOW = 1_800_000_000_000
const at = (agoMs: number) => NOW - agoMs

describe('SES-04: a shared-computer session is idle-limited at 15 minutes, a normal one at 30', () => {
  it('constants are what the spec says', () => {
    expect(SHARED_IDLE_MS).toBe(15 * 60_000)
    expect(IDLE_MS).toBe(30 * 60_000)
  })
  it.each([
    [SHARED_IDLE_MS, true, 'ok'],
    [SHARED_IDLE_MS + 1, true, 'idle'],
    [SHARED_IDLE_MS + 1, false, 'ok'],
    [IDLE_MS, false, 'ok'],
    [IDLE_MS + 1, false, 'idle'],
    [IDLE_MS + 1, true, 'idle'],
  ])('idle for %i ms, shared=%s -> %s', (idle, shared, verdict) => {
    expect(evaluateSession({ createdAt: at(60 * 60_000), updatedAt: at(idle), now: NOW, shared })).toBe(verdict)
  })
  it('the absolute limit is the same for both', () => {
    for (const shared of [true, false]) {
      expect(evaluateSession({ createdAt: at(ABSOLUTE_MS + 1), updatedAt: at(1000), now: NOW, shared })).toBe('absolute')
      expect(evaluateSession({ createdAt: at(ABSOLUTE_MS), updatedAt: at(1000), now: NOW, shared })).toBe('ok')
    }
  })
  it('an undated session is still invalid when shared', () => {
    expect(evaluateSession({ createdAt: null, updatedAt: at(1), now: NOW, shared: true })).toBe('invalid')
  })
})

describe('the shared-computer cookie', () => {
  it.each([
    ['__Host-portal.shared=1', true],
    ['a=b; __Host-portal.shared=1; c=d', true],
    ['__Host-portal.shared=0', false],
    ['__Host-portal.shared=', false],
    ['portal.shared=1', false],
    ['x__Host-portal.shared=1', false],
    ['__Host-portal.shared=11', false],
    ['', false],
    [null, false],
    [undefined, false],
  ])('%j -> %s', (header, ok) => expect(sharedRequested(header)).toBe(ok))
})

describe('readSessionState uses the shared limit, and an unreadable flag counts as shared', () => {
  const lookup = (updatedAgoMs: number) => ({
    session: { id: 's1', createdAt: new Date(at(3_600_000)), updatedAt: new Date(at(updatedAgoMs)) },
    user: { id: 'u1', email: 'a@example.test' },
  })
  const make = (updatedAgoMs: number, shared: SessionDeps['isSharedSession']) => {
    const ended: string[] = []
    const deps = {
      getAuth: () => ({ api: { getSession: async () => lookup(updatedAgoMs) } }),
      loadFactors: async () => ({ passkeys: 1, totpVerified: false, recoveryCodesRemaining: 10 }),
      isStrongSession: async () => true,
      isSharedSession: shared,
      endSession: async (id: string) => { ended.push(id) },
      touchSession: async () => {},
    } as unknown as SessionDeps
    return { deps, ended }
  }
  const run = (d: SessionDeps) => readSessionState(d, new Headers({ cookie: 'x=y' }), 'portal', NOW)

  it('16 minutes idle: ended when shared, kept when not', async () => {
    const a = make(16 * 60_000, async () => true)
    expect((await run(a.deps)).kind).toBe('expired')
    expect(a.ended).toEqual(['s1'])
    const b = make(16 * 60_000, async () => false)
    expect((await run(b.deps)).kind).toBe('active')
    expect(b.ended).toEqual([])
  })
  it('the flag lookup failing uses the stricter limit', async () => {
    const a = make(16 * 60_000, async () => { throw new Error('db down') })
    expect((await run(a.deps)).kind).toBe('expired')
    const b = make(5 * 60_000, async () => { throw new Error('db down') })
    expect((await run(b.deps)).kind).toBe('active')
  })
  it('callers that do not supply the lookup get the normal limit', async () => {
    expect((await run(make(16 * 60_000, undefined).deps)).kind).toBe('active')
  })
})
