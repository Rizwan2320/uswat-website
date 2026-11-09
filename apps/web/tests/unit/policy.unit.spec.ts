import { describe, expect, it } from 'vitest'

import {
  canRestore,
  canSubmitFor,
  checkDelete,
  checkTransition,
  evaluateSave,
  inScope,
  isReviewerFor,
  type RecordState,
  type SaveInput,
} from '@/governance/policy'
import {
  actorFromRequest,
  actorFromUser,
  type Actor,
  type WorkflowStatus,
} from '@/governance/roles'

const NOW = '2026-11-09T10:00:00.000Z'

const user = (
  role: Parameters<typeof actorFromUser>[0]['role'],
  offices: string[] = [],
  id = 1,
): Actor => actorFromUser({ id, role, offices })

const admin = user('platformAdmin', [], 1)
const manager = user('siteManager', [], 2)
const approverIn = user('approver', ['registrar'], 3)
const approverOut = user('approver', ['finance'], 4)
const editorIn = user('editor', ['registrar'], 5)
const editorOut = user('editor', ['finance'], 6)
const contributor = user('contributor', [], 7)
const auditor = user('auditor', [], 8)
const system: Actor = { kind: 'system' }
const anonymous: Actor = { kind: 'anonymous' }

const standard = { ownerOffice: 'registrar', risk: 'standard' as const }
const highImpact = { ownerOffice: 'registrar', risk: 'high_impact' as const }

const record = (o: Partial<RecordState> = {}): RecordState => ({
  status: 'draft',
  verification: 'unverified',
  risk: 'standard',
  ownerOffice: 'registrar',
  source: 'Registrar circular 12/2026',
  reviewDueAt: null,
  pinned: false,
  createdBy: 7, // the contributor below
  ...o,
})

const save = (o: Partial<SaveInput> & Pick<SaveInput, 'actor'>): ReturnType<typeof evaluateSave> =>
  evaluateSave({
    operation: 'update',
    publishing: false,
    prev: record(),
    next: record(),
    contentChanged: false,
    now: NOW,
    ...o,
  })

function allowed(
  actor: Actor,
  rec: Pick<RecordState, 'ownerOffice' | 'risk'>,
  from: WorkflowStatus,
  to: WorkflowStatus,
): boolean {
  return checkTransition(actor, rec, from, to) === null
}

describe('actors', () => {
  it('treats a user with no or unknown role as a contributor (least privilege)', () => {
    expect(actorFromUser({ id: 1 })).toMatchObject({ role: 'contributor' })
    expect(actorFromUser({ id: 1, role: 'superuser' })).toMatchObject({ role: 'contributor' })
  })

  it('distinguishes system code from anonymous web requests', () => {
    expect(actorFromRequest({ user: null, payloadAPI: 'local' })).toEqual({ kind: 'system' })
    expect(actorFromRequest({ user: null, payloadAPI: 'REST' })).toEqual({ kind: 'anonymous' })
    expect(actorFromRequest({ user: null })).toEqual({ kind: 'anonymous' })
  })

  it('ignores malformed offices and normalizes case and spacing', () => {
    expect(
      actorFromUser({
        id: 1,
        role: 'editor',
        offices: ['a', 3, '', null, '  Admissions   Office ', 'A'],
      }),
    ).toMatchObject({
      offices: ['a', 'admissions office'],
    })
  })
})

describe('scope and reviewer rules', () => {
  it('scoped roles need the owner office; global roles do not', () => {
    expect(inScope(editorIn, 'registrar')).toBe(true)
    expect(inScope(editorOut, 'registrar')).toBe(false)
    expect(inScope(editorIn, null)).toBe(false)
    expect(inScope(manager, 'anything')).toBe(true)
    expect(inScope(admin, null)).toBe(true)
    expect(inScope(contributor, 'registrar')).toBe(false)
    expect(inScope(system, 'registrar')).toBe(false)
  })

  it('reviewer: admin always, approver in scope, site manager unless high-impact', () => {
    expect(isReviewerFor(admin, highImpact)).toBe(true)
    expect(isReviewerFor(approverIn, highImpact)).toBe(true)
    expect(isReviewerFor(approverOut, standard)).toBe(false)
    expect(isReviewerFor(manager, standard)).toBe(true)
    expect(isReviewerFor(manager, highImpact)).toBe(false)
    for (const a of [editorIn, contributor, auditor, system, anonymous]) {
      expect(isReviewerFor(a, standard)).toBe(false)
    }
  })

  it('contributors cannot submit; scoped editors can only inside their office', () => {
    expect(canSubmitFor(contributor, standard)).toBe(false)
    expect(canSubmitFor(editorIn, standard)).toBe(true)
    expect(canSubmitFor(editorOut, standard)).toBe(false)
  })

  it('restore is for approvers in scope and platform admins', () => {
    expect(canRestore(admin, standard)).toBe(true)
    expect(canRestore(approverIn, standard)).toBe(true)
    expect(canRestore(approverOut, standard)).toBe(false)
    expect(canRestore(manager, standard)).toBe(false)
  })
})

