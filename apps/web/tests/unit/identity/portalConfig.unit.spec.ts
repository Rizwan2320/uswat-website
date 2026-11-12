import { describe, expect, it } from 'vitest'

import { readPortalConfig } from '@/modules/identity/config'

const good = {
  PORTAL_ENABLED: 'true',
  PORTAL_ORIGIN: 'https://portal.uswat.edu.pk',
  PORTAL_DATABASE_URL: 'postgres://u:p@db.example/identity',
  PORTAL_AUTH_SECRET: 'x'.repeat(32),
}

describe('readPortalConfig: the portal is off unless everything is set on purpose', () => {
  it('is disabled with an empty environment', () => {
    expect(readPortalConfig({})).toEqual({ enabled: false, reason: 'PORTAL_ENABLED is not "true"' })
  })

  it.each(['', 'false', 'TRUE', '1', 'yes', ' true'])('is disabled when PORTAL_ENABLED is %j', (v) => {
    expect(readPortalConfig({ ...good, PORTAL_ENABLED: v }).enabled).toBe(false)
  })

  it.each(['PORTAL_ORIGIN', 'PORTAL_DATABASE_URL', 'PORTAL_AUTH_SECRET'] as const)('is disabled without %s', (k) => {
    const env: Record<string, string | undefined> = { ...good }
    delete env[k]
    expect(readPortalConfig(env).enabled).toBe(false)
  })

  it('is enabled with a complete configuration and derives the RP ID from the origin host', () => {
    expect(readPortalConfig(good)).toEqual({
      enabled: true,
      origin: 'https://portal.uswat.edu.pk',
      rpID: 'portal.uswat.edu.pk',
      databaseUrl: good.PORTAL_DATABASE_URL,
      secret: good.PORTAL_AUTH_SECRET,
    })
  })

  it('refuses the bare university domain as RP ID (Addendum C ADR 0014)', () => {
    const c = readPortalConfig({ ...good, PORTAL_ORIGIN: 'https://uswat.edu.pk' })
    expect(c.enabled).toBe(false)
  })

  it('refuses plain http except on localhost', () => {
    expect(readPortalConfig({ ...good, PORTAL_ORIGIN: 'http://portal.example.org' }).enabled).toBe(false)
    expect(readPortalConfig({ ...good, PORTAL_ORIGIN: 'http://localhost:3020' })).toMatchObject({
      enabled: true,
      rpID: 'localhost',
    })
  })

  it('refuses an origin with a path, query or credentials, and a non-URL', () => {
    for (const o of ['https://portal.example.org/x', 'https://portal.example.org?a=1', 'https://a:b@portal.example.org', 'not a url', 'javascript:alert(1)']) {
      expect(readPortalConfig({ ...good, PORTAL_ORIGIN: o }).enabled).toBe(false)
    }
  })

  it('refuses a short secret', () => {
    expect(readPortalConfig({ ...good, PORTAL_AUTH_SECRET: 'x'.repeat(31) }).enabled).toBe(false)
  })

  it('never puts the secret or the database URL into the reason', () => {
    const c = readPortalConfig({ ...good, PORTAL_ORIGIN: 'nope' })
    expect(JSON.stringify(c)).not.toContain(good.PORTAL_AUTH_SECRET)
    expect(JSON.stringify(c)).not.toContain('postgres://')
  })
})
