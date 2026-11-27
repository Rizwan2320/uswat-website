'use server'
/**
 * The one reviewer action. It re-runs the full page guard (strong session, lifetime, second factor, freshness) and takes the
 * reviewer from the session only; the request carries the subject, the revision seen, the decision and the note, nothing else.
 */
import { sendAfterApproval } from '../bridge/wiring'
import { reviewService } from './wiring'
import type { DecideResult } from './service'

export async function decideProfile(input: unknown): Promise<DecideResult> {
  const result = await reviewService('/portal/review').decide(input)
  // An approval is complete once it is committed; the send to the public site follows and can fail without undoing it.
  if (result.ok && result.decision === 'approved') {
    const subject = (input as { subjectId?: unknown }).subjectId
    if (typeof subject === 'string') await sendAfterApproval(subject)
  }
  return result
}
