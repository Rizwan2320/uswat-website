/** Input rules for the Registrar's screen. Pure. Everything is checked again by the service; the form only shows the answer. */
import { normaliseDepartment } from '../review/rules'
import { DEPARTURE_OUTCOMES, type FixedValues, type LeaveInput } from './types'

export const NAME_MAX = 120
export const SOURCE_MIN = 5
export const SOURCE_MAX = 300
export const SEARCH_MAX = 80
// Same set as the review rules: C0 and C1 controls and the bidirectional overrides, which can make text read differently from how it is stored.
const CONTROL = /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/

export type FixedErrors = Partial<Record<'designationEn' | 'designationUr' | 'nameUr' | 'department' | 'source' | 'subject' | 'outcome' | 'confirm', 'required' | 'tooLong' | 'invalid' | 'tooShort'>>

export const isSubjectId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(v)

function text(v: unknown, max: number): string | null | 'bad' {
  if (v === undefined || v === null) return null
  if (typeof v !== 'string') return 'bad'
  const t = v.replace(/\s+/g, ' ').trim()
  if (t === '') return null
  if (CONTROL.test(t)) return 'bad'
  return [...t].length > max ? 'bad' : t
}

export function validateSave(input: unknown): { ok: true; value: { subjectId: string; values: FixedValues; source: string } } | { ok: false; errors: FixedErrors } {
  const o = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>
  const errors: FixedErrors = {}
  if (!isSubjectId(o.subjectId)) errors.subject = 'invalid'
  const en = text(o.designationEn, NAME_MAX)
  if (en === null) errors.designationEn = 'required'
  else if (en === 'bad') errors.designationEn = typeof o.designationEn === 'string' && [...o.designationEn].length > NAME_MAX ? 'tooLong' : 'invalid'
  const ur = text(o.designationUr, NAME_MAX)
  if (ur === 'bad') errors.designationUr = 'invalid'
  const nameUr = text(o.nameUr, NAME_MAX)
  if (nameUr === 'bad') errors.nameUr = 'invalid'
  const dept = normaliseDepartment(o.department)
  if (dept === null) errors.department = o.department === '' || o.department === undefined ? 'required' : 'invalid'
  const source = text(o.source, SOURCE_MAX)
  if (source === null || source === 'bad') errors.source = source === 'bad' ? 'invalid' : 'required'
  else if ([...source].length < SOURCE_MIN) errors.source = 'tooShort'
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: {
      subjectId: o.subjectId as string,
      values: { designationEn: en as string, designationUr: ur as string | null, nameUr: nameUr as string | null, department: dept as string },
      source: source as string,
    },
  }
}

export const FIELD_LABELS = ['designationEn', 'designationUr', 'nameUr', 'department'] as const

/** Which of the four fields differ. A department that differs only in letter case is not a change (matching elsewhere ignores case). */
export function changedFields(before: FixedValues | null, after: FixedValues): string[] {
  if (!before) return [...FIELD_LABELS]
  const out: string[] = []
  if (before.designationEn !== after.designationEn) out.push('designationEn')
  if ((before.designationUr ?? '') !== (after.designationUr ?? '')) out.push('designationUr')
  if ((before.nameUr ?? '') !== (after.nameUr ?? '')) out.push('nameUr')
  if (before.department.toLowerCase() !== after.department.toLowerCase()) out.push('department')
  return out
}

/** The "Mark as left" input: who, which outcome, the document it rests on, and the ticked confirmation. Nothing else is read. */
export function validateLeave(input: unknown): { ok: true; value: LeaveInput } | { ok: false; errors: FixedErrors } {
  const o = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>
  const errors: FixedErrors = {}
  if (!isSubjectId(o.subjectId)) errors.subject = 'invalid'
  const outcome = DEPARTURE_OUTCOMES.find((x) => x === o.outcome)
  if (!outcome) errors.outcome = o.outcome === undefined || o.outcome === '' ? 'required' : 'invalid'
  if (o.confirmed !== true) errors.confirm = 'required'
  const source = text(o.source, SOURCE_MAX)
  if (source === null || source === 'bad') errors.source = source === 'bad' ? 'invalid' : 'required'
  else if ([...source].length < SOURCE_MIN) errors.source = 'tooShort'
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { subjectId: o.subjectId as string, outcome: outcome as LeaveInput['outcome'], source: source as string } }
}
