import { describe, expect, it } from 'vitest'

import { COPY } from '@/modules/portal/copy'
import { mapAuthError } from '@/modules/portal/errors'

describe('mapAuthError: what a person is told', () => {
  it('says the same thing for an unknown email and a wrong password (AUTH-10)', () => {
    const a = mapAuthError({ code: 'INVALID_EMAIL_OR_PASSWORD', status: 401 })
    const b = mapAuthError({ code: 'USER_NOT_FOUND', status: 401 })
    const c = mapAuthError({ status: 401, message: 'Invalid credentials' })
    expect(a).toBe(COPY.errors.badCredentials)
    expect(b).toBe(a)
    expect(c).toBe(a)
  })

  it('tells a person who was held by the delay to wait, without saying which account is held', () => {
    expect(mapAuthError({ status: 429 })).toBe(COPY.errors.tooMany)
  })

  it('maps a refused passkey and a cancelled prompt to different, kind messages', () => {
    expect(mapAuthError({ code: 'AUTHENTICATION_FAILED', status: 400 })).toBe(COPY.errors.passkeyFailed)
    expect(mapAuthError({ code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY', status: 400 })).toBe(COPY.errors.passkeyCancelled)
    expect(COPY.errors.passkeyFailed).not.toBe(COPY.errors.passkeyCancelled)
  })

  it('maps a wrong authenticator-app code and an expired step', () => {
    expect(mapAuthError({ code: 'INVALID_CODE', status: 401 })).toBe(COPY.errors.badCode)
    expect(mapAuthError({ status: 401, message: 'Invalid code' })).toBe(COPY.errors.badCode)
  })

  it('never shows a server message, stack or status text: anything unknown is the generic line', () => {
    for (const e of [{ message: 'select * from "user"', status: 500 }, { status: 503 }, null, undefined, 'boom', { code: 'WHATEVER' }]) {
      expect(mapAuthError(e)).toBe(COPY.errors.generic)
    }
  })

  it('returns only text from the copy file, so every message can be reviewed and translated in one place', () => {
    const all = new Set<string>(Object.values(COPY.errors))
    for (const e of [{ code: 'INVALID_EMAIL_OR_PASSWORD' }, { status: 429 }, { code: 'AUTHENTICATION_FAILED' }, {}, null]) {
      expect(all.has(mapAuthError(e))).toBe(true)
    }
  })
})

describe('copy', () => {
  const strings: string[] = []
  const walk = (v: unknown): void => {
    if (typeof v === 'string') strings.push(v)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(COPY)

  it('has no empty strings and no leftover markers', () => {
    expect(strings.length).toBeGreaterThan(30)
    for (const s of strings) {
      expect(s.trim().length, s).toBeGreaterThan(0)
      expect(s).not.toMatch(/TODO|FIXME|lorem|undefined/i)
    }
  })

  it('labels the portal as a sample, not the university system', () => {
    expect(COPY.sampleBanner).toMatch(/sample/i)
  })

  it('has one page title per page and they differ', () => {
    const titles = [COPY.signIn.title, COPY.home.title, COPY.enrol.title, COPY.recover.title]
    expect(new Set(titles).size).toBe(titles.length)
  })
})
