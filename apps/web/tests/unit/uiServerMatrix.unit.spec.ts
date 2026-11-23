import { describe, expect, it } from 'vitest'

import { workflowView, type Author, type StepAction } from '../../src/admin/workflow/rules'
import {
  evaluateSave,
  type PolicyCode,
  type RecordState,
  type SaveOutcome,
  type Target,
} from '../../src/governance/policy'
import {
  actorFromUser,
  WORKFLOW_STATUSES,
  type Actor,
  type RiskClass,
  type VerificationStatus,
  type WorkflowStatus,
} from '../../src/governance/roles'

/**
 * Slice 3an: the screen and the server must agree.
 *
 * `workflowView` decides which buttons a person sees; `evaluateSave` is what the server runs when a
 * button is pressed. This test walks every role, kind of page, stage, fact-check state, author and
 * risk class and checks both directions:
 *  1. Nothing the screen offers is refused for a role reason (that would be a button that fails).
 *  2. Everything the server would allow is offered on screen, except what is listed in HIDDEN_ON_PURPOSE.
 * A new rule on one side that is not on the other makes this fail, so the two cannot drift silently.
 */

const NOW = '2026-11-23T00:00:00.000Z'

const ACTORS: Record<string, Actor> = {
  admin: actorFromUser({ id: 1, role: 'platformAdmin', offices: ['IT Directorate'] }),
  manager: actorFromUser({ id: 2, role: 'siteManager', offices: ['IT Directorate'] }),
  headDcst: actorFromUser({ id: 3, role: 'approver', offices: ['DCST'] }),
  headRegistrar: actorFromUser({ id: 4, role: 'approver', offices: ['Registrar'] }),
  editorDcst: actorFromUser({ id: 5, role: 'editor', offices: ['DCST'] }),
  coordinator: actorFromUser({ id: 6, role: 'editor', offices: ['DCST'], programmes: ['9'] }),
  contributor: actorFromUser({ id: 7, role: 'contributor', offices: ['DCST'] }),
  auditor: actorFromUser({ id: 8, role: 'auditor', offices: [] }),
}

const TARGETS: Record<string, Target> = {
  department: { collection: 'departments', id: 4 },
  ownProgramme: { collection: 'programmes', id: 9 },
  siblingProgramme: { collection: 'programmes', id: 10 },
  notice: { collection: 'notices', id: 3 },
  mainPage: { collection: 'pages', id: 1 },
}

const AUTHORS: Author[] = ['me', 'other', 'import']
const VERIFICATIONS: VerificationStatus[] = ['unverified', 'verified']
const RISKS: RiskClass[] = ['standard', 'high_impact']

/** Refusals that are about the facts of the page, not about who is pressing the button. */
const DATA_CODES: PolicyCode[] = [
  'NOT_VERIFIED',
  'SOURCE_REQUIRED',
  'OWNER_REQUIRED',
  'REVIEW_DATE_REQUIRED',
  'EXPIRY_REQUIRED',
]

interface Ctx {
  actorKey: string
  actor: Actor
  targetKey: string
  target: Target
  stage: WorkflowStatus
  verification: VerificationStatus
  author: Author
  risk: RiskClass
}

const ownerOffice = (targetKey: string) => (targetKey === 'mainPage' ? 'it directorate' : 'dcst')

function prevState(c: Ctx): RecordState {
  const id = c.actor.kind === 'user' ? c.actor.id : 0
  return {
    status: c.stage,
    verification: c.verification,
    risk: c.risk,
    ownerOffice: ownerOffice(c.targetKey),
    source: 'https://example.test/source',
    reviewDueAt: '2027-01-01T00:00:00.000Z',
    expireAt: null,
    pinned: false,
    createdBy: c.author === 'me' ? id : c.author === 'other' ? 999 : null,
    target: c.target,
  }
}

const save = (
  c: Ctx,
  prev: RecordState,
  change: Partial<RecordState>,
  extra: { publishing?: boolean; unpublishing?: boolean; contentChanged?: boolean } = {},
): SaveOutcome =>
  evaluateSave({
    operation: 'update',
    actor: c.actor,
    publishing: extra.publishing ?? false,
    unpublishing: extra.unpublishing ?? false,
    prev,
    next: { ...prev, ...change },
    contentChanged: extra.contentChanged ?? false,
    now: NOW,
  })

/** What pressing each thing on screen asks the server to do (WorkflowBar.tsx and Payload's Publish). */
function press(c: Ctx, what: StepAction | 'publish'): SaveOutcome {
  const prev = prevState(c)
  switch (what) {
    case 'sendForReview':
      return save(c, prev, { status: 'in_review' })
    case 'approve':
      return save(c, prev, { status: 'approved' })
    case 'sendBack':
      return save(c, prev, { status: 'draft' })
    case 'markVerified':
      return save(c, prev, { verification: 'verified' })
    case 'takeOffline':
      return save(c, prev, { status: 'published' }, { unpublishing: true })
    case 'publish':
      // Approved: publish as it is. Live: "publish changes" (the reviewer edited the content).
      return save(
        c,
        prev,
        { status: c.stage === 'published' ? 'published' : 'approved' },
        { publishing: true, contentChanged: c.stage === 'published' },
      )
    case 'approveAndPublish': {
      // Mark verified, approve, publish: each step is its own save, the next one sees the last.
      let state = prev
      if (state.verification !== 'verified') {
        const v = save(c, state, { verification: 'verified' })
        if (!v.ok) return v
        state = { ...state, verification: 'verified' }
      }
      const a = save(c, state, { status: 'approved' })
      if (!a.ok) return a
      state = { ...state, status: 'approved' }
      return save(c, state, { status: 'approved' }, { publishing: true })
    }
  }
}

