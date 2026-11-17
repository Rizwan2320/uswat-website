/**
 * Workflow policy: who may move a record between states, and what a save must look like.
 *
 * Pure functions, no Payload imports. The collection `beforeChange` hook is a thin adapter
 * around `evaluateSave`, so every rule here is covered by unit tests without a database.
 *
 * Rules (plan v2 7.3, Addendum 7, brief docs/briefs/p3a-governance-roles-workflow-audit.md):
 * - Strict steps: draft > in review > approved > published > archived. Reviewers may also go
 *   draft > approved, and may approve and publish in one save.
 * - A reviewer for a record is: platform admin; an approver whose offices include the record's
 *   owner office; a site manager when the record is not high-impact.
 * - VER-01: publishing needs verification status "verified". Only a reviewer sets it; the
 *   system (importer, jobs) never does.
 * - Content edits by a non-reviewer drop an in-review or approved record back to draft and a
 *   verified record back to unverified, so approval always refers to the content that was seen.
 */

import {
  RISK_RANK,
  WORKFLOW_LABELS,
  type Actor,
  type RiskClass,
  type VerificationStatus,
  type WorkflowStatus,
} from './roles'

export type PolicyCode =
  | 'ANONYMOUS'
  | 'READ_ONLY_ROLE'
  | 'CREATE_PUBLISHED'
  | 'OWNER_OUT_OF_SCOPE'
  | 'TRANSITION_ILLEGAL'
  | 'TRANSITION_FORBIDDEN'
  | 'NEEDS_PUBLISH_ACTION'
  | 'EDIT_LIVE_NEEDS_REVIEWER'
  | 'VERIFY_FORBIDDEN'
  | 'RISK_LOWER_FORBIDDEN'
  | 'PIN_FORBIDDEN'
  | 'NOT_VERIFIED'
  | 'REVIEW_DATE_REQUIRED'
  | 'OWNER_REQUIRED'
  | 'SOURCE_REQUIRED'
  | 'UNPUBLISH_FORBIDDEN'
  | 'NOT_YOUR_DRAFT'
  | 'DELETE_FORBIDDEN'
  | 'EXPIRY_REQUIRED'

export interface Denial {
  ok: false
  code: PolicyCode
  message: string
  httpStatus: 400 | 403
}

export interface RecordState {
  status: WorkflowStatus
  verification: VerificationStatus
  risk: RiskClass
  ownerOffice: string | null
  /** Where the facts come from (a URL or a named document). Required to publish. */
  source: string | null
  reviewDueAt: string | null
  /** When the record leaves current lists. Some types must have one (LIF-04). */
  expireAt: string | null
  pinned: boolean
  /** Who created the record (contributors may only edit their own drafts). */
  createdBy: string | number | null
}

type Scope = Pick<RecordState, 'ownerOffice' | 'risk'>

const deny = (code: PolicyCode, message: string, httpStatus: 400 | 403 = 403): Denial => ({
  ok: false,
  code,
  message,
  httpStatus,
})

const isUser = (a: Actor): a is Extract<Actor, { kind: 'user' }> => a.kind === 'user'

/** Is the record's owner office one of the actor's offices? Global roles are always in scope. */
export function inScope(actor: Actor, ownerOffice: string | null | undefined): boolean {
  if (!isUser(actor)) return false
  if (actor.role === 'platformAdmin' || actor.role === 'siteManager') return true
  if (actor.role === 'approver' || actor.role === 'editor') {
    return Boolean(ownerOffice) && actor.offices.includes(ownerOffice as string)
  }
  return false
}

/** May this actor approve, publish, archive and verify this record? */
export function isReviewerFor(actor: Actor, rec: Scope): boolean {
  if (!isUser(actor)) return false
  switch (actor.role) {
    case 'platformAdmin':
      return true
    case 'approver':
      return inScope(actor, rec.ownerOffice)
    case 'siteManager':
      return rec.risk !== 'high_impact'
    default:
      return false
  }
}

/** May this actor send a draft to review? Contributors cannot ("drafts only"). */
export function canSubmitFor(actor: Actor, rec: Scope): boolean {
  if (!isUser(actor)) return false
  if (actor.role === 'platformAdmin' || actor.role === 'siteManager') return true
  if (actor.role === 'approver' || actor.role === 'editor') return inScope(actor, rec.ownerOffice)
  return false
}

/** Restoring an archived record is for approvers and platform admins only (Addendum 7). */
export function canRestore(actor: Actor, rec: Scope): boolean {
  if (!isUser(actor)) return false
  if (actor.role === 'platformAdmin') return true
  return actor.role === 'approver' && inScope(actor, rec.ownerOffice)
}

