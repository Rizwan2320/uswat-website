import { describe, expect, it } from 'vitest'

import {
  ACCOUNT_POLICY,
  ADDRESS_POLICY,
  DECAY_MS,
  createMemoryThrottleStore,
  createSignInThrottle,
  waitMs,
} from '@/modules/identity/signInThrottle'

const T0 = 1_800_000_000_000
const who = { email: 'Dr.Sample@Example.test', address: '203.0.113.7' }

function setup() {
  const store = createMemoryThrottleStore()
  return { store, t: createSignInThrottle({ store }) }
}
async function fail(t: ReturnType<typeof setup>['t'], n: number, at: number, target = who) {
  for (let i = 0; i < n; i++) await t.failed(target, at)
}

describe('waitMs: the schedule (ABU-01)', () => {
  it('is free for the first failures, then doubles from one second, and is capped', () => {
    const p = ACCOUNT_POLICY
    expect(p.free).toBe(3)
    expect(waitMs(0, p)).toBe(0)
    expect(waitMs(3, p)).toBe(0)
    expect(waitMs(4, p)).toBe(1_000)
    expect(waitMs(5, p)).toBe(2_000)
    expect(waitMs(6, p)).toBe(4_000)
    expect(waitMs(13, p)).toBe(512_000)
    expect(waitMs(14, p)).toBe(p.capMs)
    expect(waitMs(500, p)).toBe(p.capMs)
    expect(p.capMs).toBe(15 * 60_000)
  })

  it('has no permanent lockout: both caps are finite and the address cap is shorter', () => {
    expect(Number.isFinite(ACCOUNT_POLICY.capMs)).toBe(true)
    expect(ADDRESS_POLICY.capMs).toBeLessThan(ACCOUNT_POLICY.capMs)
    expect(waitMs(1_000_000, ACCOUNT_POLICY)).toBe(ACCOUNT_POLICY.capMs)
  })

  it('gives the address a more generous free allowance (a campus sits behind few addresses)', () => {
    expect(ADDRESS_POLICY.free).toBeGreaterThan(ACCOUNT_POLICY.free)
  })
})

describe('sign-in throttle', () => {
  it('allows the first failures with no wait', async () => {
    const { t } = setup()
    await fail(t, 3, T0)
    expect(await t.check(who, T0)).toEqual({ allowed: true })
  })

  it('refuses during the wait after the fourth failure, even though it cannot know the password was right', async () => {
    const { t } = setup()
    await fail(t, 4, T0)
    expect(await t.check(who, T0 + 500)).toEqual({ allowed: false, retryAfterMs: 500 })
    expect(await t.check(who, T0 + 1_000)).toEqual({ allowed: true })
  })

  it('the wait grows with each failure and is measured from the last one', async () => {
    const { t } = setup()
    await fail(t, 6, T0)
    const r = await t.check(who, T0 + 1_000)
    expect(r).toEqual({ allowed: false, retryAfterMs: 3_000 })
  })

  it('never asks for more than the cap', async () => {
    const { t } = setup()
    await fail(t, 200, T0)
    const r = await t.check(who, T0)
    expect(r.allowed).toBe(false)
    if (!r.allowed) expect(r.retryAfterMs).toBeLessThanOrEqual(ACCOUNT_POLICY.capMs)
  })

  it('forgets failures after an hour without any', async () => {
    const { t } = setup()
    await fail(t, 10, T0)
    expect(await t.check(who, T0 + DECAY_MS + 1)).toEqual({ allowed: true })
    await t.failed(who, T0 + DECAY_MS + 2)
    expect(await t.check(who, T0 + DECAY_MS + 3)).toEqual({ allowed: true })
  })

  it('keys the account by the normalised email: case and spaces do not give a fresh allowance', async () => {
    const { t } = setup()
    await fail(t, 4, T0, { email: 'dr.sample@example.test', address: '198.51.100.1' })
    const r = await t.check({ email: '  DR.SAMPLE@EXAMPLE.TEST ', address: '198.51.100.2' }, T0)
    expect(r.allowed).toBe(false)
  })

  it('treats an unknown email exactly like a real one (AUTH-10): the counters know nothing about accounts', async () => {
    const { t } = setup()
    await fail(t, 4, T0, { email: 'nobody-at-all@example.test', address: '198.51.100.9' })
    expect((await t.check({ email: 'nobody-at-all@example.test', address: '198.51.100.8' }, T0)).allowed).toBe(false)
  })

  it('counts addresses separately and more generously: 20 failures from one address across many accounts', async () => {
    const { t } = setup()
    for (let i = 0; i < ADDRESS_POLICY.free; i++) await t.failed({ email: `u${i}@example.test`, address: '192.0.2.1' }, T0)
    expect((await t.check({ email: 'fresh@example.test', address: '192.0.2.1' }, T0)).allowed).toBe(true)
    await t.failed({ email: 'u99@example.test', address: '192.0.2.1' }, T0)
    expect((await t.check({ email: 'fresh@example.test', address: '192.0.2.1' }, T0)).allowed).toBe(false)
    expect((await t.check({ email: 'fresh@example.test', address: '192.0.2.2' }, T0)).allowed).toBe(true)
  })

  it('a successful sign-in clears the account counter but not the address counter', async () => {
    const { t } = setup()
    for (let i = 0; i < 10; i++) await t.failed({ email: 'a@example.test', address: '192.0.2.5' }, T0)
    await t.succeeded({ email: 'a@example.test' })
    expect((await t.check({ email: 'a@example.test', address: '192.0.2.99' }, T0)).allowed).toBe(true)
    // the address still carries its 10 failures: 10 more tip it over
    for (let i = 0; i < 11; i++) await t.failed({ email: `x${i}@example.test`, address: '192.0.2.5' }, T0)
    expect((await t.check({ email: 'b@example.test', address: '192.0.2.5' }, T0)).allowed).toBe(false)
  })

  it('reports the longer of the two waits', async () => {
    const { t } = setup()
    await fail(t, 6, T0, { email: 'a@example.test', address: '192.0.2.77' })
    const r = await t.check({ email: 'a@example.test', address: '192.0.2.77' }, T0)
    expect(r).toEqual({ allowed: false, retryAfterMs: 4_000 })
  })

  it('stores hashes, not the email or the address', async () => {
    const { t, store } = setup()
    await fail(t, 1, T0)
    const dump = JSON.stringify([...store.keys()])
    expect(dump).not.toContain('sample')
    expect(dump).not.toContain('203.0.113.7')
  })

  it('an empty or oversized email still counts against the address, and cannot grow a key without bound', async () => {
    const { t, store } = setup()
    await t.failed({ email: '', address: '192.0.2.8' }, T0)
    await t.failed({ email: 'x'.repeat(100_000), address: '192.0.2.8' }, T0)
    for (const k of store.keys()) expect(k.length).toBeLessThan(100)
  })
})
