import { describe, expect, it } from 'vitest'

import type { Actor } from '../../src/governance/roles'
import {
  checkTeamCreate,
  checkTeamDelete,
  checkTeamUpdate,
  managesTeam,
  onTeam,
  teamOffices,
} from '../../src/governance/teamAccess'

const user = (role: string, offices: string[]): Actor =>
  ({ kind: 'user', id: 1, role, offices }) as Actor
const head = user('approver', ['computer science'])
const headOfTwo = user('approver', ['computer science', 'physics'])
const headNoOffice = user('approver', [])

const codeOf = (r: { ok: boolean; code?: string }) => (r.ok ? 'ok' : r.code)

describe('who manages a team', () => {
  it('only an approver with an office', () => {
    expect(teamOffices(head)).toEqual(['computer science'])
    expect(managesTeam(head)).toBe(true)
    expect(managesTeam(headNoOffice)).toBe(false)
    for (const role of ['platformAdmin', 'siteManager', 'editor', 'contributor', 'auditor'])
      expect(managesTeam(user(role, ['computer science'])), role).toBe(false)
    expect(managesTeam({ kind: 'system' })).toBe(false)
    expect(managesTeam({ kind: 'anonymous' })).toBe(false)
  })
})

describe('creating an account', () => {
  it.each([
    ['an editor for the head’s office', { role: 'editor', offices: ['Computer Science'] }, 'ok'],
    [
      'a contributor, written in any case',
      { role: 'contributor', offices: ['  computer  SCIENCE '] },
      'ok',
    ],
    ['no role means contributor', { offices: ['computer science'] }, 'ok'],
    ['no office fills in the head’s only office', { role: 'editor' }, 'ok'],
    ['an approver', { role: 'approver', offices: ['computer science'] }, 'TEAM_ROLE_FORBIDDEN'],
    [
      'a platform admin',
      { role: 'platformAdmin', offices: ['computer science'] },
      'TEAM_ROLE_FORBIDDEN',
    ],
    ['a site manager', { role: 'siteManager', offices: [] }, 'TEAM_ROLE_FORBIDDEN'],
    ['an auditor', { role: 'auditor', offices: [] }, 'TEAM_ROLE_FORBIDDEN'],
    ['an unknown role', { role: 'root', offices: ['computer science'] }, 'TEAM_ROLE_FORBIDDEN'],
    ['another office', { role: 'editor', offices: ['physics'] }, 'TEAM_OFFICE_FORBIDDEN'],
    [
      'own and another office',
      { role: 'editor', offices: ['computer science', 'physics'] },
      'TEAM_OFFICE_FORBIDDEN',
    ],
  ])('%s', (_label, data, expected) => {
    expect(codeOf(checkTeamCreate(head, data))).toBe(expected)
  })

  it('returns the role and the normalised offices that will be stored', () => {
    expect(
      checkTeamCreate(head, {
        role: 'editor',
        offices: [' Computer  Science ', 'computer science'],
      }),
    ).toEqual({
      ok: true,
      role: 'editor',
      offices: ['computer science'],
    })
    expect(checkTeamCreate(head, {})).toEqual({
      ok: true,
      role: 'contributor',
      offices: ['computer science'],
    })
  })

  it('a head of two offices must say which', () => {
    expect(codeOf(checkTeamCreate(headOfTwo, { role: 'editor' }))).toBe('TEAM_OFFICE_REQUIRED')
    expect(codeOf(checkTeamCreate(headOfTwo, { role: 'editor', offices: ['physics'] }))).toBe('ok')
  })

  it('someone who holds no office cannot add anyone, and the checks are never reached for other roles', () => {
    expect(codeOf(checkTeamCreate(headNoOffice, { role: 'editor', offices: [] }))).toBe(
      'TEAM_TARGET_FORBIDDEN',
    )
    expect(codeOf(checkTeamCreate(user('editor', ['computer science']), { role: 'editor' }))).toBe(
      'TEAM_TARGET_FORBIDDEN',
    )
  })
})

