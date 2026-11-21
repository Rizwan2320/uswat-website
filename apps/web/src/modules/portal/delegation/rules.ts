import { SECTIONS, MAX_DAYS, type GrantInput, type Section } from './types'

const EMAIL = /^[^\s@<>()"',;:\\]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,}$/
const KEYS = ['delegateEmail', 'sections', 'days'] as const
export type GrantErrors = Partial<Record<'keys' | 'delegateEmail' | 'sections' | 'days', string>>
export type ValidatedGrant = { ok: true; value: GrantInput } | { ok: false; errors: GrantErrors }

/** Allow-list: exactly an address, a non-empty set of known sections, and 1 to 90 whole days. Anything else is refused whole. */
export function validateGrant(input: unknown): ValidatedGrant {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { ok: false, errors: { keys: 'not an object' } }
  const o = input as Record<string, unknown>
  if (Object.keys(o).some((k) => !(KEYS as readonly string[]).includes(k))) return { ok: false, errors: { keys: 'unknown field' } }
  const errors: GrantErrors = {}
  const email = typeof o.delegateEmail === 'string' ? o.delegateEmail.trim() : ''
  if (!EMAIL.test(email)) errors.delegateEmail = 'invalid'
  const sections = Array.isArray(o.sections) ? (o.sections as unknown[]) : null
  if (!sections || sections.length < 1 || sections.length > SECTIONS.length || sections.some((s) => !SECTIONS.includes(s as Section)) || new Set(sections).size !== sections.length) errors.sections = 'invalid'
  if (typeof o.days !== 'number' || !Number.isInteger(o.days) || o.days < 1 || o.days > MAX_DAYS) errors.days = 'invalid'
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { delegateEmail: email.toLowerCase(), sections: SECTIONS.filter((s) => (sections as unknown[]).includes(s)), days: o.days as number } }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isGrantId = (v: unknown): v is string => typeof v === 'string' && UUID.test(v)
