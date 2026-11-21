import { describe, expect, it } from 'vitest'

import type { ProfileEdit } from '@/modules/portal/profile/types'
import { compareEdits, normaliseDepartment, validateDecision, isSubjectId } from '@/modules/portal/review/rules'

const edit = (over: Partial<ProfileEdit> = {}): ProfileEdit => ({
  bio: { en: 'Bio', ur: '' },
  researchInterests: ['a', 'b'],
  officeLocation: 'Room 1',
  officeHours: 'Mon 10',
  orcid: '',
  scholarUrl: '',
  cvLink: '',
  visibility: { email: 'hidden', photo: 'hidden' },
  ...over,
})

describe('validateDecision', () => {
  const ok = { subjectId: 'abc_123', rev: 2, decision: 'approved' }
  it('accepts an approval without a note', () => {
    expect(validateDecision(ok)).toEqual({ ok: true, value: { subjectId: 'abc_123', rev: 2, decision: 'approved', note: null } })
  })
  it('requires a note to ask for changes, and trims it', () => {
    const r = validateDecision({ ...ok, decision: 'changes-requested' })
    expect(r.ok).toBe(false)
    expect(!r.ok && r.errors.note).toBe('required')
    expect(!r.ok && validateDecision({ ...ok, decision: 'changes-requested', note: '   ' }).ok).toBe(false)
    const good = validateDecision({ ...ok, decision: 'changes-requested', note: '  Fix the bio \r\n now ' })
    expect(good.ok && good.value.note).toBe('Fix the bio \n now')
  })
  it('refuses a note on an approval', () => {
    const r = validateDecision({ ...ok, note: 'hello' })
    expect(!r.ok && r.errors.note).toBe('unexpected')
  })
  it('refuses unknown keys such as a reviewer id or department', () => {
    for (const k of ['reviewerId', 'department', 'role', 'userId']) {
      const r = validateDecision({ ...ok, [k]: 'x' })
      expect(!r.ok && r.errors.keys).toBe('unknown field')
    }
  })
  it('refuses bad ids, revisions and decisions', () => {
    for (const bad of [{ subjectId: '../x' }, { subjectId: '' }, { subjectId: 'a'.repeat(65) }, { subjectId: 5 }]) expect(validateDecision({ ...ok, ...bad }).ok).toBe(false)
    for (const rev of [0, -1, 1.5, '2', NaN, Infinity, 2 ** 60]) expect(validateDecision({ ...ok, rev }).ok).toBe(false)
    for (const decision of ['APPROVED', 'approve', '', null, undefined, {}]) expect(validateDecision({ ...ok, decision }).ok).toBe(false)
    for (const input of [null, undefined, 'x', 3, [], [ok]]) expect(validateDecision(input).ok).toBe(false)
  })
  it('refuses control and bidi characters and over-long notes, but allows newlines and 500 characters', () => {
    const base = { ...ok, decision: 'changes-requested' }
    for (const c of ['\u0000', '\u0007', '‮', '⁦', '\u0085', '\u007F']) expect(validateDecision({ ...base, note: `a${c}b` }).ok).toBe(false)
    expect(validateDecision({ ...base, note: 'a'.repeat(500) }).ok).toBe(true)
    expect(validateDecision({ ...base, note: 'a'.repeat(501) }).ok).toBe(false)
    expect(validateDecision({ ...base, note: 'line1\nline2' }).ok).toBe(true)
    expect(validateDecision({ ...base, note: 12 }).ok).toBe(false)
  })
})

describe('isSubjectId and normaliseDepartment', () => {
  it('accepts only the id alphabet', () => {
    expect(isSubjectId('a-B_9')).toBe(true)
    for (const v of ['a b', 'a/b', "a'b", 'é', '', undefined, 7]) expect(isSubjectId(v)).toBe(false)
  })
  it('normalises department names and refuses unusable ones', () => {
    expect(normaliseDepartment('  Computer   Science ')).toBe('Computer Science')
    for (const v of ['', '   ', 'a\u0000b', 'a‮b', 'x'.repeat(81), null, 4]) expect(normaliseDepartment(v)).toBeNull()
    expect(normaliseDepartment('x'.repeat(80))).not.toBeNull()
  })
})

describe('compareEdits', () => {
  it('reports nothing for identical edits', () => expect(compareEdits(edit(), edit())).toEqual([]))
  it('reports each differing field with both values', () => {
    const c = compareEdits(edit(), edit({ bio: { en: 'New', ur: 'نیا' }, officeHours: 'Tue 9', visibility: { email: 'public', photo: 'hidden' } }))
    expect(c.map((x) => x.field)).toEqual(['bioEn', 'bioUr', 'officeHours', 'emailVisibility'])
    expect(c[0]).toEqual({ field: 'bioEn', before: 'Bio', after: 'New' })
  })
  it('treats nothing published as empty, so only filled fields show as changes', () => {
    const c = compareEdits(null, edit())
    expect(c.map((x) => x.field)).toEqual(['bioEn', 'researchInterests', 'officeLocation', 'officeHours'])
  })
  it('does not confuse one interest "a, b" with two interests', () => {
    const c = compareEdits(edit({ researchInterests: ['a', 'b'] }), edit({ researchInterests: ['a, b'] }))
    expect(c.map((x) => x.field)).toEqual(['researchInterests'])
  })
  it('notices a reorder of interests', () => {
    expect(compareEdits(edit({ researchInterests: ['a', 'b'] }), edit({ researchInterests: ['b', 'a'] }))).toHaveLength(1)
  })
})
