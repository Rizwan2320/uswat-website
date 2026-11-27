import { describe, expect, it } from 'vitest'

import { STEP_TARGET, workflowView, type StepAction } from '../../src/admin/workflow/rules'
import {
  checkTransition,
  mayApproveOwn,
  mayPublishApproved,
  mayTakeOffline,
} from '../../src/governance/policy'
import {
  actorFromUser,
  WORKFLOW_STATUSES,
  type Actor,
  type Role,
  type WorkflowStatus,
} from '../../src/governance/roles'

const person = (role: Role, offices: string[] = ['Registrar']): Actor =>
  actorFromUser({ id: role === 'contributor' ? 7 : 1, role, offices })

const view = (
  actor: Actor,
  stage: WorkflowStatus,
  extra: Partial<Parameters<typeof workflowView>[0]> = {},
) =>
  workflowView({
    actor,
    stage,
    verification: 'unverified',
    risk: 'standard',
    ownerOffice: 'Registrar',
    saved: true,
    author: 'other',
    ...extra,
  })

describe('head of department and coordinator (slice 3ah)', () => {
  const hod = person('approver', ['Registrar'])
  const deptPage = { target: { collection: 'departments', id: 4 } }

  it('a head publishes their department page without sending it for review, in one press, whoever started the draft', () => {
    for (const author of ['me', 'other'] as const) {
      const v = view(hod, 'draft', { ...deptPage, author })
      expect(v.actions).toEqual(['approveAndPublish'])
      expect(v.banner.en).toMatch(/head of the department you publish it yourself/)
      expect(v.banner.en).toMatch(/Approve and publish/)
    }
    // A programme the head started themselves: one press. A coordinator's unsent draft: separate steps.
    const prog = { target: { collection: 'programmes', id: 9 } }
    expect(view(hod, 'draft', { ...prog, author: 'me' }).actions).toEqual(['approveAndPublish'])
    expect(view(hod, 'draft', prog).actions).toEqual(['approve', 'markVerified'])
    expect(view(hod, 'approved', deptPage).showPublish).toBe(true)
  })

  it('a head of another kind of page (a notice) is still bound by the draft-belongs-to-its-author rule', () => {
    const v = view(hod, 'draft', { target: { collection: 'notices', id: 4 }, author: 'other' })
    expect(v.actions).not.toContain('approve')
    expect(mayApproveOwn(hod, { collection: 'notices', id: 4 })).toBe(false)
    expect(mayApproveOwn(hod, { collection: 'departments', id: 4 })).toBe(true)
    expect(mayApproveOwn(hod, { collection: 'programmes', id: 4 })).toBe(true)
    expect(mayApproveOwn(person('siteManager'), { collection: 'departments', id: 4 })).toBe(false)
    expect(mayApproveOwn(person('editor'), { collection: 'programmes', id: 4 })).toBe(false)
    expect(mayApproveOwn(person('platformAdmin'))).toBe(true)
  })

  it('a coordinator sees only a read-only note on a sibling programme and on the department', () => {
    const c = actorFromUser({ id: 2, role: 'editor', offices: [], programmes: [5] })
    expect(view(c, 'draft', { target: { collection: 'programmes', id: 5 } }).actions).toEqual([
      'sendForReview',
    ])
    for (const target of [
      { collection: 'programmes', id: 6 },
      { collection: 'departments', id: 4 },
    ]) {
      const v = view(c, 'draft', { target })
      expect(v.tone).toBe('readonly')
      expect(v.banner.en).toMatch(/your own programme pages only/)
    }
  })
})

describe('coordinator publishes what the head approved (slice 3aj)', () => {
  const c = actorFromUser({ id: 2, role: 'editor', offices: [], programmes: [5] })
  const own = { target: { collection: 'programmes', id: 5 } }

  it('Publish appears when approved and verified, not before', () => {
    const ready = view(c, 'approved', { ...own, verification: 'verified' })
    expect(ready).toMatchObject({ tone: 'ready', actions: [], showPublish: true })
    expect(ready.banner.en).toMatch(/Press Publish/)
    const waiting = view(c, 'approved', { ...own, verification: 'unverified' })
    expect(waiting).toMatchObject({ tone: 'waiting', showPublish: false })
    expect(waiting.banner.en).toMatch(/mark it verified/)
  })

  it('no Publish on draft, in review, live, a sibling programme or the department', () => {
    for (const s of ['draft', 'in_review', 'published'] as const) {
      expect(view(c, s, { ...own, verification: 'verified' }).showPublish, s).toBe(false)
    }
    for (const target of [
      { collection: 'programmes', id: 6 },
      { collection: 'departments', id: 4 },
    ]) {
      expect(view(c, 'approved', { target, verification: 'verified' }).showPublish).toBe(false)
    }
  })

  it('an office editor and a contributor never see Publish; the rule is policy-backed', () => {
    expect(view(person('editor'), 'approved', own).showPublish).toBe(false)
    expect(view(person('contributor'), 'approved', own).showPublish).toBe(false)
    expect(mayPublishApproved(c, own.target)).toBe(true)
    expect(mayPublishApproved(c, { collection: 'programmes', id: 6 })).toBe(false)
    expect(mayPublishApproved(c, { collection: 'departments', id: 5 })).toBe(false)
    expect(mayPublishApproved(c)).toBe(false)
    expect(
      checkTransition(
        c,
        { ownerOffice: 'x', risk: 'standard', target: own.target },
        'approved',
        'published',
      ),
    ).toBeNull()
    expect(
      checkTransition(
        c,
        { ownerOffice: 'x', risk: 'standard', target: own.target },
        'in_review',
        'approved',
      ),
    ).not.toBeNull()
  })
})