const stage = (s: WorkflowStatus): string => WORKFLOW_LABELS[s] ?? s

const NEXT_STATES: Record<WorkflowStatus, WorkflowStatus[]> = {
  draft: ['in_review', 'approved'],
  in_review: ['draft', 'approved'],
  approved: ['draft', 'published'],
  published: ['archived'],
  archived: ['published'],
}

/** Check one workflow move. Returns null when allowed. */
export function checkTransition(
  actor: Actor,
  rec: Scope,
  from: WorkflowStatus,
  to: WorkflowStatus,
): Denial | null {
  if (!NEXT_STATES[from].includes(to)) {
    return deny(
      'TRANSITION_ILLEGAL',
      `This cannot move from ${stage(from)} to ${stage(to)}. From ${stage(from)} the next step is ${NEXT_STATES[from].map(stage).join(' or ')}.`,
      400,
    )
  }
  const system = actor.kind === 'system'
  const reviewer = isReviewerFor(actor, rec)
  const forbidden = (who: string): Denial =>
    deny('TRANSITION_FORBIDDEN', `Moving this from ${stage(from)} to ${stage(to)} needs ${who}.`)

  switch (`${from}>${to}`) {
    case 'draft>in_review':
      return canSubmitFor(actor, rec)
        ? null
        : forbidden(
            'an editor or approver of the owning office, a site manager or a platform admin (contributors can only save drafts)',
          )
    case 'in_review>draft':
    case 'approved>draft':
    case 'draft>approved':
    case 'in_review>approved':
      return reviewer
        ? null
        : forbidden(
            'a reviewer: an approver of the owning office, a platform admin, or a site manager for items that are not High impact',
          )
    case 'approved>published':
    case 'published>archived':
      return reviewer || system
        ? null
        : forbidden(
            'a reviewer: an approver of the owning office, a platform admin, or a site manager for items that are not High impact',
          )
    case 'archived>published':
      return canRestore(actor, rec)
        ? null
        : forbidden('an approver of the owning office or a platform admin')
    default:
      return deny(
        'TRANSITION_ILLEGAL',
        `This cannot move from ${stage(from)} to ${stage(to)}.`,
        400,
      )
  }
}

export interface SaveInput {
  operation: 'create' | 'update'
  actor: Actor
  /** True when the save publishes (Payload `_status` is "published"). */
  publishing: boolean
  /** The record before this save (null on create). */
  prev: RecordState | null
  /** The values requested by this save, merged over `prev`. */
  next: RecordState
  /** Did the content fields change in this save? */
  contentChanged: boolean
  /**
   * True when the request takes published content offline (Payload's Unpublish button),
   * as opposed to saving a draft revision over it. Needs a reviewer.
   */
  unpublishing?: boolean
  /**
   * Jobs, tenders, events and admissions must carry an expiry (LIF-04). Judged once the record
   * leaves Draft: a draft may be saved without one, submitting or publishing may not.
   */
  expiryRequired?: boolean
  /** ISO time, injected so tests are deterministic. */
  now: string
}

export interface SaveValues {
  status: WorkflowStatus
  verification: VerificationStatus
  /** Set only when the record becomes verified in this save. */
  verifiedAt?: string
  risk: RiskClass
  pinned: boolean
}

export type SaveOutcome = { ok: true; values: SaveValues; notes: string[] } | Denial

const higherRisk = (a: RiskClass, b: RiskClass): RiskClass => (RISK_RANK[a] >= RISK_RANK[b] ? a : b)

export function evaluateSave(input: SaveInput): SaveOutcome {
  const outcome = evaluateCore(input)
  if (
    outcome.ok &&
    input.expiryRequired &&
    outcome.values.status !== 'draft' &&
    !input.next.expireAt
  ) {
    return deny(
      'EXPIRY_REQUIRED',
      'This type of item needs a "Take down on" date before it can be sent for review, approved or published.',
      400,
    )
  }
  return outcome
}

function evaluateCore(input: SaveInput): SaveOutcome {
  const { actor } = input
  if (actor.kind === 'anonymous') {
    return deny('ANONYMOUS', 'You are not signed in. Sign in again to change content.')
  }
  if (isUser(actor) && actor.role === 'auditor') {
    return deny('READ_ONLY_ROLE', 'Your role (auditor) can read content but not change it.')
  }
  return input.operation === 'create' || !input.prev
    ? evaluateCreate(input)
    : evaluateUpdate({ ...input, prev: input.prev })
}

