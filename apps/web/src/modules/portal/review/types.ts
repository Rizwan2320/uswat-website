/**
 * The department reviewer queue (FP-03 reviewer half, FPR-04, PJ4). Shapes only; no I/O.
 * Every id that identifies the reviewer comes from the session. The request carries the subject, the revision seen and the decision.
 */
import type pg from 'pg'

import type { ProfileEdit } from '../profile/types'

export type Decision = 'approved' | 'changes-requested'
export const DECISIONS: readonly Decision[] = ['approved', 'changes-requested']

export type QueueItem = {
  subjectId: string
  name: string
  submittedAt: number
  rev: number
  /** How many editable fields differ from what is published. */
  changes: number
  /** Nothing has been published for this person yet. */
  firstPublication: boolean
}

export type ReviewDetail = {
  subjectId: string
  name: string
  department: string
  rev: number
  submittedAt: number
  /** The currently published edit, or null if nothing has been published. */
  before: ProfileEdit | null
  after: ProfileEdit
  /** True for dummy data; drives the "Sample" label. */
  sample: boolean
}

export type DecideInput = { subjectId: string; rev: number; decision: Decision; note: string | null }

/**
 * 'forbidden': not a reviewer, other department, the reviewer's own profile, or an unknown person (never told apart).
 * 'stale': the draft is no longer submitted at that revision (withdrawn, edited, or already decided).
 */
export type DecideOutcome = 'ok' | 'forbidden' | 'stale'

/**
 * Writes the approved edit where the public site reads it, inside the decision's transaction.
 * Today: a sample table. Later: People through the content service (origin `faculty`) with tag invalidation, behind this same signature.
 */
export type Publisher = (tx: pg.PoolClient, p: { subjectId: string; edit: ProfileEdit; reviewerId: string; at: Date }) => Promise<void>

export interface ReviewStore {
  isReviewer(userId: string): Promise<boolean>
  /** Submitted drafts in the reviewer's own department, oldest first, never the reviewer's own. Empty for a non-reviewer. */
  listQueue(reviewerId: string): Promise<QueueItem[]>
  /** One submitted draft, or null when it is not available to this reviewer (all the reasons look the same). */
  load(reviewerId: string, subjectId: string): Promise<ReviewDetail | null>
  decide(reviewerId: string, input: DecideInput, now: number): Promise<DecideOutcome>
}
