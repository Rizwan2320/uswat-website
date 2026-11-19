/** Rules for the courses list (FP-30). Pure; the store trusts what `validateCourse` returns. */
import { SEASONS, type CourseInput, type Season } from './types'

export const LIMITS = { code: 20, title: 200, programme: 120, perAccount: 60, minYear: 2000 } as const
export type CourseErrors = Partial<Record<'code' | 'title' | 'semester' | 'programme' | 'form', string>>

const CONTROL = /[\u0000-\u001F\u007F-\u009F‪-‮⁦-⁩]/g
const clean = (v: unknown): string | null => (typeof v === 'string' ? v.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim() : null)

export function validateCourse(input: unknown, now: number): { ok: true; course: CourseInput } | { ok: false; errors: CourseErrors } {
  const errors: CourseErrors = {}
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { ok: false, errors: { form: 'invalid' } }
  const b = input as Record<string, unknown>
  const allowed = ['code', 'title', 'season', 'year', 'programme']
  if (Object.keys(b).some((k) => !allowed.includes(k))) return { ok: false, errors: { form: 'unknown' } }

  const code = clean(b.code)
  if (code === null || code.length < 2 || code.length > LIMITS.code || !/^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(code)) errors.code = 'invalid'
  const title = clean(b.title)
  if (title === null || title === '') errors.title = 'invalid'
  else if ([...title].length > LIMITS.title) errors.title = 'too-long'
  const programme = clean(b.programme)
  if (programme === null) errors.programme = 'invalid'
  else if ([...programme].length > LIMITS.programme) errors.programme = 'too-long'

  const maxYear = new Date(now).getUTCFullYear() + 2
  if (typeof b.season !== 'string' || !(SEASONS as readonly string[]).includes(b.season) || typeof b.year !== 'number' || !Number.isInteger(b.year) || b.year < LIMITS.minYear || b.year > maxYear) errors.semester = 'invalid'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, course: { code: code!.toUpperCase(), title: title!, season: b.season as Season, year: b.year as number, programme: programme! } }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isCourseId = (v: unknown): v is string => typeof v === 'string' && UUID.test(v)
