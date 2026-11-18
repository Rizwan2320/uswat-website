/**
 * Rules for the faculty profile (FP-02, FP-03, FP-06). Pure functions, no I/O, so every rule is tested directly.
 * - ALLOW-LIST: only the keys in `EDITABLE_KEYS` may arrive; any other key is refused, not ignored (FPR-02).
 * - Values are checked and cleaned here; the store trusts what comes out of `validateEdit` and nothing else.
 * - `buildPreview` is what the public would see, and is the only code that decides what a visibility choice hides.
 */
import { VISIBILITIES, type Profile, type ProfileEdit, type Visibility } from './types'

export const EDITABLE_KEYS = ['bio', 'researchInterests', 'officeLocation', 'officeHours', 'orcid', 'scholarUrl', 'cvLink', 'visibility'] as const

/** High-impact fields (FP-03). Named so a refusal can say why; they are refused like any unknown key. */
export const HIGH_IMPACT_KEYS = ['name', 'designation', 'department', 'facultyStatus', 'email', 'claimedBy', 'sample'] as const

export const LIMITS = {
  bio: 2000,
  interests: 10,
  interest: 40,
  officeLocation: 120,
  officeHours: 200,
  url: 300,
} as const

export type FieldErrors = Partial<Record<string, string>>
export type Validated = { ok: true; edit: ProfileEdit } | { ok: false; errors: FieldErrors }

// Control characters (and bidi overrides that can disguise text) are removed; \n and \t survive only where `multiline`.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F‪-‮⁦-⁩]/g
// eslint-disable-next-line no-control-regex
const CONTROL_SINGLE = /[\u0000-\u001F\u007F-\u009F‪-‮⁦-⁩]/g

function clean(v: unknown, multiline: boolean): string | null {
  if (typeof v !== 'string') return null
  return v.replace(multiline ? CONTROL : CONTROL_SINGLE, '').trim()
}

/** ISO 7064 mod 11-2, as ORCID defines it. Takes sixteen characters without dashes. */
export function orcidChecksumOk(id16: string): boolean {
  if (!/^\d{15}[\dX]$/.test(id16)) return false
  let total = 0
  for (let i = 0; i < 15; i++) total = (total + Number(id16[i])) * 2
  const result = (12 - (total % 11)) % 11
  return id16[15] === (result === 10 ? 'X' : String(result))
}