function* contexts(): Generator<Ctx> {
  for (const [actorKey, actor] of Object.entries(ACTORS))
    for (const [targetKey, target] of Object.entries(TARGETS))
      for (const stage of WORKFLOW_STATUSES)
        for (const verification of VERIFICATIONS)
          for (const author of AUTHORS)
            for (const risk of RISKS)
              yield { actorKey, actor, targetKey, target, stage, verification, author, risk }
}

const viewOf = (c: Ctx) =>
  workflowView({
    actor: c.actor,
    stage: c.stage,
    verification: c.verification,
    risk: c.risk,
    ownerOffice: ownerOffice(c.targetKey),
    saved: true,
    author: c.author,
    target: c.target,
  })

const label = (c: Ctx) =>
  `${c.actorKey} on ${c.targetKey} (${c.stage}, ${c.verification}, by ${c.author}, ${c.risk})`

describe('screen and server agree (slice 3an)', () => {
  it('covers a meaningful number of cases', () => {
    expect([...contexts()].length).toBeGreaterThan(2000)
  })

  it('nothing the screen offers is refused by the server for a role reason', () => {
    const wrong: string[] = []
    for (const c of contexts()) {
      const v = viewOf(c)
      const offered: (StepAction | 'publish')[] = [
        ...v.actions,
        ...(v.showPublish ? ['publish' as const] : []),
      ]
      for (const what of offered) {
        const r = press(c, what)
        if (!r.ok && !DATA_CODES.includes(r.code))
          wrong.push(`${label(c)}: shows "${what}", server says ${r.code}`)
      }
    }
    expect(wrong.slice(0, 20)).toEqual([])
    expect(wrong).toHaveLength(0)
  })

  /**
   * The server allows each of these but the screen does not offer it, on purpose. Each entry says
   * which case it covers; anything else the server allows and the screen hides fails the test.
   */
  const HIDDEN_ON_PURPOSE: {
    why: string
    covers: (c: Ctx, shown: Set<string>, what: string) => boolean
  }[] = [
    {
      // A draft belongs to its author until it is sent for review (owner, 2026-11-21).
      why: 'someone else’s unsent draft is not for you to approve or send',
      covers: (c, _s, what) =>
        c.stage === 'draft' &&
        c.author === 'other' &&
        (what === 'approve' || what === 'sendForReview'),
    },
    {
      // Where the screen offers Approve (or Approve and publish) on a draft, Send for review is not also offered.
      why: 'a person who may approve the draft is offered Approve, not Send for review',
      covers: (c, shown, what) =>
        c.stage === 'draft' &&
        what === 'sendForReview' &&
        (shown.has('approve') || shown.has('approveAndPublish')),
    },
    {
      // Waiting for another approver: the screen says so and offers nothing, even though the server
      // would let the reviewer who wrote it send it back or mark it verified.
      why: 'a reviewer who wrote the item waits for another approver',
      covers: (c, _s, what) =>
        c.stage === 'in_review' &&
        c.author === 'me' &&
        (what === 'sendBack' || what === 'markVerified'),
    },
  ]

  it('everything the server would allow is on screen, except what is hidden on purpose', () => {
    const gaps: string[] = []
    for (const c of contexts()) {
      if (c.actor.kind !== 'user') continue
      const v = viewOf(c)
      const shown = new Set<string>([
        ...v.actions,
        ...(v.showPublish ? ['publish'] : []),
        // One press for "verify, approve, publish" covers each of its steps.
        ...(v.actions.includes('approveAndPublish') ? ['approve', 'markVerified', 'publish'] : []),
      ])
      const check = (what: StepAction | 'publish', applies: boolean) => {
        if (!applies || shown.has(what)) return
        const r = press(c, what)
        if (!(r.ok || DATA_CODES.includes((r as { code: PolicyCode }).code))) return
        if (HIDDEN_ON_PURPOSE.some((h) => h.covers(c, shown, what))) return
        gaps.push(`${label(c)}: server allows "${what}", screen hides it`)
      }
      check('sendForReview', c.stage === 'draft')
      check('approve', c.stage === 'draft' || c.stage === 'in_review')
      check('sendBack', c.stage === 'in_review' || c.stage === 'approved')
      check('publish', c.stage === 'approved' && c.verification === 'verified')
      check('takeOffline', c.stage === 'published')
      check(
        'markVerified',
        c.verification === 'unverified' && c.stage !== 'archived' && c.stage !== 'draft',
      )
    }
    expect(gaps.slice(0, 20)).toEqual([])
  })

  it('archive and restore are on no screen yet, so the server allows them to reviewers only', () => {
    // Documented gap (docs/STATUS.md, "Archive and Restore buttons"): not a drift, a missing feature.
    for (const c of contexts()) {
      const v = viewOf(c)
      expect(
        v.actions.some((a) => (a as string) === 'archive' || (a as string) === 'restore'),
      ).toBe(false)
    }
  })
})
