'use server'
/**
 * The one reviewer action. It re-runs the full page guard (strong session, lifetime, second factor, freshness) and takes the
 * reviewer from the session only; the request carries the subject, the revision seen, the decision and the note, nothing else.
 */
import { reviewService } from './wiring'
import type { DecideResult } from './service'

export async function decideProfile(input: unknown): Promise<DecideResult> {
  return reviewService('/portal/review').decide(input)
}
