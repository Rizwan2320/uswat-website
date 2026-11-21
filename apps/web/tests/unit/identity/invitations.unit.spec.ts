import { describe, expect, it, vi } from 'vitest'

import { createClaimService, type ClaimDeps } from '@/modules/identity/claimService'
import { checkInvite, hashToken, INVITATION_TTL_MS, looksLikeToken, newToken, sameHash } from '@/modules/identity/invitations'

describe('invitation tokens', () => {
  it('are 43 URL-safe characters, unique, and never equal to their stored hash', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) {
      const t = newToken()
      expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/)
      expect(looksLikeToken(t)).toBe(true)
      expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/)
      expect(hashToken(t)).not.toBe(t)
      seen.add(t)
    }
    expect(seen.size).toBe(200)
  })
  it('refuse anything that is not the right shape', () => {
    for (const v of ['', 'a', 'x'.repeat(42), 'x'.repeat(44), `${'x'.repeat(42)}!`, `${'x'.repeat(42)} `, "a'--", null, undefined, 5]) expect(looksLikeToken(v)).toBe(false)
  })
  it('compares hashes only when equal', () => {
    const h = hashToken('a'.repeat(43))
    expect(sameHash(h, h)).toBe(true)
    expect(sameHash(h, hashToken('b'.repeat(43)))).toBe(false)
    expect(sameHash(h, h.slice(1))).toBe(false)
  })
  it('lives 72 hours', () => expect(INVITATION_TTL_MS).toBe(72 * 3600 * 1000))
})

describe('checkInvite', () => {
  const good = { recordRef: 'rec_001', email: ' Ayesha.Khan@Example.invalid ', name: '  Dr  Ayesha   Khan (sample) ', department: ' Computer   Science ' }
  it('tidies and lower-cases', () => {
    expect(checkInvite(good)).toEqual({ ok: true, value: { recordRef: 'rec_001', email: 'ayesha.khan@example.invalid', name: 'Dr Ayesha Khan (sample)', department: 'Computer Science' } })
  })
  it('says which field is wrong', () => {
    expect(checkInvite({ ...good, recordRef: '../x' })).toEqual({ ok: false, error: 'record' })
    expect(checkInvite({ ...good, recordRef: '' })).toEqual({ ok: false, error: 'record' })
    for (const email of ['', 'nope', 'a@b', 'a b@c.invalid', '<x>@c.invalid', 'a@c.invalid,b@c.invalid', 5]) expect(checkInvite({ ...good, email })).toEqual({ ok: false, error: 'email' })
    for (const name of ['', '   ', 'x'.repeat(121), 'a\u0000b', 'a‮b', null]) expect(checkInvite({ ...good, name })).toEqual({ ok: false, error: 'name' })
    for (const department of ['', 'x'.repeat(81), 'a\u0007b', undefined]) expect(checkInvite({ ...good, department })).toEqual({ ok: false, error: 'department' })
  })
})

type Spy = ClaimDeps & { accounts: { create: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn>; endSessions: ReturnType<typeof vi.fn> }; invitations: { peek: ReturnType<typeof vi.fn>; consume: ReturnType<typeof vi.fn> } }
const deps = (over: Partial<{ peek: unknown; consume: string; create: () => Promise<{ id: string }> }> = {}): Spy => ({
  invitations: {
    peek: vi.fn(async () => (over.peek === null ? null : { id: 'i1', recordRef: 'r1', email: 'a@example.invalid', name: 'A', department: 'D', expiresAt: 1 })),
    consume: vi.fn(async () => over.consume ?? 'ok'),
  },
  accounts: { create: vi.fn(over.create ?? (async () => ({ id: 'u1' }))), remove: vi.fn(async () => {}), endSessions: vi.fn(async () => {}) },
  now: () => 5000,
}) as Spy
const PW = 'a long enough sample pass'

describe('claim service', () => {
  it('creates the account, ends the stray session, then uses the link', async () => {
    const d = deps()
    expect(await createClaimService(d).claim('t'.repeat(43), PW)).toEqual({ ok: true })
    expect(d.accounts.create).toHaveBeenCalledWith({ email: 'a@example.invalid', password: PW, name: 'A' })
    expect(d.accounts.endSessions).toHaveBeenCalledWith('u1')
    expect(d.invitations.consume).toHaveBeenCalledWith('t'.repeat(43), 'u1', 5000)
    expect(d.accounts.remove).not.toHaveBeenCalled()
  })
  it('answers "unavailable" for a link that is not open, without creating anything', async () => {
    const d = deps({ peek: null })
    expect(await createClaimService(d).claim('t'.repeat(43), PW)).toEqual({ ok: false, error: 'unavailable' })
    expect(await createClaimService(d).claim(42, PW)).toEqual({ ok: false, error: 'unavailable' })
    expect(d.accounts.create).not.toHaveBeenCalled()
    expect(await createClaimService(d).preview('t'.repeat(43))).toBeNull()
  })
  it('refuses a short or huge password before creating anything', async () => {
    const d = deps()
    for (const pw of ['', 'short', 'a'.repeat(14), 'a'.repeat(129), 12345678901234567, null]) expect(await createClaimService(d).claim('t'.repeat(43), pw)).toEqual({ ok: false, error: 'password' })
    expect(d.accounts.create).not.toHaveBeenCalled()
    expect(await createClaimService(d).claim('t'.repeat(43), 'a'.repeat(15))).toEqual({ ok: true })
  })
  it('does not reveal an existing account: a refused creation is "unavailable" and the link stays usable', async () => {
    const d = deps({ create: async () => { throw new Error('USER_ALREADY_EXISTS') } })
    expect(await createClaimService(d).claim('t'.repeat(43), PW)).toEqual({ ok: false, error: 'unavailable' })
    expect(d.invitations.consume).not.toHaveBeenCalled()
  })
  it('removes the new account when someone else used the link first', async () => {
    const d = deps({ consume: 'unavailable' })
    expect(await createClaimService(d).claim('t'.repeat(43), PW)).toEqual({ ok: false, error: 'unavailable' })
    expect(d.accounts.remove).toHaveBeenCalledWith('u1')
  })
  it('removes the new account when using the link throws, and rethrows', async () => {
    const d = deps()
    d.invitations.consume.mockRejectedValue(new Error('db down'))
    await expect(createClaimService(d).claim('t'.repeat(43), PW)).rejects.toThrow('db down')
    expect(d.accounts.remove).toHaveBeenCalledWith('u1')
  })
  it('previews only the name and address', async () => {
    expect(await createClaimService(deps()).preview('t'.repeat(43))).toEqual({ name: 'A', email: 'a@example.invalid' })
  })
})