/** Accepts `0000-0002-1825-0097`, the bare 16 characters, or the orcid.org link; returns the dashed form or null. */
export function normaliseOrcid(raw: string): string | null {
  const stripped = raw.replace(/^https:\/\/orcid\.org\//i, '').replace(/-/g, '').toUpperCase()
  if (!orcidChecksumOk(stripped)) return null
  return `${stripped.slice(0, 4)}-${stripped.slice(4, 8)}-${stripped.slice(8, 12)}-${stripped.slice(12)}`
}

/** https only, no embedded credentials, bounded length; `host` optionally narrows to one site. Returns the cleaned URL or null. */
export function safeHttpsUrl(raw: string, host?: (h: string) => boolean): string | null {
  if (raw.length > LIMITS.url) return null
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  if (u.protocol !== 'https:' || u.username || u.password) return null
  if (host && !host(u.hostname.toLowerCase())) return null
  return u.toString()
}

const isScholarHost = (h: string) => h === 'scholar.google.com'

export function validateEdit(input: unknown): Validated {
  const errors: FieldErrors = {}
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { ok: false, errors: { form: 'not-an-object' } }
  const body = input as Record<string, unknown>

  // Allow-list first: a request carrying anything else is refused whole, so a crafted body cannot slip a field through.
  for (const key of Object.keys(body)) {
    if (!(EDITABLE_KEYS as readonly string[]).includes(key)) {
      errors[key] = (HIGH_IMPACT_KEYS as readonly string[]).includes(key) ? 'read-only' : 'unknown'
    }
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const text = (key: string, multiline: boolean, max: number): string => {
    const v = clean(body[key], multiline)
    if (v === null) {
      errors[key] = 'invalid'
      return ''
    }
    if ([...v].length > max) errors[key] = 'too-long'
    return v
  }

  // bio
  const bioIn = body.bio
  let bio = { en: '', ur: '' }
  if (typeof bioIn !== 'object' || bioIn === null || Array.isArray(bioIn)) errors.bio = 'invalid'
  else {
    const b = bioIn as Record<string, unknown>
    const extra = Object.keys(b).filter((k) => k !== 'en' && k !== 'ur')
    if (extra.length > 0) errors.bio = 'invalid'
    const en = clean(b.en, true)
    const ur = clean(b.ur, true)
    if (en === null || ur === null) errors.bio = 'invalid'
    else {
      if ([...en].length > LIMITS.bio || [...ur].length > LIMITS.bio) errors.bio = 'too-long'
      bio = { en, ur }
    }
  }

  // research interests: a list of short tags, no duplicates (case-insensitive), empties dropped
  let researchInterests: string[] = []
  if (!Array.isArray(body.researchInterests)) errors.researchInterests = 'invalid'
  else {
    const seen = new Set<string>()
    for (const item of body.researchInterests) {
      const t = clean(item, false)
      if (t === null) {
        errors.researchInterests = 'invalid'
        break
      }
      if (t === '') continue
      if ([...t].length > LIMITS.interest) {
        errors.researchInterests = 'too-long'
        break
      }
      const k = t.toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      researchInterests.push(t)
    }
    if (researchInterests.length > LIMITS.interests) errors.researchInterests = 'too-many'
    if (errors.researchInterests) researchInterests = []
  }

  const officeLocation = text('officeLocation', false, LIMITS.officeLocation)
  const officeHours = text('officeHours', false, LIMITS.officeHours)

  let orcid = ''
  const orcidRaw = clean(body.orcid, false)
  if (orcidRaw === null) errors.orcid = 'invalid'
  else if (orcidRaw !== '') {
    const n = normaliseOrcid(orcidRaw)
    if (n === null) errors.orcid = 'invalid'
    else orcid = n
  }

  const url = (key: 'scholarUrl' | 'cvLink', host?: (h: string) => boolean): string => {
    const raw = clean(body[key], false)
    if (raw === null) {
      errors[key] = 'invalid'
      return ''
    }
    if (raw === '') return ''
    const ok = safeHttpsUrl(raw, host)
    if (ok === null) errors[key] = 'invalid'
    return ok ?? ''
  }
  const scholarUrl = url('scholarUrl', isScholarHost)
  const cvLink = url('cvLink')

  // visibility: exactly email and photo, each one of the three choices
  const vis = body.visibility
  let visibility: ProfileEdit['visibility'] = { email: 'hidden', photo: 'hidden' }
  if (typeof vis !== 'object' || vis === null || Array.isArray(vis)) errors.visibility = 'invalid'
  else {
    const v = vis as Record<string, unknown>
    const okChoice = (x: unknown): x is Visibility => typeof x === 'string' && (VISIBILITIES as readonly string[]).includes(x)
    if (Object.keys(v).some((k) => k !== 'email' && k !== 'photo') || !okChoice(v.email) || !okChoice(v.photo)) errors.visibility = 'invalid'
    else visibility = { email: v.email, photo: v.photo }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, edit: { bio, researchInterests, officeLocation, officeHours, orcid, scholarUrl, cvLink, visibility } }
}

/** What the public would see if this profile were published. `internal` fields are for signed-in members, so not here. */
export type Preview = {
  name: Profile['name']
  designation: Profile['designation']
  department: string
  bio: Profile['bio']
  researchInterests: string[]
  officeLocation: string
  officeHours: string
  orcid: string
  scholarUrl: string
  cvLink: string
  email: string | null
  showPhoto: boolean
  sample: boolean
}

export function buildPreview(p: Profile): Preview {
  return {
    name: p.name,
    designation: p.designation,
    department: p.department,
    bio: p.bio,
    researchInterests: p.researchInterests,
    officeLocation: p.officeLocation,
    officeHours: p.officeHours,
    orcid: p.orcid,
    scholarUrl: p.scholarUrl,
    cvLink: p.cvLink,
    email: p.visibility.email === 'public' ? p.email : null,
    showPhoto: p.visibility.photo === 'public',
    sample: p.sample,
  }
}

/** Fields that differ between two edits; used to tell the person what the reviewer will see changed. */
export function changedFields(a: ProfileEdit, b: ProfileEdit): string[] {
  const out: string[] = []
  if (a.bio.en !== b.bio.en || a.bio.ur !== b.bio.ur) out.push('bio')
  if (a.researchInterests.join('\u0000') !== b.researchInterests.join('\u0000')) out.push('researchInterests')
  for (const k of ['officeLocation', 'officeHours', 'orcid', 'scholarUrl', 'cvLink'] as const) if (a[k] !== b[k]) out.push(k)
  if (a.visibility.email !== b.visibility.email || a.visibility.photo !== b.visibility.photo) out.push('visibility')
  return out
}
