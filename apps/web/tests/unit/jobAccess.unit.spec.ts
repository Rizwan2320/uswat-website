import { describe, expect, it } from 'vitest'

import { canRunJobs, safeEqual } from '@/governance/jobAccess'
import { ROLES } from '@/governance/roles'

const SECRET = 'a-long-random-secret-value'
const req = (user: unknown, authorization?: string) => ({
  user,
  headers: new Headers(authorization ? { authorization } : {}),
})

describe('who may run the job queue (main agent review of PR #3)', () => {
  it('lets only platform admin and site manager run it as a person', () => {
    const allowed = ROLES.filter((role) => canRunJobs(req({ id: 1, role }), SECRET))
    expect(allowed.sort()).toEqual(['platformAdmin', 'siteManager'])
  })

  it('refuses a contributor, an editor, an approver and the auditor', () => {
    for (const role of ['contributor', 'editor', 'approver', 'auditor']) {
      expect(canRunJobs(req({ id: 1, role }), SECRET), role).toBe(false)
    }
  })

  it('treats a user with no valid role as a contributor', () => {
    expect(canRunJobs(req({ id: 1 }), SECRET)).toBe(false)
    expect(canRunJobs(req({ id: 1, role: 'owner' }), SECRET)).toBe(false)
  })

  it('lets the scheduler in with the exact bearer secret', () => {
    expect(canRunJobs(req(null, `Bearer ${SECRET}`), SECRET)).toBe(true)
  })

  it('refuses a wrong, partial, differently-cased or missing secret', () => {
    for (const header of [
      `Bearer ${SECRET}x`,
      `Bearer ${SECRET.slice(1)}`,
      SECRET,
      'bearer ' + SECRET,
      '',
    ]) {
      expect(canRunJobs(req(null, header || undefined), SECRET), header).toBe(false)
    }
  })

  it('refuses everyone anonymous when no secret is configured', () => {
    expect(canRunJobs(req(null, 'Bearer '), undefined)).toBe(false)
    expect(canRunJobs(req(null, 'Bearer undefined'), undefined)).toBe(false)
    expect(canRunJobs(req(null), '')).toBe(false)
  })

  it('a bearer secret does not matter once someone is signed in without authority', () => {
    expect(canRunJobs(req({ id: 1, role: 'contributor' }, `Bearer ${SECRET}`), SECRET)).toBe(false)
  })
})

describe('safeEqual', () => {
  it('compares strings of any length without throwing', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('abc', 'abcd')).toBe(false)
    expect(safeEqual('', '')).toBe(true)
  })
})
