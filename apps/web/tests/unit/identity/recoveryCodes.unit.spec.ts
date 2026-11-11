import { describe, expect, it } from 'vitest'

import {
  generateRecoveryCodes,
  normaliseRecoveryCode,
  RECOVERY_CODE_COUNT,
  verifyAndConsume,
} from '@/modules/identity/recoveryCodes'

describe('recovery codes (AUTH-05)', () => {
  it('issues ten distinct codes in a readable format', () => {
    const { codes } = generateRecoveryCodes()
    expect(RECOVERY_CODE_COUNT).toBe(10)
    expect(codes).toHaveLength(10)
    expect(new Set(codes).size).toBe(10)
    for (const c of codes) expect(c).toMatch(/^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/)
  })

  it('stores only salted hashes: no code, no reversible form', () => {
    const { codes, records } = generateRecoveryCodes()
    expect(records).toHaveLength(10)
    const blob = JSON.stringify(records)
    for (const c of codes) {
      expect(blob).not.toContain(c)
      expect(blob).not.toContain(c.replace('-', ''))
    }
    for (const r of records) {
      expect(r.hash).toMatch(/^[0-9a-f]{64}$/)
      expect(r.salt).toMatch(/^[0-9a-f]{32}$/)
      expect(r.usedAt).toBeNull()
    }
    expect(new Set(records.map((r) => r.salt)).size).toBe(10)
  })

  it('accepts a code once and marks it used', () => {
    const { codes, records } = generateRecoveryCodes()
    const first = verifyAndConsume(records, codes[3]!, 100)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.records.filter((r) => r.usedAt !== null)).toHaveLength(1)
    expect(first.remaining).toBe(9)
    const again = verifyAndConsume(first.records, codes[3]!, 200)
    expect(again.ok).toBe(false)
  })

  it('does not change the stored records when verification fails', () => {
    const { records } = generateRecoveryCodes()
    const before = JSON.stringify(records)
    const bad = verifyAndConsume(records, 'AAAAA-AAAAA', 1)
    expect(bad.ok).toBe(false)
    expect(JSON.stringify(records)).toBe(before)
  })

  it('ignores case, spaces and the hyphen when reading a code', () => {
    const { codes, records } = generateRecoveryCodes()
    const typed = ` ${codes[0]!.toLowerCase().replace('-', ' ')} `
    expect(normaliseRecoveryCode(typed)).toBe(codes[0]!.replace('-', ''))
    expect(verifyAndConsume(records, typed, 1).ok).toBe(true)
  })

  it('regenerating produces a set in which no old code works', () => {
    const a = generateRecoveryCodes()
    const b = generateRecoveryCodes()
    for (const c of a.codes) expect(verifyAndConsume(b.records, c, 1).ok).toBe(false)
    expect(verifyAndConsume(b.records, b.codes[0]!, 1).ok).toBe(true)
  })

  it('rejects empty, short and oversized input without throwing', () => {
    const { records } = generateRecoveryCodes()
    for (const bad of ['', ' ', 'ABC', 'A'.repeat(500), '\u0000\u0000']) {
      expect(verifyAndConsume(records, bad, 1).ok).toBe(false)
    }
  })
})