describe('CMS-03 transitions on a standard-risk record', () => {
  const moves: Array<[WorkflowStatus, WorkflowStatus, Actor[]]> = [
    ['draft', 'in_review', [admin, manager, approverIn, editorIn]],
    ['in_review', 'draft', [admin, manager, approverIn]],
    ['draft', 'approved', [admin, manager, approverIn]],
    ['in_review', 'approved', [admin, manager, approverIn]],
    ['approved', 'draft', [admin, manager, approverIn]],
    ['approved', 'published', [admin, manager, approverIn, system]],
    ['published', 'archived', [admin, manager, approverIn, system]],
    ['archived', 'published', [admin, approverIn]],
  ]
  const everyone: Actor[] = [
    admin,
    manager,
    approverIn,
    approverOut,
    editorIn,
    editorOut,
    contributor,
    auditor,
    system,
    anonymous,
  ]

  for (const [from, to, who] of moves) {
    it(`${from} > ${to} is allowed for exactly the listed actors`, () => {
      for (const actor of everyone) {
        expect(allowed(actor, standard, from, to), `${JSON.stringify(actor)}`).toBe(
          who.includes(actor),
        )
      }
    })
  }

  it('rejects every move outside the table as illegal (no skipping)', () => {
    const legal = new Set(moves.map(([f, t]) => `${f}>${t}`))
    const states: WorkflowStatus[] = ['draft', 'in_review', 'approved', 'published', 'archived']
    for (const from of states) {
      for (const to of states) {
        if (from === to || legal.has(`${from}>${to}`)) continue
        const r = checkTransition(admin, standard, from, to)
        expect(r, `${from}>${to}`).toMatchObject({ ok: false, code: 'TRANSITION_ILLEGAL' })
      }
    }
  })

  it('high-impact records need an approver or platform admin to approve, publish or archive', () => {
    expect(allowed(manager, highImpact, 'in_review', 'approved')).toBe(false)
    expect(allowed(manager, highImpact, 'approved', 'published')).toBe(false)
    expect(allowed(manager, highImpact, 'published', 'archived')).toBe(false)
    expect(allowed(approverIn, highImpact, 'approved', 'published')).toBe(true)
    expect(allowed(admin, highImpact, 'approved', 'published')).toBe(true)
    expect(allowed(approverOut, highImpact, 'approved', 'published')).toBe(false)
  })
})

describe('creating records', () => {
  const create = (actor: Actor, next: Partial<RecordState> = {}, publishing = false) =>
    evaluateSave({
      operation: 'create',
      actor,
      publishing,
      prev: null,
      next: record(next),
      contentChanged: false,
      now: NOW,
    })

  it('refuses to create a published record', () => {
    expect(create(admin, {}, true)).toMatchObject({ ok: false, code: 'CREATE_PUBLISHED' })
  })

  it('always starts as draft and unverified, even if the request says otherwise', () => {
    const r = create(editorIn, { status: 'published', verification: 'verified' })
    expect(r).toMatchObject({ ok: true, values: { status: 'draft', verification: 'unverified' } })
  })

  it('lets a reviewer create an already verified draft and stamps the time', () => {
    const r = create(admin, { verification: 'verified' })
    expect(r).toMatchObject({ ok: true, values: { verification: 'verified', verifiedAt: NOW } })
  })

  it('the system (importer) can never create a verified record', () => {
    expect(create(system, { verification: 'verified' })).toMatchObject({
      ok: true,
      values: { verification: 'unverified' },
    })
  })

  it('scoped roles can only create inside their office; contributors anywhere', () => {
    expect(create(editorOut)).toMatchObject({ ok: false, code: 'OWNER_OUT_OF_SCOPE' })
    expect(create(approverOut)).toMatchObject({ ok: false, code: 'OWNER_OUT_OF_SCOPE' })
    expect(create(editorIn)).toMatchObject({ ok: true })
    expect(create(contributor)).toMatchObject({ ok: true })
  })

  it('raises a low risk class to standard unless a reviewer creates it; ignores pin from non-reviewers', () => {
    expect(create(editorIn, { risk: 'low', pinned: true })).toMatchObject({
      ok: true,
      values: { risk: 'standard', pinned: false },
    })
    expect(create(admin, { risk: 'low', pinned: true })).toMatchObject({
      ok: true,
      values: { risk: 'low', pinned: true },
    })
  })

  it('read-only and anonymous actors cannot create', () => {
    expect(create(auditor)).toMatchObject({ ok: false, code: 'READ_ONLY_ROLE' })
    expect(create(anonymous)).toMatchObject({ ok: false, code: 'ANONYMOUS' })
  })
})

