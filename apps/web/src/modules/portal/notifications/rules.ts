import { isCadence, type Cadence } from './kinds'

export type PrefErrors = Partial<Record<'keys' | 'cadence', string>>
/** Allow-list: exactly `{ cadence }`, one of daily, weekly, off. */
export function validatePref(input: unknown): { ok: true; value: Cadence } | { ok: false; errors: PrefErrors } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { ok: false, errors: { keys: 'not an object' } }
  const o = input as Record<string, unknown>
  if (Object.keys(o).some((k) => k !== 'cadence')) return { ok: false, errors: { keys: 'unknown field' } }
  return isCadence(o.cadence) ? { ok: true, value: o.cadence } : { ok: false, errors: { cadence: 'invalid' } }
}
