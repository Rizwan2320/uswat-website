import { describe, expect, it } from 'vitest'

import { matchRecoveryCode, generateRecoveryCodes } from '@/modules/identity/recoveryCodes'
import {
  LOCK_WINDOW_MS,
  MAX_FAILURES,
  createMemoryAttemptStore,
  createMemoryRecoveryStore,
  createRecoveryService,
} from '@/modules/identity/recoveryService'

const T0 = 1_800_000_000_000

function setup() {
  const recovery = createMemoryRecoveryStore()
  const attempts = createMemoryAttemptStore()
  return { recovery, attempts, svc: createRecoveryService({ recovery, attempts }) }
}

describe('matchRecoveryCode', () => {
  it('finds the matching unused record, ignores case, dashes and spaces, and skips used ones', () => {
    const { codes, records } = generateRecoveryCodes()
    expect(matchRecoveryCode(records, codes[3]!)).toBe(3)
    expect(matchRecoveryCode(records, codes[3]!.toLowerCase().replace('-', ' '))).toBe(3)
    const used = records.map((r, i) => (i === 3 ? { ...r, usedAt: 1 } : r))
    expect(matchRecoveryCode(used, codes[3]!)).toBe(-1)
    expect(matchRecoveryCode(records, 'AAAAA-AAAAA')).toBe(-1)
    expect(matchRecoveryCode(records, '')).toBe(-1)
  })
})

describe('recovery service (AUTH-05)', () => {
  it('issues ten codes and stores hashes only', async () => {
    const { svc, recovery } = setup()
    const codes = await svc.issue('u1')
    expect(codes).toHaveLength(10)
    const rows = await recovery.list('u1')
    expect(rows).toHaveLength(10)
    const dump = JSON.stringify(rows)
    for (const c of codes) expect(dump).not.toContain(c.replace('-', ''))
  })

  it('accepts a code once and refuses it the second time', async () => {
    const { svc } = setup()
    const codes = await svc.issue('u1')
    expect(await svc.redeem('u1', codes[0]!, T0)).toEqual({ status: 'ok', remaining: 9 })
    expect(await svc.redeem('u1', codes[0]!, T0 + 1)).toEqual({ status: 'invalid' })
    expect(await svc.redeem('u1', codes[1]!, T0 + 2)).toEqual({ status: 'ok', remaining: 8 })
  })

  it("does not accept another account's code", async () => {
    const { svc } = setup()
    const a = await svc.issue('u1')
    await svc.issue('u2')
    expect(await svc.redeem('u2', a[0]!, T0)).toEqual({ status: 'invalid' })
  })

  it('regenerating invalidates the old set', async () => {
    const { svc } = setup()
    const old = await svc.issue('u1')
    const fresh = await svc.issue('u1')
    expect(await svc.redeem('u1', old[0]!, T0)).toEqual({ status: 'invalid' })
    expect((await svc.redeem('u1', fresh[0]!, T0)).status).toBe('ok')
  })

  it(`locks the account after ${MAX_FAILURES} failures, and then refuses even a right code`, async () => {
    const { svc } = setup()
    const codes = await svc.issue('u1')
    for (let i = 0; i < MAX_FAILURES; i++) expect((await svc.redeem('u1', 'AAAAA-AAAAA', T0 + i)).status).toBe('invalid')
    expect(await svc.redeem('u1', codes[0]!, T0 + 10)).toEqual({ status: 'locked' })
  })

  it('unlocks once the window has passed', async () => {
    const { svc } = setup()
    const codes = await svc.issue('u1')
    for (let i = 0; i < MAX_FAILURES; i++) await svc.redeem('u1', 'AAAAA-AAAAA', T0)
    expect((await svc.redeem('u1', codes[0]!, T0 + LOCK_WINDOW_MS + 1)).status).toBe('ok')
  })

  it('a success clears the failure count', async () => {
    const { svc } = setup()
    const codes = await svc.issue('u1')
    for (let i = 0; i < MAX_FAILURES - 1; i++) await svc.redeem('u1', 'AAAAA-AAAAA', T0)
    expect((await svc.redeem('u1', codes[0]!, T0 + 1)).status).toBe('ok')
    for (let i = 0; i < MAX_FAILURES - 1; i++) await svc.redeem('u1', 'AAAAA-AAAAA', T0 + 2)
    expect((await svc.redeem('u1', codes[1]!, T0 + 3)).status).toBe('ok')
  })

  it('two simultaneous uses of one code: exactly one wins', async () => {
    const { svc } = setup()
    const codes = await svc.issue('u1')
    const [a, b] = await Promise.all([svc.redeem('u1', codes[0]!, T0), svc.redeem('u1', codes[0]!, T0)])
    expect([a.status, b.status].sort()).toEqual(['invalid', 'ok'])
  })

  it('a malformed code counts as a failure and never reaches the store as a match', async () => {
    const { svc, attempts } = setup()
    await svc.issue('u1')
    expect((await svc.redeem('u1', '<script>', T0)).status).toBe('invalid')
    expect(await attempts.isLocked('u1', T0)).toBe(false)
  })
})