describe('VER-01: an unverified record can never be published', () => {
  const publish = (actor: Actor, prev: Partial<RecordState>, next: Partial<RecordState> = {}) =>
    save({
      actor,
      publishing: true,
      prev: record({ status: 'approved', ...prev }),
      next: record({ status: 'approved', ...prev, ...next }),
    })

  it('blocks publishing for every actor that may otherwise publish', () => {
    for (const actor of [admin, manager, approverIn, system]) {
      expect(publish(actor, { verification: 'unverified' }), JSON.stringify(actor)).toMatchObject({
        ok: false,
        code: 'NOT_VERIFIED',
      })
    }
  })

  it('also blocks a stale record', () => {
    expect(publish(admin, { verification: 'stale' })).toMatchObject({
      ok: false,
      code: 'NOT_VERIFIED',
    })
  })

  it('allows publishing a verified, approved record', () => {
    for (const actor of [admin, manager, approverIn, system]) {
      expect(publish(actor, { verification: 'verified' }), JSON.stringify(actor)).toMatchObject({
        ok: true,
        values: { status: 'published' },
      })
    }
  })

  it('a reviewer can verify and publish in the same save', () => {
    const r = publish(approverIn, { verification: 'unverified' }, { verification: 'verified' })
    expect(r).toMatchObject({
      ok: true,
      values: { status: 'published', verification: 'verified', verifiedAt: NOW },
    })
  })

  it('the system cannot verify, so an imported record cannot reach published without a person', () => {
    const r = publish(system, { verification: 'unverified' }, { verification: 'verified' })
    expect(r).toMatchObject({ ok: false, code: 'VERIFY_FORBIDDEN' })
  })

  it('editors cannot verify', () => {
    const r = save({
      actor: editorIn,
      prev: record({ status: 'draft' }),
      next: record({ status: 'draft', verification: 'verified' }),
    })
    expect(r).toMatchObject({ ok: false, code: 'VERIFY_FORBIDDEN' })
  })

  it('high-impact records also need a review date', () => {
    const r = publish(approverIn, {
      verification: 'verified',
      risk: 'high_impact',
      reviewDueAt: null,
    })
    expect(r).toMatchObject({ ok: false, code: 'REVIEW_DATE_REQUIRED' })
    expect(
      publish(approverIn, {
        verification: 'verified',
        risk: 'high_impact',
        reviewDueAt: '2027-01-01T00:00:00.000Z',
      }),
    ).toMatchObject({ ok: true })
  })

  it('needs an owner office and a source before anything goes live', () => {
    expect(publish(admin, { verification: 'verified', ownerOffice: null })).toMatchObject({
      ok: false,
      code: 'OWNER_REQUIRED',
    })
    for (const source of [null, '', '   ']) {
      expect(publish(admin, { verification: 'verified', source })).toMatchObject({
        ok: false,
        code: 'SOURCE_REQUIRED',
      })
    }
  })

  it('restoring an archived record (select Published, then Publish) is gated the same way', () => {
    const r = save({
      actor: approverIn,
      publishing: true,
      prev: record({ status: 'archived', verification: 'stale' }),
      next: record({ status: 'published', verification: 'stale' }),
    })
    expect(r).toMatchObject({ ok: false, code: 'NOT_VERIFIED' })
    const ok = save({
      actor: approverIn,
      publishing: true,
      prev: record({ status: 'archived', verification: 'verified' }),
      next: record({ status: 'published', verification: 'verified' }),
    })
    expect(ok).toMatchObject({ ok: true, values: { status: 'published' } })
  })
})