describe('taking a page offline (slice 3al)', () => {
  const c = actorFromUser({ id: 2, role: 'editor', offices: [], programmes: [5] })
  const hod = person('approver', ['Registrar'])
  const prog = { target: { collection: 'programmes', id: 5 } }
  const dept = { target: { collection: 'departments', id: 4 } }
  const scope = (t: { collection: string; id: number }) => ({
    ownerOffice: 'registrar',
    risk: 'standard' as const,
    target: t,
  })

  it('the coordinator is offered Take offline on their own live programme, the head is not', () => {
    expect(view(c, 'published', prog).actions).toEqual(['takeOffline'])
    expect(view(hod, 'published', prog).actions).not.toContain('takeOffline')
    expect(view(hod, 'published', prog).banner.en).toMatch(/taken offline by its coordinator/)
  })

  it('the head is offered it on the department page; the admin and site manager everywhere', () => {
    expect(view(hod, 'published', dept).actions).toContain('takeOffline')
    for (const r of ['platformAdmin', 'siteManager'] as const) {
      expect(view(person(r, []), 'published', prog).actions).toContain('takeOffline')
    }
  })

  it('no one is offered it on a page that is not live, or on a sibling programme', () => {
    expect(view(c, 'approved', prog).actions).not.toContain('takeOffline')
    expect(view(c, 'published', { target: { collection: 'programmes', id: 6 } }).actions).toEqual(
      [],
    )
  })

  it('the screen offers exactly what the policy allows', () => {
    for (const [a, t] of [
      [c, prog.target],
      [c, { collection: 'programmes', id: 6 }],
      [hod, prog.target],
      [hod, dept.target],
      [person('editor'), prog.target],
    ] as const) {
      const offered = (view(a, 'published', { target: t }).actions as string[]).includes(
        'takeOffline',
      )
      expect(offered, `${a.kind === 'user' ? a.role : ''} ${t.collection}${t.id}`).toBe(
        mayTakeOffline(a, scope(t)),
      )
    }
  })
})