function evaluateCreate(input: SaveInput): SaveOutcome {
  const { actor, publishing, next, now } = input
  const notes: string[] = []

  if (publishing) {
    return deny(
      'CREATE_PUBLISHED',
      'A new item cannot start as Published. Save it as a draft, then send it for review, approve it and publish it.',
      400,
    )
  }
  if (
    isUser(actor) &&
    (actor.role === 'approver' || actor.role === 'editor') &&
    !inScope(actor, next.ownerOffice)
  ) {
    return deny('OWNER_OUT_OF_SCOPE', 'You can only create items for an office you belong to.')
  }

  const reviewer = isReviewerFor(actor, next)
  let risk = next.risk
  if (!reviewer && RISK_RANK[risk] < RISK_RANK.standard) {
    risk = 'standard'
    notes.push('risk_raised_to_standard')
  }

  const values: SaveValues = {
    status: 'draft',
    verification: 'unverified',
    risk,
    pinned: next.pinned && reviewer,
  }
  if (next.status !== 'draft') notes.push('status_reset_to_draft')
  if (next.verification === 'verified' && reviewer) {
    values.verification = 'verified'
    values.verifiedAt = now
  } else if (next.verification !== 'unverified') {
    notes.push('verification_reset')
  }
  if (next.pinned && !reviewer) notes.push('pin_ignored')
  return { ok: true, values, notes }
}

function evaluateUpdate(input: SaveInput & { prev: RecordState }): SaveOutcome {
  const { actor, publishing, prev, next, contentChanged, now } = input
  const notes: string[] = []

  // Scope is judged on the latest saved state of the record (`prev`), not on the published
  // row: draft saves never touch the published row, so database-level filters see stale data.
  if (isUser(actor)) {
    if (
      (actor.role === 'approver' || actor.role === 'editor') &&
      !inScope(actor, prev.ownerOffice)
    ) {
      return deny('OWNER_OUT_OF_SCOPE', 'This item belongs to another office.')
    }
    if (
      actor.role === 'contributor' &&
      (prev.createdBy == null ||
        String(prev.createdBy) !== String(actor.id) ||
        prev.status !== 'draft')
    ) {
      return deny(
        'NOT_YOUR_DRAFT',
        'Contributors can only edit drafts they created, until a reviewer takes over.',
      )
    }
  }

  const scope: Scope = { ownerOffice: prev.ownerOffice, risk: higherRisk(prev.risk, next.risk) }
  const reviewer = isReviewerFor(actor, scope)
  const reviewerOnPrev = isReviewerFor(actor, { ownerOffice: prev.ownerOffice, risk: prev.risk })

  // Handing a record to an office the actor is not in.
  if (
    isUser(actor) &&
    (actor.role === 'approver' || actor.role === 'editor') &&
    next.ownerOffice !== prev.ownerOffice &&
    !inScope(actor, next.ownerOffice)
  ) {
    return deny('OWNER_OUT_OF_SCOPE', 'You cannot move an item to an office you do not belong to.')
  }
  // Only a reviewer may lower the risk class (otherwise anyone could downgrade a fee notice).
  if (RISK_RANK[next.risk] < RISK_RANK[prev.risk] && !reviewerOnPrev) {
    return deny('RISK_LOWER_FORBIDDEN', 'Only a reviewer can lower "How sensitive is it?".')
  }
  if (next.pinned !== prev.pinned && !reviewer) {
    return deny('PIN_FORBIDDEN', 'Only a reviewer can change "Keep in current lists".')
  }

  // Verification (VER-01 needs a human reviewer).
  let verification = next.verification
  let verifiedAt: string | undefined
  if (next.verification !== prev.verification) {
    if (next.verification === 'verified') {
      if (!reviewer) {
        return deny(
          'VERIFY_FORBIDDEN',
          'Only a reviewer (a person, never an import or a job) can set Fact-check to Verified.',
        )
      }
      verifiedAt = now
    } else if (!(reviewer || actor.kind === 'system')) {
      return deny('VERIFY_FORBIDDEN', 'Only a reviewer can change Fact-check.')
    }
  }

  let status: WorkflowStatus

  if (publishing) {
    const target: WorkflowStatus = next.status === 'archived' ? 'archived' : 'published'

    if (prev.status === target) {
      if (target === 'published' && contentChanged && !reviewer) {
        return deny(
          'EDIT_LIVE_NEEDS_REVIEWER',
          'Changes to published content are saved as a draft first, then go through review, approval and publishing.',
        )
      }
    } else if (
      target === 'published' &&
      next.status === 'approved' &&
      (prev.status === 'draft' || prev.status === 'in_review')
    ) {
      // Approve and publish in one save: both steps must be allowed.
      const approve = checkTransition(actor, scope, prev.status, 'approved')
      if (approve) return approve
      const publish = checkTransition(actor, scope, 'approved', 'published')
      if (publish) return publish
    } else {
      const move = checkTransition(actor, scope, prev.status, target)
      if (move) return move
    }
    status = target

    const newlyLive = status === 'published' && !(prev.status === 'published' && !contentChanged)
    if (newlyLive) {
      // VER-01: nothing unverified is ever shown as official.
      if (verification !== 'verified') {
        return deny(
          'NOT_VERIFIED',
          'This cannot be published yet: Fact-check is not Verified. A reviewer must verify it, with its source, first.',
          400,
        )
      }
      if (!next.ownerOffice) {
        return deny(
          'OWNER_REQUIRED',
          'Fill in Owner office before publishing, so someone is accountable for it.',
          400,
        )
      }
      if (!next.source?.trim()) {
        return deny('SOURCE_REQUIRED', 'Fill in "Source of the facts" before publishing.', 400)
      }
      if (scope.risk === 'high_impact' && !next.reviewDueAt) {
        return deny(
          'REVIEW_DATE_REQUIRED',
          'Fill in "Check again by" before publishing a High impact item.',
          400,
        )
      }
    }
  } else {
    if (input.unpublishing && !reviewerOnPrev && actor.kind !== 'system') {
      return deny(
        'UNPUBLISH_FORBIDDEN',
        'Taking published content offline needs a reviewer: an approver of the owning office, a platform admin, or a site manager for items that are not High impact.',
      )
    }
    let requested = next.status
    if (requested === 'published' || requested === 'archived') {
      if (requested === prev.status) {
        requested = 'draft' // saving a draft revision of live content
      } else {
        return deny(
          'NEEDS_PUBLISH_ACTION',
          'Publishing and archiving take effect immediately. Use the Publish changes button for this.',
          400,
        )
      }
    }
    const effectivePrev: WorkflowStatus =
      prev.status === 'published' || prev.status === 'archived' ? 'draft' : prev.status

    if (requested !== effectivePrev) {
      const move = checkTransition(actor, scope, effectivePrev, requested)
      if (move) return move
    } else if (
      !reviewer &&
      contentChanged &&
      (effectivePrev === 'in_review' || effectivePrev === 'approved')
    ) {
      requested = 'draft'
      notes.push('approval_invalidated')
    }
    status = requested
  }

  if (
    !reviewer &&
    contentChanged &&
    prev.verification === 'verified' &&
    verification === 'verified'
  ) {
    verification = 'unverified'
    verifiedAt = undefined
    notes.push('verification_invalidated')
  }

  const values: SaveValues = { status, verification, risk: next.risk, pinned: next.pinned }
  if (verifiedAt && verification === 'verified') values.verifiedAt = verifiedAt
  return { ok: true, values, notes }
}

