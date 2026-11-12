import { describe, expect, it } from 'vitest'

import { assertSafeTarget } from '@/modules/identity/migrate'

describe('assertSafeTarget: the identity migration never runs against a remote database by accident', () => {
  it.each([
    'postgres://u:p@localhost:5544/fp0',
    'postgresql://u:p@127.0.0.1/fp0',
    'postgres://u:p@[::1]:5432/fp0',
    'postgres:///fp0?host=/var/run/postgresql',
  ])('allows a local target: %s', (url) => {
    expect(() => assertSafeTarget(url, {})).not.toThrow()
  })

  it.each([
    'postgres://u:p@ep-cool-1234-pooler.us-east-2.aws.neon.tech/neondb',
    'postgres://u:p@db.example.org/identity',
    'postgres://u:p@10.0.0.5/identity',
  ])('refuses a remote target without the owner override: %s', (url) => {
    expect(() => assertSafeTarget(url, {})).toThrow(/remote/i)
  })

  it('accepts a remote target only with the exact owner override', () => {
    const url = 'postgres://u:p@db.example.org/identity'
    expect(() => assertSafeTarget(url, { IDENTITY_ALLOW_REMOTE: 'yes' })).toThrow()
    expect(() => assertSafeTarget(url, { IDENTITY_ALLOW_REMOTE: 'I-AM-THE-OWNER' })).not.toThrow()
  })

  it('refuses anything that is not a postgres URL', () => {
    for (const u of ['', 'mysql://localhost/x', 'not a url', 'file:///etc/passwd']) {
      expect(() => assertSafeTarget(u, {})).toThrow()
    }
  })

  it('never puts the password in the error text', () => {
    try {
      assertSafeTarget('postgres://user:hunter2secret@db.example.org/identity', {})
    } catch (e) {
      expect(String(e)).not.toContain('hunter2secret')
    }
  })
})