describe('workflow view per role', () => {
  it('editor: Send for review on a draft, nothing on review, never Publish', () => {
    const e = person('editor')
    expect(view(e, 'draft', { author: 'me' }).actions).toEqual(['sendForReview'])
    expect(view(e, 'draft', { author: 'other' }).actions).toEqual(['sendForReview'])
    expect(view(e, 'in_review').actions).toEqual([])
    expect(view(e, 'approved').actions).toEqual([])
    for (const s of WORKFLOW_STATUSES) expect(view(e, s).showPublish).toBe(false)
    expect(view(e, 'in_review').banner.en).toMatch(/Waiting for the Registrar approver/)
  })

  it('contributor: own draft only, cannot send, never Publish', () => {
    const c = person('contributor')
    const v = view(c, 'draft', { author: 'me' })
    expect(v.actions).toEqual([])
    expect(v.tone).toBe('info')
    expect(v.banner.en).toMatch(/ask an editor/)
    expect(view(c, 'draft', { author: 'other' }).tone).toBe('readonly')
    expect(view(c, 'in_review', { author: 'me' }).tone).toBe('readonly')
    for (const s of WORKFLOW_STATUSES) expect(view(c, s).showPublish).toBe(false)
  })

  it('approver: nothing to approve on someone else’s unsent draft; approve / send back / verify once sent; Publish only when Approved', () => {
    const a = person('approver')
    expect(view(a, 'draft', { author: 'other' }).actions).toEqual([])
    expect(view(a, 'draft', { author: 'other' }).banner.en).toMatch(/nothing for you to approve/)
    expect(view(a, 'in_review').actions).toEqual(['approve', 'sendBack', 'markVerified'])
    expect(view(a, 'in_review').showPublish).toBe(false)
    expect(view(a, 'approved').showPublish).toBe(true)
    expect(view(a, 'approved').actions).toEqual(['sendBack', 'markVerified'])
    expect(view(a, 'approved', { verification: 'verified' }).actions).toEqual(['sendBack'])
    expect(view(a, 'approved', { verification: 'verified' }).banner.en).toMatch(/Press Publish/)
  })

  it('nobody approves their own work: author sees Send for review on a draft and no Approve while it waits', () => {
    for (const r of ['approver', 'siteManager'] as const) {
      const p = person(r, r === 'approver' ? ['Registrar'] : [])
      expect(view(p, 'draft', { author: 'me' }).actions, r).toEqual(['sendForReview'])
      expect(view(p, 'draft', { author: 'me' }).banner.en).toMatch(/nobody approves their own work/)
      const waiting = view(p, 'in_review', { author: 'me' })
      expect(waiting.actions, r).toEqual([])
      expect(waiting.banner.en).toMatch(/cannot approve it/)
      // Once someone else approved it, they may publish it.
      expect(view(p, 'approved', { author: 'me' }).showPublish, r).toBe(true)
    }
  })

  it('a platform admin publishes their own work: Approve on a draft, Approve on their item in review, no waiting', () => {
    const p = person('platformAdmin')
    const draft = view(p, 'draft', { author: 'me' })
    expect(draft.actions).toEqual(['approveAndPublish'])
    expect(draft.banner.en).toMatch(/No second person is needed/)
    const review = view(p, 'in_review', { author: 'me' })
    expect(review.actions).toEqual(['approve', 'sendBack', 'markVerified'])
    expect(review.banner.en).not.toMatch(/cannot approve it/)
    expect(view(p, 'approved', { author: 'me' }).showPublish).toBe(true)
  })

  it('an imported draft (no author) can be approved by a reviewer', () => {
    const v = view(person('approver'), 'draft', { author: 'import' })
    expect(v.actions).toEqual(['approve', 'markVerified'])
  })

  it('approver of another office is read only', () => {
    const a = person('approver', ['Finance'])
    const v = view(a, 'in_review')
    expect(v.actions).toEqual([])
    expect(v.showPublish).toBe(false)
    expect(v.tone).toBe('readonly')
  })

  it('site manager acts as approver, except on high impact items', () => {
    const s = person('siteManager', [])
    expect(view(s, 'in_review').actions).toContain('approve')
    expect(view(s, 'approved').showPublish).toBe(true)
    expect(view(s, 'in_review', { risk: 'high_impact' }).actions).toEqual([])
  })

  it('platform admin can approve and publish what others wrote, high impact included', () => {
    const p = person('platformAdmin', [])
    expect(view(p, 'in_review', { risk: 'high_impact' }).actions).toContain('approve')
    expect(view(p, 'approved').showPublish).toBe(true)
  })

  it('auditor sees a read only banner and no buttons at all', () => {
    const v = view(person('auditor', []), 'in_review')
    expect(v).toMatchObject({ tone: 'readonly', actions: [], showPublish: false })
    expect(v.banner.en).toMatch(/^Read only/)
  })

  it('a new unsaved item offers no step yet, and never says Save Draft (drafts save by themselves)', () => {
    for (const r of ['editor', 'approver', 'contributor'] as const) {
      const v = view(person(r), 'draft', { saved: false, author: 'me' })
      expect(v.actions).toEqual([])
      expect(v.showPublish).toBe(false)
    }
    for (const r of ['editor', 'approver', 'contributor'] as const) {
      for (const s of WORKFLOW_STATUSES) {
        for (const author of ['me', 'other', 'import'] as const) {
          expect(view(person(r), s, { author }).banner.en).not.toMatch(/Save Draft/)
        }
      }
    }
  })

  it('every word shown has an Urdu version', () => {
    for (const r of [
      'platformAdmin',
      'siteManager',
      'approver',
      'editor',
      'contributor',
      'auditor',
    ] as const) {
      for (const s of WORKFLOW_STATUSES) {
        const v = view(
          person(r, r === 'platformAdmin' || r === 'siteManager' ? [] : ['Registrar']),
          s,
        )
        expect(v.banner.ur.length).toBeGreaterThan(5)
        expect(v.banner.ur).not.toBe(v.banner.en)
      }
    }
  })

  it('never offers a step the policy would refuse for a role reason', () => {
    const roles: Role[] = [
      'platformAdmin',
      'siteManager',
      'approver',
      'editor',
      'contributor',
      'auditor',
    ]
    for (const r of roles) {
      const actor = person(r, ['Registrar'])
      for (const stage of WORKFLOW_STATUSES) {
        for (const risk of ['standard', 'high_impact'] as const) {
          const v = view(actor, stage, { risk, author: 'other' })
          for (const a of v.actions as StepAction[]) {
            if (a === 'markVerified' || a === 'approveAndPublish' || a === 'takeOffline') continue
            const to: WorkflowStatus =
              a === 'archive' ? 'archived' : a === 'restore' ? 'published' : STEP_TARGET[a]
            expect(
              checkTransition(actor, { ownerOffice: 'registrar', risk }, stage, to),
              `${r} ${stage} ${risk} ${a}`,
            ).toBeNull()
          }
        }
      }
    }
  })
})