describe('publishing, archiving and editing live content', () => {
  it('an editor cannot publish an approved record', () => {
    const r = save({
      actor: editorIn,
      publishing: true,
      prev: record({ status: 'approved', verification: 'verified' }),
      next: record({ status: 'approved', verification: 'verified' }),
    })
    expect(r).toMatchObject({ ok: false, code: 'TRANSITION_FORBIDDEN' })
  })

  it('a draft cannot be published directly', () => {
    const r = save({
      actor: admin,
      publishing: true,
      prev: record({ status: 'draft', verification: 'verified' }),
      next: record({ status: 'draft', verification: 'verified' }),
    })
    expect(r).toMatchObject({ ok: false, code: 'TRANSITION_ILLEGAL' })
  })

  it('a reviewer can approve and publish in one save; an editor cannot', () => {
    const base = {
      prev: record({ status: 'draft', verification: 'verified' }),
      next: record({ status: 'approved', verification: 'verified' }),
      publishing: true,
    }
    expect(save({ actor: manager, ...base })).toMatchObject({
      ok: true,
      values: { status: 'published' },
    })
    expect(save({ actor: editorIn, ...base })).toMatchObject({
      ok: false,
      code: 'TRANSITION_FORBIDDEN',
    })
  })

  it('re-saving a published record without content change is a no-op for anyone with update access', () => {
    const r = save({
      actor: editorIn,
      publishing: true,
      prev: record({ status: 'published', verification: 'verified' }),
      next: record({ status: 'published', verification: 'verified' }),
    })
    expect(r).toMatchObject({ ok: true, values: { status: 'published' } })
  })

  it('changing published content directly needs a reviewer and a verified record', () => {
    const live = record({ status: 'published', verification: 'verified' })
    const edit = (actor: Actor, next = live) =>
      save({ actor, publishing: true, prev: live, next, contentChanged: true })
    expect(edit(editorIn)).toMatchObject({ ok: false, code: 'EDIT_LIVE_NEEDS_REVIEWER' })
    expect(edit(manager)).toMatchObject({ ok: true, values: { status: 'published' } })
    expect(
      edit(manager, record({ status: 'published', verification: 'unverified' })),
    ).toMatchObject({
      ok: false,
    })
  })

  it('archiving needs a reviewer; the expiry job (system) may archive', () => {
    const live = record({ status: 'published', verification: 'verified' })
    const archive = (actor: Actor) =>
      save({ actor, publishing: true, prev: live, next: record({ ...live, status: 'archived' }) })
    expect(archive(approverIn)).toMatchObject({ ok: true, values: { status: 'archived' } })
    expect(archive(system)).toMatchObject({ ok: true, values: { status: 'archived' } })
    expect(archive(editorIn)).toMatchObject({ ok: false, code: 'TRANSITION_FORBIDDEN' })
  })

  it('archive and publish are not available through Save draft', () => {
    const r = save({
      actor: admin,
      publishing: false,
      prev: record({ status: 'draft' }),
      next: record({ status: 'published' }),
    })
    expect(r).toMatchObject({ ok: false, code: 'NEEDS_PUBLISH_ACTION' })
  })

  it('saving a draft of live content starts a new draft revision', () => {
    const r = save({
      actor: editorIn,
      prev: record({ status: 'published', verification: 'verified' }),
      next: record({ status: 'published', verification: 'verified' }),
      contentChanged: true,
    })
    expect(r).toMatchObject({ ok: true, values: { status: 'draft', verification: 'unverified' } })
  })
})

