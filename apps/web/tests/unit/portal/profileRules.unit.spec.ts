import { describe, expect, it } from 'vitest'

import { LIMITS, buildPreview, changedFields, normaliseOrcid, orcidChecksumOk, safeHttpsUrl, validateEdit } from '../../../src/modules/portal/profile/rules'
import type { Profile, ProfileEdit } from '../../../src/modules/portal/profile/types'

const good = (over: Record<string, unknown> = {}) => ({
  bio: { en: 'I teach physics.', ur: 'میں طبیعیات پڑھاتا ہوں۔' },
  researchInterests: ['optics', 'Lasers'],
  officeLocation: 'Block B, room 4',
  officeHours: 'Mon 10:00 to 12:00',
  orcid: '0000-0002-1825-0097',
  scholarUrl: 'https://scholar.google.com/citations?user=abc',
  cvLink: 'https://example.org/cv.pdf',
  visibility: { email: 'public', photo: 'internal' },
  ...over,
})

describe('ORCID (ISO 7064 mod 11-2)', () => {
  it('accepts the published example iD and one ending in X', () => {
    expect(orcidChecksumOk('0000000218250097')).toBe(true)
    expect(orcidChecksumOk('000000021694233X')).toBe(true)
  })
  it('rejects a wrong check digit, a short id and letters', () => {
    expect(orcidChecksumOk('0000000218250098')).toBe(false)
    expect(orcidChecksumOk('000000021825009')).toBe(false)
    expect(orcidChecksumOk('000000021825009A')).toBe(false)
  })
  it('normalises dashes, case and the orcid.org link', () => {
    expect(normaliseOrcid('0000000218250097')).toBe('0000-0002-1825-0097')
    expect(normaliseOrcid('https://orcid.org/0000-0002-1694-233x')).toBe('0000-0002-1694-233X')
    expect(normaliseOrcid('http://orcid.org/0000-0002-1825-0097')).toBeNull()
  })
})

describe('links', () => {
  it('accepts https only, refuses other schemes and embedded credentials', () => {
    expect(safeHttpsUrl('https://example.org/a')).toBe('https://example.org/a')
    for (const bad of ['http://example.org', 'javascript:alert(1)', 'data:text/html,x', 'https://u:p@example.org', 'example.org', '//example.org'])
      expect(safeHttpsUrl(bad), bad).toBeNull()
  })
  it('refuses a link longer than the cap', () => {
    expect(safeHttpsUrl('https://example.org/' + 'a'.repeat(LIMITS.url))).toBeNull()
  })
})