describe('archive and restore (slice 3ao)', () => {
  const admin = person('platformAdmin', ['IT Directorate'])
  const manager = person('siteManager', ['IT Directorate'])
  const hod = person('approver', ['Registrar'])
  const editor = person('editor', ['Registrar'])
  const coordinator = actorFromUser({
    id: 6,
    role: 'editor',
    offices: ['Registrar'],
    programmes: ['9'],
  })
  const dept = { target: { collection: 'departments', id: 4 } }
  const ownProgramme = { target: { collection: 'programmes', id: 9 } }
  const notice = { target: { collection: 'notices', id: 3 } }

  it('a reviewer who may take a live page offline is also offered Archive', () => {
    expect(view(admin, 'published', dept).actions).toContain('archive')
    expect(view(hod, 'published', dept).actions).toEqual(
      expect.arrayContaining(['takeOffline', 'archive']),
    )
    expect(view(manager, 'published', notice).actions).toContain('archive')
  })

  it('Archive is never offered where the server would refuse it for a role reason', () => {
    // A head does not archive (or take offline) a programme page; that is the coordinator's step.
    const headOnProgramme = view(hod, 'published', ownProgramme).actions
    expect(headOnProgramme).not.toContain('archive')
    expect(headOnProgramme).not.toContain('takeOffline')
    // A site manager is not a reviewer for High impact items.
    expect(view(manager, 'published', { ...notice, risk: 'high_impact' }).actions).not.toContain(
      'archive',
    )
    // A head of another office, an editor and a contributor have no say over this page.
    expect(view(person('approver', ['Library']), 'published', dept).actions).not.toContain(
      'archive',
    )
    expect(view(editor, 'published', notice).actions).not.toContain('archive')
    expect(view(person('contributor'), 'published', notice).actions).toEqual([])
    expect(view(person('auditor', []), 'published', notice).actions).toEqual([])
  })

  it('a coordinator takes their own programme offline but is not offered Archive', () => {
    expect(
      mayTakeOffline(coordinator, { ownerOffice: 'registrar', risk: 'standard', ...ownProgramme }),
    ).toBe(true)
    const a = view(coordinator, 'published', ownProgramme).actions
    expect(a).toContain('takeOffline')
    expect(a).not.toContain('archive')
  })

  it('an archived page offers Restore to the platform admin and to the head of its office only', () => {
    expect(view(admin, 'archived', dept).actions).toEqual(['restore'])
    expect(view(hod, 'archived', dept).actions).toEqual(['restore'])
    expect(view(hod, 'archived', ownProgramme).actions).toEqual(['restore'])
    for (const who of [
      manager,
      editor,
      coordinator,
      person('contributor'),
      person('auditor', []),
      person('approver', ['Library']),
    ]) {
      const v = view(who, 'archived', notice)
      expect(v.actions).toEqual([])
      expect(v.showPublish).toBe(false)
    }
  })

  it('the Restore banner says what happens, and an archived page is never offered Publish', () => {
    const v = view(admin, 'archived', dept)
    expect(v.banner.en).toMatch(/Restore/)
    expect(v.showPublish).toBe(false)
    expect(v.banner.ur.length).toBeGreaterThan(10)
  })

  it('both steps agree with the policy that the server runs', () => {
    expect(
      checkTransition(
        hod,
        { ownerOffice: 'registrar', risk: 'standard', ...dept },
        'published',
        'archived',
      ),
    ).toBeNull()
    expect(
      checkTransition(
        hod,
        { ownerOffice: 'registrar', risk: 'standard', ...dept },
        'archived',
        'published',
      ),
    ).toBeNull()
    expect(
      checkTransition(
        manager,
        { ownerOffice: 'registrar', risk: 'standard', ...notice },
        'archived',
        'published',
      ),
    ).not.toBeNull()
  })
})