describe('scope on updates is judged on the latest saved state', () => {
  it("an editor or approver outside the record's office cannot change it", () => {
    for (const a of [editorOut, approverOut]) {
      expect(save({ actor: a, prev: record(), next: record() })).toMatchObject({
        ok: false,
        code: 'OWNER_OUT_OF_SCOPE',
      })
    }
    expect(save({ actor: editorIn, prev: record(), next: record() })).toMatchObject({ ok: true })
  })

  it('a record with no owner office is outside every editor and approver', () => {
    const orphan = record({ ownerOffice: null })
    expect(save({ actor: editorIn, prev: orphan, next: orphan })).toMatchObject({
      ok: false,
      code: 'OWNER_OUT_OF_SCOPE',
    })
    expect(save({ actor: manager, prev: orphan, next: orphan })).toMatchObject({ ok: true })
  })

  it('a contributor edits only their own record, and only while it is a draft', () => {
    expect(save({ actor: contributor, prev: record(), next: record() })).toMatchObject({ ok: true })
    expect(
      save({
        actor: contributor,
        prev: record({ createdBy: 99 }),
        next: record({ createdBy: 99 }),
      }),
    ).toMatchObject({
      ok: false,
      code: 'NOT_YOUR_DRAFT',
    })
    expect(
      save({ actor: contributor, prev: record({ createdBy: null }), next: record() }),
    ).toMatchObject({ code: 'NOT_YOUR_DRAFT' })
    for (const status of ['in_review', 'approved', 'published', 'archived'] as const) {
      const r = record({ status })
      expect(save({ actor: contributor, prev: r, next: r }), status).toMatchObject({
        ok: false,
        code: 'NOT_YOUR_DRAFT',
      })
    }
  })
})

describe('deleting', () => {
  it('platform admin always; site manager unless high-impact; system for jobs; nobody else', () => {
    expect(checkDelete(admin, { risk: 'high_impact' })).toBeNull()
    expect(checkDelete(manager, { risk: 'standard' })).toBeNull()
    expect(checkDelete(manager, { risk: 'high_impact' })).toMatchObject({
      code: 'DELETE_FORBIDDEN',
    })
    expect(checkDelete(system, { risk: 'high_impact' })).toBeNull()
    for (const a of [approverIn, editorIn, contributor, auditor]) {
      expect(checkDelete(a, { risk: 'low' }), JSON.stringify(a)).toMatchObject({
        code: 'DELETE_FORBIDDEN',
      })
    }
    expect(checkDelete(anonymous, { risk: 'low' })).toMatchObject({ code: 'ANONYMOUS' })
  })
})

describe('taking published content offline (Unpublish)', () => {
  const live = record({ status: 'published', verification: 'verified' })
  const unpublish = (actor: Actor) =>
    save({ actor, prev: live, next: live, unpublishing: true, contentChanged: false })

  it('needs a reviewer; the system may do it; the result is a draft', () => {
    expect(unpublish(approverIn)).toMatchObject({ ok: true, values: { status: 'draft' } })
    expect(unpublish(manager)).toMatchObject({ ok: true })
    expect(unpublish(system)).toMatchObject({ ok: true })
    expect(unpublish(editorIn)).toMatchObject({ ok: false, code: 'UNPUBLISH_FORBIDDEN' })
    // Scope is checked first: these never get as far as the unpublish rule.
    expect(unpublish(contributor)).toMatchObject({ ok: false, code: 'NOT_YOUR_DRAFT' })
    expect(unpublish(approverOut)).toMatchObject({ ok: false, code: 'OWNER_OUT_OF_SCOPE' })
  })

  it('a draft revision saved over live content is not an unpublish', () => {
    const r = save({
      actor: editorIn,
      prev: live,
      next: live,
      unpublishing: false,
      contentChanged: true,
    })
    expect(r).toMatchObject({ ok: true, values: { status: 'draft' } })
  })
})

describe('edits invalidate approval', () => {
  it('a non-reviewer edit drops in-review and approved records back to draft', () => {
    for (const status of ['in_review', 'approved'] as const) {
      const r = save({
        actor: editorIn,
        prev: record({ status, verification: 'verified' }),
        next: record({ status, verification: 'verified' }),
        contentChanged: true,
      })
      expect(r).toMatchObject({
        ok: true,
        values: { status: 'draft', verification: 'unverified' },
        notes: expect.arrayContaining(['approval_invalidated', 'verification_invalidated']),
      })
    }
  })

  it('an unchanged save keeps the state', () => {
    const r = save({
      actor: editorIn,
      prev: record({ status: 'approved', verification: 'verified' }),
      next: record({ status: 'approved', verification: 'verified' }),
      contentChanged: false,
    })
    expect(r).toMatchObject({ ok: true, values: { status: 'approved', verification: 'verified' } })
  })

  it('a reviewer edit keeps approval and verification (they vouch for the change)', () => {
    const r = save({
      actor: approverIn,
      prev: record({ status: 'approved', verification: 'verified' }),
      next: record({ status: 'approved', verification: 'verified' }),
      contentChanged: true,
    })
    expect(r).toMatchObject({ ok: true, values: { status: 'approved', verification: 'verified' } })
  })

  it('a site manager editing a high-impact record is not a reviewer, so approval is dropped', () => {
    const r = save({
      actor: manager,
      prev: record({ status: 'approved', verification: 'verified', risk: 'high_impact' }),
      next: record({ status: 'approved', verification: 'verified', risk: 'high_impact' }),
      contentChanged: true,
    })
    expect(r).toMatchObject({ ok: true, values: { status: 'draft', verification: 'unverified' } })
  })
})

