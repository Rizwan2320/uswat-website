import { isSubjectId } from '../review/rules'
import { ACTIVATION_DECISIONS, type ActivationDecision, type ActivationInput } from './types'

export type ValidatedActivation = { ok: true; value: ActivationInput } | { ok: false }

/** Allow-list: exactly `subjectId` and `decision`. A reviewer id, a department or a status in the request is refused whole. */
export function validateActivation(input: unknown): ValidatedActivation {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { ok: false }
  const o = input as Record<string, unknown>
  if (Object.keys(o).some((k) => k !== 'subjectId' && k !== 'decision')) return { ok: false }
  if (!isSubjectId(o.subjectId) || !ACTIVATION_DECISIONS.includes(o.decision as ActivationDecision)) return { ok: false }
  return { ok: true, value: { subjectId: o.subjectId, decision: o.decision as ActivationDecision } }
}
