import { describe, expect, it } from 'vitest'

import { STEP_TARGET, workflowView, type StepAction } from '../../src/admin/workflow/rules'
import { checkTransition } from '../../src/governance/policy'
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
    expect(draft.actions).toEqual(['approve', 'markVerified'])
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
            if (a === 'markVerified') continue
            expect(
              checkTransition(actor, { ownerOffice: 'registrar', risk }, stage, STEP_TARGET[a]),
              `${r} ${stage} ${risk} ${a}`,
            ).toBeNull()
          }
        }
      }
    }
  })
})