describe('other guarded fields', () => {
  it('only a reviewer can lower the risk class; a site manager cannot lower a high-impact record', () => {
    const lower = (actor: Actor, from: RecordState['risk']) =>
      save({ actor, prev: record({ risk: from }), next: record({ risk: 'low' }) })
    expect(lower(editorIn, 'standard')).toMatchObject({ ok: false, code: 'RISK_LOWER_FORBIDDEN' })
    expect(lower(manager, 'high_impact')).toMatchObject({ ok: false, code: 'RISK_LOWER_FORBIDDEN' })
    expect(lower(manager, 'standard')).toMatchObject({ ok: true, values: { risk: 'low' } })
    expect(lower(admin, 'high_impact')).toMatchObject({ ok: true })
  })

  it('anyone can raise the risk class', () => {
    expect(
      save({ actor: editorIn, prev: record(), next: record({ risk: 'high_impact' }) }),
    ).toMatchObject({
      ok: true,
      values: { risk: 'high_impact' },
    })
  })

  it('only a reviewer can pin', () => {
    const pin = (actor: Actor) => save({ actor, prev: record(), next: record({ pinned: true }) })
    expect(pin(editorIn)).toMatchObject({ ok: false, code: 'PIN_FORBIDDEN' })
    expect(pin(manager)).toMatchObject({ ok: true, values: { pinned: true } })
  })

  it('scoped roles cannot hand a record to an office they are not in', () => {
    const r = save({ actor: editorIn, prev: record(), next: record({ ownerOffice: 'finance' }) })
    expect(r).toMatchObject({ ok: false, code: 'OWNER_OUT_OF_SCOPE' })
    expect(
      save({ actor: manager, prev: record(), next: record({ ownerOffice: 'finance' }) }),
    ).toMatchObject({ ok: true })
  })

  it('the system may mark content stale; a person who is not a reviewer may not', () => {
    const stale = (actor: Actor) =>
      save({
        actor,
        prev: record({ status: 'published', verification: 'verified' }),
        next: record({ status: 'published', verification: 'stale' }),
        publishing: true,
      })
    expect(stale(system)).toMatchObject({ ok: true, values: { verification: 'stale' } })
    expect(stale(editorIn)).toMatchObject({ ok: false, code: 'VERIFY_FORBIDDEN' })
  })

  it('anonymous and auditor actors can never save', () => {
    expect(save({ actor: anonymous })).toMatchObject({ ok: false, code: 'ANONYMOUS' })
    expect(save({ actor: auditor })).toMatchObject({ ok: false, code: 'READ_ONLY_ROLE' })
  })
})

describe('moving through the whole workflow', () => {
  it('draft > in review > approved > published > archived > restored, each by the right person', () => {
    let state = record({ status: 'draft' })
    const step = (actor: Actor, nextPatch: Partial<RecordState>, publishing = false) => {
      const next = { ...state, ...nextPatch }
      const r = save({ actor, publishing, prev: state, next })
      expect(r, `${state.status} > ${next.status}`).toMatchObject({ ok: true })
      if (r.ok) state = { ...state, ...r.values, verification: r.values.verification }
    }
    step(editorIn, { status: 'in_review' })
    step(approverIn, { status: 'approved', verification: 'verified' })
    step(approverIn, { status: 'published' }, true)
    expect(state.status).toBe('published')
    step(approverIn, { status: 'archived' }, true)
    expect(state.status).toBe('archived')
    step(approverIn, { status: 'published' }, true)
    expect(state.status).toBe('published')
  })
})
