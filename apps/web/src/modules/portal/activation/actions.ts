'use server'
import { activationService } from './wiring'
import type { ActivateResult } from './service'

/** Re-runs the full page guard; the head is taken from the session, and the request carries only the subject and the decision. */
export async function decideActivation(input: unknown): Promise<ActivateResult> {
  return activationService('/portal/activate').decide(input)
}