describe('changing someone else’s account', () => {
  const member = {
    role: 'editor',
    offices: ['computer science'],
    name: 'Ayesha',
    email: 'a@example.test',
  }

  it.each([
    ['editor to contributor', { role: 'contributor' }, 'ok'],
    [
      'contributor to editor, whole document sent back unchanged',
      { ...member, role: 'editor' },
      'ok',
    ],
    [
      'add one of the head’s own offices (they have two)',
      { offices: ['computer science', 'physics'] },
      'ok-two',
    ],
    ['promote to approver', { role: 'approver' }, 'TEAM_ROLE_FORBIDDEN'],
    ['promote to platform admin', { role: 'platformAdmin' }, 'TEAM_ROLE_FORBIDDEN'],
    ['change the email', { email: 'new@example.test' }, 'TEAM_FIELD_FORBIDDEN'],
    ['change the email, case only, is not a change', { email: 'A@Example.test' }, 'ok'],
    ['change the name', { name: 'Someone Else' }, 'TEAM_FIELD_FORBIDDEN'],
    ['set a password', { password: 'a-long-enough-password' }, 'TEAM_FIELD_FORBIDDEN'],
    ['take their only office away', { offices: [] }, 'TEAM_OFFICE_REQUIRED'],
    [
      'swap their office for one that is not the head\u2019s',
      { offices: ['physics'] },
      'TEAM_OFFICE_FORBIDDEN',
    ],
  ])('%s', (_label, data, expected) => {
    const actor = expected === 'ok-two' ? headOfTwo : head
    expect(codeOf(checkTeamUpdate(actor, member, data))).toBe(
      expected === 'ok-two' ? 'ok' : expected,
    )
  })

  it('takes the head’s office away and leaves the others exactly as they were', () => {
    const both = { ...member, offices: ['computer science', 'library'] }
    expect(checkTeamUpdate(head, both, { offices: ['library'] })).toEqual({
      ok: true,
      role: 'editor',
      offices: ['library'],
    })
  })

  it('cannot add or drop an office that is not the head’s', () => {
    const both = { ...member, offices: ['computer science', 'library'] }
    expect(codeOf(checkTeamUpdate(head, both, { offices: ['computer science'] }))).toBe(
      'TEAM_OFFICE_FORBIDDEN',
    )
    expect(
      codeOf(checkTeamUpdate(head, both, { offices: ['computer science', 'library', 'finance'] })),
    ).toBe('TEAM_OFFICE_FORBIDDEN')
    expect(
      codeOf(checkTeamUpdate(head, member, { offices: ['computer science', 'finance'] })),
    ).toBe('TEAM_OFFICE_FORBIDDEN')
  })

  it('cannot touch anyone who is not an editor or contributor of their office', () => {
    for (const role of ['approver', 'platformAdmin', 'siteManager', 'auditor'])
      expect(codeOf(checkTeamUpdate(head, { ...member, role }, { role: 'editor' })), role).toBe(
        'TEAM_TARGET_FORBIDDEN',
      )
    expect(
      codeOf(checkTeamUpdate(head, { ...member, offices: ['physics'] }, { role: 'contributor' })),
    ).toBe('TEAM_TARGET_FORBIDDEN')
    expect(codeOf(checkTeamUpdate(head, { ...member, offices: [] }, { role: 'contributor' }))).toBe(
      'TEAM_TARGET_FORBIDDEN',
    )
  })
})

describe('deleting an account', () => {
  it('only a team member who works for none but the head’s offices', () => {
    expect(checkTeamDelete(head, { role: 'editor', offices: ['computer science'] })).toBeNull()
    expect(checkTeamDelete(head, { role: 'contributor', offices: ['Computer Science'] })).toBeNull()
    expect(
      checkTeamDelete(head, { role: 'editor', offices: ['computer science', 'library'] })?.code,
    ).toBe('TEAM_TARGET_FORBIDDEN')
    expect(checkTeamDelete(head, { role: 'editor', offices: ['library'] })?.code).toBe(
      'TEAM_TARGET_FORBIDDEN',
    )
    for (const role of ['approver', 'platformAdmin', 'siteManager', 'auditor'])
      expect(checkTeamDelete(head, { role, offices: ['computer science'] })?.code, role).toBe(
        'TEAM_TARGET_FORBIDDEN',
      )
  })
  it('a person on the team is found by role and shared office', () => {
    expect(onTeam(head, { role: 'editor', offices: ['computer science'] })).toBe(true)
    expect(onTeam(head, { role: 'editor', offices: ['physics'] })).toBe(false)
    expect(onTeam(head, { role: 'approver', offices: ['computer science'] })).toBe(false)
  })
})
