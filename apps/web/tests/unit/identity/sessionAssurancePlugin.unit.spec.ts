import { describe, expect, it, vi } from 'vitest'

import { endReplacedSession, refreshesProof } from '@/modules/identity/sessionAssurancePlugin'

describe('which calls refresh the step-up clock', () => {
  it('authentication does; registering a key does not; other paths are not in this plugin', () => {
    expect(refreshesProof('/passkey/verify-authentication')).toBe(true)
    expect(refreshesProof('/two-factor/verify-totp')).toBe(true)
    expect(refreshesProof('/passkey/verify-registration')).toBe(false)
    expect(refreshesProof('/sign-in/email')).toBe(false)
    expect(refreshesProof('/passkey/delete-passkey')).toBe(false)
  })
})

describe('SES-03: the session a request arrived with is ended when a new one is made', () => {
  const found = (id: string) => ({ session: { id, token: `${id}-token` } })

  it('ends a different old session', async () => {
    const remove = vi.fn(async () => {})
    expect(await endReplacedSession('new', 'cookie-token', { find: async () => found('old'), remove })).toBe('ended')
    expect(remove).toHaveBeenCalledWith('old-token')
  })
  it.each([
    ['no new session', undefined, 'cookie-token'],
    ['no incoming cookie', 'new', undefined],
    ['an empty cookie', 'new', ''],
    ['a non-string cookie', 'new', false],
  ])('ends nothing with %s', async (_n, created, token) => {
    const remove = vi.fn(async () => {})
    expect(await endReplacedSession(created, token, { find: async () => found('old'), remove })).toBe('kept')
    expect(remove).not.toHaveBeenCalled()
  })
  it('ends nothing when the incoming session is the new one, or unknown', async () => {
    const remove = vi.fn(async () => {})
    expect(await endReplacedSession('same', 't', { find: async () => found('same'), remove })).toBe('kept')
    expect(await endReplacedSession('new', 't', { find: async () => null, remove })).toBe('kept')
    expect(await endReplacedSession('new', 't', { find: async () => { throw new Error('db down') }, remove })).toBe('kept')
    expect(remove).not.toHaveBeenCalled()
  })
  it('a failing delete does not throw into the sign-in', async () => {
    await expect(endReplacedSession('new', 't', { find: async () => found('old'), remove: async () => { throw new Error('x') } })).resolves.toBe('ended')
  })
})
