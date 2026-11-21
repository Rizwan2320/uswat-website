import { describe, expect, it, vi } from 'vitest'

import { isGrantId, validateGrant } from '@/modules/portal/delegation/rules'
import { createDelegationService } from '@/modules/portal/delegation/service'
import type { DelegationStore } from '@/modules/portal/delegation/types'

const good = { delegateEmail: 'Colleague@Example.org ', sections: ['courses', 'profile'], days: 30 }

describe('validateGrant', () => {
  it('accepts an address, known sections and 1 to 90 whole days, normalised', () => {
    expect(validateGrant(good)).toEqual({ ok: true, value: { delegateEmail: 'colleague@example.org', sections: ['profile', 'courses'], days: 30 } })
    expect(validateGrant({ ...good, days: 1 }).ok).toBe(true)
    expect(validateGrant({ ...good, days: 90 }).ok).toBe(true)
  })
  it('refuses days outside 1..90, fractions and non-numbers', () => {
    for (const days of [0, -1, 91, 365, 1.5, NaN, Infinity, '30', null, undefined]) expect(validateGrant({ ...good, days }).ok, String(days)).toBe(false)
  })
  it('refuses unknown, empty, repeated and non-array sections, including security and delegation', () => {
    for (const sections of [[], ['security'], ['delegation'], ['cv'], ['profile', 'profile'], ['profile', 'x'], 'profile', null, undefined, ['profile', 'publications', 'courses', 'security']]) expect(validateGrant({ ...good, sections }).ok, JSON.stringify(sections)).toBe(false)
  })
  it('refuses bad addresses and any extra key (grantor, role, expiry) whole', () => {
    for (const delegateEmail of ['', 'x', 'a@b', '<a>@b.org', 'a b@c.org', 5, undefined]) expect(validateGrant({ ...good, delegateEmail }).ok).toBe(false)
    for (const k of ['grantorId', 'userId', 'expiresAt', 'role', 'forId']) expect(validateGrant({ ...good, [k]: 'x' }).ok, k).toBe(false)
    for (const v of [null, undefined, 'x', 3, [], [good]]) expect(validateGrant(v).ok).toBe(false)
  })
  it('knows a grant id when it sees one', () => {
    expect(isGrantId('7f0c1c1e-5b8e-4b1a-9c1d-0a1b2c3d4e5f')).toBe(true)
    for (const v of ['', 'x', '1; drop', 5, null, undefined]) expect(isGrantId(v)).toBe(false)
  })
})

const store = (over: Partial<DelegationStore> = {}) => ({
  findDelegate: vi.fn(async () => ({ id: 'd1', name: 'Dee' })),
  create: vi.fn(async () => ({ id: 'g1', expiresAt: 999 })),
  listGiven: vi.fn(async () => []),
  listReceived: vi.fn(async () => []),
  revoke: vi.fn(async () => true),
  authorise: vi.fn(async () => null),
  recentAudit: vi.fn(async () => []),
  ...over,
}) satisfies DelegationStore
const svc = (s: DelegationStore, session: { id: string; fresh: boolean } | null = { id: 'me', fresh: true }) => createDelegationService({ store: s, getSession: async () => session, now: () => 5 })

describe('delegation service', () => {
  it('needs a session for everything and never reaches the store without one', async () => {
    const s = store()
    expect(await svc(s, null).overview()).toEqual({ ok: false, error: 'session' })
    expect(await svc(s, null).grant(good)).toEqual({ ok: false, error: 'session' })
    expect(await svc(s, null).revoke('7f0c1c1e-5b8e-4b1a-9c1d-0a1b2c3d4e5f')).toEqual({ ok: false, error: 'session' })
    for (const f of Object.values(s)) expect(f).not.toHaveBeenCalled()
  })
  it('validates, then needs a fresh second factor, before looking anyone up', async () => {
    const s = store()
    expect(await svc(s).grant({ ...good, grantorId: 'x' })).toMatchObject({ ok: false, error: 'invalid' })
    expect(await svc(s, { id: 'me', fresh: false }).grant(good)).toEqual({ ok: false, error: 'fresh' })
    expect(s.findDelegate).not.toHaveBeenCalled()
    expect(s.create).not.toHaveBeenCalled()
  })
  it('gives one answer for an unknown, inactive or suspended address, and refuses yourself', async () => {
    expect(await svc(store({ findDelegate: vi.fn(async () => null) })).grant(good)).toEqual({ ok: false, error: 'unavailable' })
    const s = store({ findDelegate: vi.fn(async () => ({ id: 'me', name: 'Me' })) })
    expect(await svc(s).grant(good)).toEqual({ ok: false, error: 'self' })
    expect(s.create).not.toHaveBeenCalled()
  })
  it('creates the grant for the session account, with the normalised input', async () => {
    const s = store()
    expect(await svc(s).grant(good)).toEqual({ ok: true, expiresAt: 999 })
    expect(s.create).toHaveBeenCalledWith('me', { delegateId: 'd1', sections: ['profile', 'courses'], days: 30 }, 5)
  })
  it('revokes only as the session account, and says nothing about ids that are not grants', async () => {
    const s = store()
    expect(await svc(s).revoke('7f0c1c1e-5b8e-4b1a-9c1d-0a1b2c3d4e5f')).toEqual({ ok: true })
    expect(s.revoke).toHaveBeenCalledWith('me', '7f0c1c1e-5b8e-4b1a-9c1d-0a1b2c3d4e5f', 5)
    expect(await svc(store({ revoke: vi.fn(async () => false) })).revoke('7f0c1c1e-5b8e-4b1a-9c1d-0a1b2c3d4e5f')).toEqual({ ok: false, error: 'nothing' })
    const t = store()
    expect(await svc(t).revoke('../x')).toEqual({ ok: false, error: 'nothing' })
    expect(t.revoke).not.toHaveBeenCalled()
  })
  it('lists only for the session account', async () => {
    const s = store()
    expect((await svc(s).overview()).ok).toBe(true)
    expect(s.listGiven).toHaveBeenCalledWith('me', 5)
    expect(s.listReceived).toHaveBeenCalledWith('me', 5)
    expect(s.recentAudit).toHaveBeenCalledWith('me', 30)
  })
})
