import { describe, expect, it } from 'vitest'

import { buildChanges, MAX_INLINE, MAX_PATHS } from '@/governance/auditDiff'
import { hashContent, stableStringify } from '@/governance/hash'

describe('buildChanges (CMS-05 diff)', () => {
  it('lists only changed fields, with before and after', () => {
    const c = buildChanges({ title: 'A', slug: 'a' }, { title: 'B', slug: 'a' })
    expect(c).toEqual({ title: { from: 'A', to: 'B' } })
  })

  it('ignores id, createdAt and updatedAt', () => {
    const c = buildChanges(
      { id: 1, createdAt: 'x', updatedAt: 'x', title: 'A' },
      { id: 1, createdAt: 'x', updatedAt: 'y', title: 'A' },
    )
    expect(c).toEqual({})
  })

  it('walks groups to dot paths', () => {
    const c = buildChanges(
      { governance: { status: 'draft', ownerOffice: 'registrar' } },
      { governance: { status: 'in_review', ownerOffice: 'registrar' } },
    )
    expect(c).toEqual({ 'governance.status': { from: 'draft', to: 'in_review' } })
  })

  it('treats a create as everything changing from nothing', () => {
    expect(buildChanges(null, { title: 'A' })).toEqual({ title: { from: null, to: 'A' } })
  })

  it('treats undefined and null as the same', () => {
    expect(buildChanges({ a: undefined }, { a: null })).toEqual({})
  })

  it('is independent of key order', () => {
    expect(buildChanges({ o: { a: 1, b: 2 } }, { o: { b: 2, a: 1 } })).toEqual({})
  })

  it('stores a hash instead of a large value, and the hash changes with the content', () => {
    const big1 = 'x'.repeat(MAX_INLINE + 10)
    const big2 = 'y'.repeat(MAX_INLINE + 10)
    const c = buildChanges({ body: big1 }, { body: big2 })
    const change = c.body as { from: { _hash: string; _chars: number }; to: { _hash: string } }
    expect(change.from._hash).toMatch(/^[0-9a-f]{64}$/)
    expect(change.from._hash).not.toBe(change.to._hash)
    expect(change.from._chars).toBe(MAX_INLINE + 10 + 2) // JSON text includes the two quotes
    expect(JSON.stringify(c).length).toBeLessThan(500)
  })

  it('never stores passwords, tokens, salts or session data', () => {
    const c = buildChanges(
      { email: 'a@x', hash: 'h1', salt: 's1', resetPasswordToken: 't1', sessions: [1] },
      { email: 'b@x', hash: 'h2', salt: 's2', resetPasswordToken: 't2', sessions: [2] },
    )
    expect(c.email).toEqual({ from: 'a@x', to: 'b@x' })
    for (const k of ['hash', 'salt', 'resetPasswordToken', 'sessions']) {
      expect(c[k]).toEqual({ redacted: true })
    }
    expect(JSON.stringify(c)).not.toMatch(/h1|h2|s1|s2|t1|t2/)
  })

  it('caps the number of listed fields', () => {
    const next = Object.fromEntries(Array.from({ length: MAX_PATHS + 50 }, (_, i) => [`f${i}`, i]))
    const c = buildChanges({}, next)
    expect(Object.keys(c).length).toBe(MAX_PATHS + 1)
    expect(c._truncated).toBeDefined()
  })
})

describe('content hash', () => {
  it('is stable for equal content and sensitive to change', () => {
    const a = hashContent({ title: 'T', body: { b: 1, a: [1, 2] } }, ['title', 'body'])
    const b = hashContent({ body: { a: [1, 2], b: 1 }, title: 'T', other: 'ignored' }, ['title', 'body'])
    const c = hashContent({ title: 'T2', body: { b: 1, a: [1, 2] } }, ['title', 'body'])
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })

  it('counts a missing field as null', () => {
    expect(hashContent({}, ['title'])).toBe(hashContent({ title: null }, ['title']))
  })

  it('stableStringify drops undefined object values', () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}')
  })
})
