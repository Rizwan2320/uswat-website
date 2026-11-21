/** Pure rules for the reviewer queue: the decision input, and the field-by-field comparison. */
import type { ProfileEdit } from '../profile/types'
import { DECISIONS, type DecideInput, type Decision } from './types'

export const NOTE_MAX = 500
export const DEPARTMENT_MAX = 80
/** Control and bidi-override characters (the same set the profile rules refuse), except the newline. */
const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F‪-‮⁦-⁩]/
const ID = /^[A-Za-z0-9_-]{1,64}$/

export const isSubjectId = (v: unknown): v is string => typeof v === 'string' && ID.test(v)

export type DecisionErrors = Partial<Record<'subjectId' | 'rev' | 'decision' | 'note' | 'keys', string>>
export type ValidatedDecision = { ok: true; value: DecideInput } | { ok: false; errors: DecisionErrors }

const KEYS = ['subjectId', 'rev', 'decision', 'note'] as const

/**
 * Allow-list: exactly these keys. Anything else (a reviewer id, a department, a role) is refused whole, as in the profile rules,
 * so a crafted request cannot smuggle in who it acts as. A note is required to ask for changes and must be absent to approve.
 */
export function validateDecision(input: unknown): ValidatedDecision {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { ok: false, errors: { keys: 'not an object' } }
  const o = input as Record<string, unknown>
  const extra = Object.keys(o).filter((k) => !(KEYS as readonly string[]).includes(k))
  if (extra.length > 0) return { ok: false, errors: { keys: 'unknown field' } }
  const errors: DecisionErrors = {}
  if (!isSubjectId(o.subjectId)) errors.subjectId = 'invalid'
  if (typeof o.rev !== 'number' || !Number.isSafeInteger(o.rev) || o.rev < 1) errors.rev = 'invalid'
  const decision = o.decision as Decision
  if (!DECISIONS.includes(decision)) errors.decision = 'invalid'
  let note: string | null = null
  if (o.note !== undefined && o.note !== null && typeof o.note !== 'string') errors.note = 'invalid'
  else if (typeof o.note === 'string') {
    const t = o.note.replace(/\r\n?/g, '\n').trim()
    if (CONTROL.test(t)) errors.note = 'control'
    else if ([...t].length > NOTE_MAX) errors.note = 'long'
    else note = t === '' ? null : t
  }
  if (!errors.decision) {
    if (decision === 'changes-requested' && note === null && !errors.note) errors.note = 'required'
    if (decision === 'approved' && note !== null) errors.note = 'unexpected'
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { subjectId: o.subjectId as string, rev: o.rev as number, decision, note } }
}

/** A department name as stored: trimmed, inner spaces collapsed, no control characters, 1 to 80 characters. Null if unusable. */
export function normaliseDepartment(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const t = raw.replace(/\s+/g, ' ').trim()
  if (t === '' || CONTROL.test(t) || t.includes('\n') || [...t].length > DEPARTMENT_MAX) return null
  return t
}

export type ChangeField = 'bioEn' | 'bioUr' | 'researchInterests' | 'officeLocation' | 'officeHours' | 'orcid' | 'scholarUrl' | 'cvLink' | 'emailVisibility' | 'photoVisibility'
export type FieldChange = { field: ChangeField; before: string; after: string }

const NOTHING: ProfileEdit = {
  bio: { en: '', ur: '' },
  researchInterests: [],
  officeLocation: '',
  officeHours: '',
  orcid: '',
  scholarUrl: '',
  cvLink: '',
  visibility: { email: 'hidden', photo: 'hidden' },
}

/** Every editable field that differs, with both values as text. A missing published edit counts as nothing published. */
export function compareEdits(before: ProfileEdit | null, after: ProfileEdit): FieldChange[] {
  const a = before ?? NOTHING
  const rows: Array<[ChangeField, string, string]> = [
    ['bioEn', a.bio.en, after.bio.en],
    ['bioUr', a.bio.ur, after.bio.ur],
    ['researchInterests', a.researchInterests.join(', '), after.researchInterests.join(', ')],
    ['officeLocation', a.officeLocation, after.officeLocation],
    ['officeHours', a.officeHours, after.officeHours],
    ['orcid', a.orcid, after.orcid],
    ['scholarUrl', a.scholarUrl, after.scholarUrl],
    ['cvLink', a.cvLink, after.cvLink],
    ['emailVisibility', a.visibility.email, after.visibility.email],
    ['photoVisibility', a.visibility.photo, after.visibility.photo],
  ]
  // Interests compare as a list, so ["a, b"] and ["a","b"] are not mistaken for each other.
  const sameList = a.researchInterests.length === after.researchInterests.length && a.researchInterests.every((v, i) => v === after.researchInterests[i])
  return rows
    .filter(([f, x, y]) => (f === 'researchInterests' ? !sameList : x !== y))
    .map(([field, b, c]) => ({ field, before: b, after: c }))
}
