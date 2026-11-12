import { describe, expect, it } from 'vitest'

import { createMemoryReplayStore, createReplayGuard, REPLAY_WINDOW_MS } from '@/modules/identity/totpReplay'

describe('TOTP replay guard (AUTH-04: each code accepted once)', () => {
  it('accepts a code the first time and rejects the same code again', async () => {
    const g = createReplayGuard(createMemoryReplayStore())
    expect(await g.claim('acct-1', '123456', 1_000)).toBe(true)
    expect(await g.claim('acct-1', '123456', 2_000)).toBe(false)
  })

  it('keeps accounts apart: the same digits on another account are a different code', async () => {
    const g = createReplayGuard(createMemoryReplayStore())
    expect(await g.claim('acct-1', '123456', 1_000)).toBe(true)
    expect(await g.claim('acct-2', '123456', 1_000)).toBe(true)
  })

  it('treats different codes on one account independently', async () => {
    const g = createReplayGuard(createMemoryReplayStore())
    expect(await g.claim('acct-1', '111111', 1_000)).toBe(true)
    expect(await g.claim('acct-1', '222222', 1_000)).toBe(true)
  })

  it('remembers a code for longer than the ±1 step tolerance (3 steps of 30 s)', () => {
    expect(REPLAY_WINDOW_MS).toBeGreaterThanOrEqual(90_000)
  })

  it('rejects a replay anywhere inside the window, accepts again after it', async () => {
    const g = createReplayGuard(createMemoryReplayStore())
    await g.claim('acct-1', '123456', 0)
    expect(await g.claim('acct-1', '123456', REPLAY_WINDOW_MS - 1)).toBe(false)
    expect(await g.claim('acct-1', '123456', REPLAY_WINDOW_MS + 1)).toBe(true)
  })

  it('lets only one of two simultaneous attempts with the same code through', async () => {
    const g = createReplayGuard(createMemoryReplayStore())
    const results = await Promise.all([g.claim('acct-1', '123456', 5), g.claim('acct-1', '123456', 5)])
    expect(results.filter(Boolean)).toHaveLength(1)
  })

  it('never stores the account id or the code in clear text', async () => {
    const store = createMemoryReplayStore()
    const g = createReplayGuard(store)
    await g.claim('acct-secret-id', '987654', 1)
    const keys = [...store.keys()]
    expect(keys).toHaveLength(1)
    expect(keys[0]).not.toContain('acct-secret-id')
    expect(keys[0]).not.toContain('987654')
    expect(keys[0]).toMatch(/^[0-9a-f]{64}$/)
  })

  it('rejects input that is not six digits without touching the store', async () => {
    const store = createMemoryReplayStore()
    const g = createReplayGuard(store)
    for (const bad of ['', '12345', '1234567', 'abcdef', '12 456', '１２３４５６']) {
      expect(await g.claim('acct-1', bad, 1)).toBe(false)
    }
    expect(store.keys().length).toBe(0)
  })
})
