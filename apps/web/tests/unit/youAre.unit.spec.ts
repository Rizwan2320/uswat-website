import { describe, expect, it } from 'vitest'

import { youAreLine } from '../../src/admin/workflow/youAre'
import { actorFromUser, type Actor, type Role } from '../../src/governance/roles'

const person = (role: Role, extra: object = {}): Actor =>
  actorFromUser({ id: 1, role, offices: ['physics'], ...extra })
const line = (i: Parameters<typeof youAreLine>[0]) => youAreLine(i)

describe('"You are editing" line (slice 3aq)', () => {
  const base = { saved: true, ownerOffice: 'physics', title: 'BS Physics' }

  it('names the page and why, per role', () => {
    const coord = person('editor', { programmes: [5] })
    expect(line({ ...base, actor: coord, collection: 'programmes', id: 5 })?.en).toBe(
      'You are editing a programme you coordinate: BS Physics.',
    )
    const head = person('approver')
    expect(line({ ...base, actor: head, collection: 'departments', id: 2, title: 'Physics' })?.en).toBe(
      'This is your department page: Physics.',
    )
    expect(line({ ...base, actor: head, collection: 'programmes', id: 5 })?.en).toBe(
      'This is a programme of your department: BS Physics.',
    )
    expect(line({ ...base, actor: person('editor'), collection: 'pages', id: 9, title: 'Notice' })?.en).toBe(
      'This page belongs to your office, physics: Notice.',
    )
    expect(
      line({ ...base, actor: person('platformAdmin', { offices: [] }), collection: 'pages', id: 9 })?.en,
    ).toBe('You are editing the page as the platform admin: BS Physics.')
    expect(line({ ...base, actor: person('siteManager', { offices: [] }), collection: 'pages', id: 9 })?.en).toContain(
      'site manager',
    )
  })

  it('a coordinator gets no line on a programme that is not theirs, and none on the department page', () => {
    const coord = person('editor', { programmes: [5] })
    expect(line({ ...base, actor: coord, collection: 'programmes', id: 6 })).toBeNull()
    expect(line({ ...base, actor: coord, collection: 'departments', id: 2 })).toBeNull()
  })

  it('a head gets no line on another office’s page; an auditor and the system get none', () => {
    expect(line({ ...base, ownerOffice: 'chemistry', actor: person('approver'), collection: 'departments', id: 3 })).toBeNull()
    expect(line({ ...base, actor: person('auditor'), collection: 'pages', id: 1 })).toBeNull()
    expect(line({ ...base, actor: { kind: 'system' } as Actor, collection: 'pages', id: 1 })).toBeNull()
  })

  it('a new page says where it will belong', () => {
    const head = person('approver')
    expect(line({ saved: false, ownerOffice: null, actor: head, collection: 'programmes' })?.en).toBe(
      'You are creating a new programme page for your office, physics.',
    )
    expect(line({ saved: false, ownerOffice: null, actor: person('platformAdmin', { offices: [] }), collection: 'departments' })?.en).toBe(
      'You are creating a new department page.',
    )
  })

  it('leaves the title out when the page has none yet', () => {
    const head = person('approver')
    expect(line({ ...base, title: '', actor: head, collection: 'departments', id: 2 })?.en).toBe(
      'This is your department page.',
    )
    expect(line({ ...base, title: '[Untitled]', actor: head, collection: 'departments', id: 2 })?.en).toBe(
      'This is your department page.',
    )
  })

  it('has Urdu for every case it gives', () => {
    const cases = [
      { actor: person('editor', { programmes: [5] }), collection: 'programmes', id: 5 },
      { actor: person('approver'), collection: 'departments', id: 2 },
      { actor: person('approver'), collection: 'programmes', id: 5 },
      { actor: person('editor'), collection: 'pages', id: 9 },
      { actor: person('platformAdmin', { offices: [] }), collection: 'pages', id: 9 },
    ]
    for (const c of cases) {
      const l = line({ ...base, ...c })
      expect(l?.ur.length ?? 0).toBeGreaterThan(5)
    }
  })
})