describe('validateEdit', () => {
  it('accepts a good edit and keeps Urdu text exactly', () => {
    const r = validateEdit(good())
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.edit.bio.ur).toBe('میں طبیعیات پڑھاتا ہوں۔')
      expect(r.edit.orcid).toBe('0000-0002-1825-0097')
      expect(r.edit.researchInterests).toEqual(['optics', 'Lasers'])
    }
  })

  it('refuses every high-impact key as read-only, and unknown keys as unknown, naming no value', () => {
    for (const key of ['name', 'designation', 'department', 'facultyStatus', 'email', 'claimedBy', 'sample']) {
      const r = validateEdit(good({ [key]: 'x' }))
      expect(r, key).toEqual({ ok: false, errors: { [key]: 'read-only' } })
    }
    expect(validateEdit(good({ isAdmin: true }))).toEqual({ ok: false, errors: { isAdmin: 'unknown' } })
  })

  it('refuses the whole request when one forbidden key rides along, even beside bad fields', () => {
    const r = validateEdit(good({ designation: 'Vice Chancellor', orcid: 'nope' }))
    expect(r).toEqual({ ok: false, errors: { designation: 'read-only' } })
  })

  it('refuses non-objects', () => {
    for (const v of [null, undefined, 'x', 3, [], true]) expect(validateEdit(v).ok).toBe(false)
  })

  it('enforces length caps by characters, not bytes (Urdu counts once per letter)', () => {
    expect(validateEdit(good({ bio: { en: '', ur: 'ا'.repeat(LIMITS.bio) } })).ok).toBe(true)
    expect(validateEdit(good({ bio: { en: '', ur: 'ا'.repeat(LIMITS.bio + 1) } }))).toEqual({ ok: false, errors: { bio: 'too-long' } })
    expect(validateEdit(good({ officeLocation: 'x'.repeat(LIMITS.officeLocation + 1) }))).toEqual({ ok: false, errors: { officeLocation: 'too-long' } })
    expect(validateEdit(good({ officeHours: 'x'.repeat(LIMITS.officeHours + 1) }))).toEqual({ ok: false, errors: { officeHours: 'too-long' } })
  })

  it('removes control and direction-override characters but keeps newlines in the bio only', () => {
    const r = validateEdit(good({ bio: { en: 'a\u0000b‮c\nd', ur: '' }, officeLocation: 'x\ny\u0007' }))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.edit.bio.en).toBe('abc\nd')
      expect(r.edit.officeLocation).toBe('xy')
    }
  })

  it('limits and tidies research interests', () => {
    const r = validateEdit(good({ researchInterests: ['  optics ', 'OPTICS', '', 'lasers'] }))
    expect(r.ok && r.edit.researchInterests).toEqual(['optics', 'lasers'])
    expect(validateEdit(good({ researchInterests: Array.from({ length: LIMITS.interests + 1 }, (_, i) => `t${i}`) }))).toEqual({ ok: false, errors: { researchInterests: 'too-many' } })
    expect(validateEdit(good({ researchInterests: ['x'.repeat(LIMITS.interest + 1)] }))).toEqual({ ok: false, errors: { researchInterests: 'too-long' } })
    expect(validateEdit(good({ researchInterests: [1] })).ok).toBe(false)
    expect(validateEdit(good({ researchInterests: 'optics' })).ok).toBe(false)
  })

  it('allows empty optional fields and rejects a bad ORCID, a non-Scholar Scholar link and http links', () => {
    expect(validateEdit(good({ orcid: '', scholarUrl: '', cvLink: '' })).ok).toBe(true)
    expect(validateEdit(good({ orcid: '0000-0002-1825-0098' }))).toEqual({ ok: false, errors: { orcid: 'invalid' } })
    expect(validateEdit(good({ scholarUrl: 'https://evil.example/scholar.google.com' }))).toEqual({ ok: false, errors: { scholarUrl: 'invalid' } })
    expect(validateEdit(good({ cvLink: 'http://example.org/cv.pdf' }))).toEqual({ ok: false, errors: { cvLink: 'invalid' } })
  })

  it('accepts only the three visibility choices for exactly email and photo', () => {
    expect(validateEdit(good({ visibility: { email: 'secret', photo: 'public' } }))).toEqual({ ok: false, errors: { visibility: 'invalid' } })
    expect(validateEdit(good({ visibility: { email: 'public' } })).ok).toBe(false)
    expect(validateEdit(good({ visibility: { email: 'public', photo: 'public', phone: 'public' } })).ok).toBe(false)
  })

  it('refuses wrong types for the text fields', () => {
    expect(validateEdit(good({ officeHours: 5 })).ok).toBe(false)
    expect(validateEdit(good({ bio: { en: 1, ur: '' } })).ok).toBe(false)
    expect(validateEdit(good({ bio: { en: '', ur: '', fr: 'x' } })).ok).toBe(false)
  })
})

const profile = (vis: { email: 'hidden' | 'internal' | 'public'; photo: 'hidden' | 'internal' | 'public' }): Profile => ({
  name: { en: 'Dr Sample', ur: 'ڈاکٹر نمونہ' },
  designation: { en: 'Lecturer', ur: 'لیکچرر' },
  department: 'Sample Department',
  facultyStatus: 'current',
  email: 'sample@example.invalid',
  bio: { en: 'b', ur: 'ب' },
  researchInterests: ['a'],
  officeLocation: 'r1',
  officeHours: 'h',
  orcid: '',
  scholarUrl: '',
  cvLink: '',
  visibility: vis,
  sample: true,
})

describe('buildPreview (FP-06)', () => {
  it('shows email and photo only when set to public', () => {
    const levels = ['hidden', 'internal', 'public'] as const
    for (const e of levels)
      for (const p of levels) {
        const v = buildPreview(profile({ email: e, photo: p }))
        expect(v.email, `email ${e}`).toBe(e === 'public' ? 'sample@example.invalid' : null)
        expect(v.showPhoto, `photo ${p}`).toBe(p === 'public')
      }
  })
  it('never shows an email address when the account has none', () => {
    expect(buildPreview({ ...profile({ email: 'public', photo: 'hidden' }), email: null }).email).toBeNull()
  })
  it('carries the sample flag through from the data', () => {
    expect(buildPreview({ ...profile({ email: 'hidden', photo: 'hidden' }), sample: false }).sample).toBe(false)
  })
})

describe('changedFields', () => {
  const a = (validateEdit(good()) as { ok: true; edit: ProfileEdit }).edit
  it('is empty for equal edits and names each changed group', () => {
    expect(changedFields(a, structuredClone(a))).toEqual([])
    expect(changedFields(a, { ...a, bio: { ...a.bio, ur: 'x' } })).toEqual(['bio'])
    expect(changedFields(a, { ...a, researchInterests: ['z'], orcid: '' })).toEqual(['researchInterests', 'orcid'])
    expect(changedFields(a, { ...a, visibility: { ...a.visibility, photo: 'hidden' } })).toEqual(['visibility'])
  })
})