/**
 * Deleting (slice 3q).
 *  - A DRAFT that has never been published may be deleted by whoever may edit it: an editor or approver
 *    of the owning office, a contributor for a draft they created, a site manager, a platform admin.
 *    It was never public, so nothing is lost but the draft. (Stage Draft is only ever the stage of a
 *    record that has never been published; published goes only to archived.) The stage field alone is
 *    not trusted: `everPublished` is true when any saved version of the record was published, and such a
 *    record counts as having left Draft whatever its stage says.
 *  - Anything that has left Draft (in review, approved, published, archived): platform admin always,
 *    site manager unless High impact, the system for jobs. Nobody else.
 */
export function checkDelete(
  actor: Actor,
  rec: Pick<RecordState, 'risk' | 'status' | 'ownerOffice' | 'createdBy'>,
  everPublished = false,
): Denial | null {
  if (actor.kind === 'system') return null
  if (!isUser(actor)) return deny('ANONYMOUS', 'You must be signed in to delete content.')
  if (actor.role === 'platformAdmin') return null
  if (rec.status === 'draft' && !everPublished) {
    if (actor.role === 'siteManager') return null
    if (actor.role === 'editor' || actor.role === 'approver') {
      return inScope(actor, rec.ownerOffice)
        ? null
        : deny('OWNER_OUT_OF_SCOPE', 'This draft belongs to another office.')
    }
    if (actor.role === 'contributor') {
      return rec.createdBy != null && String(rec.createdBy) === String(actor.id)
        ? null
        : deny('NOT_YOUR_DRAFT', 'Contributors can only delete drafts they created.')
    }
    return deny('DELETE_FORBIDDEN', 'Your role cannot delete content.')
  }
  if (actor.role === 'siteManager' && rec.risk !== 'high_impact') return null
  const state = rec.status === 'draft' ? 'published' : stage(rec.status).toLowerCase()
  return deny(
    'DELETE_FORBIDDEN',
    `You can delete a draft, but not an item that is ${state}. Ask a reviewer to archive it, or a platform admin to delete it (site managers cannot delete High impact items).`,
  )
}
