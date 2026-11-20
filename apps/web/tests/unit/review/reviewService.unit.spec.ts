import { describe, expect, it, vi } from 'vitest'

import { createReviewService } from '@/modules/portal/review/service'
import type { DecideOutcome, ReviewStore } from '@/modules/portal/review/types'

const store = (outcome: DecideOutcome = 'ok', reviewer = true): ReviewStore & { decide: ReturnType<typeof vi.fn>; load: ReturnType<typeof vi.fn>; listQueue: ReturnType<typeof vi.fn> } => ({
  isReviewer: vi.fn(async () => reviewer),
  listQueue: vi.fn(async () => []),
  load: vi.fn(async () => null),
  decide: vi.fn(async () => outcome),
})
const svc = (s: ReviewStore, session: { id: string; fresh: boolean } | null = { id: 'rev1', fresh: true }) =>
  createReviewService({ store: s, getReviewer: async () => session, now: () => 1000 })
const input = { subjectId: 'p1', rev: 1, decision: 'approved' }

describe('review service', () => {
  it('needs a session for everything and never reaches the store without one', async () => {
    const s = store()
    const v = svc(s, null)
    expect(await v.list()).toEqual({ ok: false, error: 'session' })
    expect(await v.open('p1')).toEqual({ ok: false, error: 'session' })
    expect(await v.decide(input)).toEqual({ ok: false, error: 'session' })
    expect(s.listQueue).not.toHaveBeenCalled()
    expect(s.decide).not.toHaveBeenCalled()
  })
  it('answers a non-reviewer with unavailable, same as a missing subject', async () => {
    const s = store('ok', false)
    expect(await svc(s).list()).toEqual({ ok: false, error: 'unavailable' })
    expect(s.listQueue).not.toHaveBeenCalled()
    expect(await svc(store()).open('p1')).toEqual({ ok: false, error: 'unavailable' })
    expect(await svc(store()).open('../x')).toEqual({ ok: false, error: 'unavailable' })
  })
  it('validates before it asks for the second factor, and asks for it before writing', async () => {
    const s = store()
    expect((await svc(s).decide({ ...input, decision: 'changes-requested' }))).toMatchObject({ ok: false, error: 'invalid' })
    expect(await svc(s, { id: 'rev1', fresh: false }).decide(input)).toEqual({ ok: false, error: 'fresh' })
    expect(s.decide).not.toHaveBeenCalled()
  })
  it('passes the session reviewer, never a request value, and reports the outcome', async () => {
    const s = store()
    expect(await svc(s).decide(input)).toEqual({ ok: true, decision: 'approved' })
    expect(s.decide).toHaveBeenCalledWith('rev1', { subjectId: 'p1', rev: 1, decision: 'approved', note: null }, 1000)
    expect(await svc(store('forbidden')).decide(input)).toEqual({ ok: false, error: 'unavailable' })
    expect(await svc(store('stale')).decide(input)).toEqual({ ok: false, error: 'stale' })
    expect(await svc(s).decide({ ...input, reviewerId: 'someone' })).toMatchObject({ ok: false, error: 'invalid' })
  })
})
