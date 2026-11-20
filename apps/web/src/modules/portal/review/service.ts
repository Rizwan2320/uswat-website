/**
 * What a reviewer action does, free of Next and PostgreSQL so it is tested directly. The reviewer comes from `getReviewer`
 * (the session, with whether the second factor is fresh) and never from the request. A subject that does not exist, is in another
 * department, is the reviewer, or is not submitted all answer 'unavailable', so the answer reveals nothing about other people.
 */
import { isSubjectId, validateDecision, type DecisionErrors } from './rules'
import type { Decision, QueueItem, ReviewDetail, ReviewStore } from './types'

export type ReviewerSession = { id: string; fresh: boolean }

export type ListResult = { ok: true; items: QueueItem[] } | { ok: false; error: 'session' | 'unavailable' }
export type OpenResult = { ok: true; detail: ReviewDetail } | { ok: false; error: 'session' | 'unavailable' }
export type DecideResult =
  | { ok: true; decision: Decision }
  | { ok: false; error: 'session' | 'invalid' | 'fresh' | 'unavailable' | 'stale'; errors?: DecisionErrors }

export function createReviewService(deps: { store: ReviewStore; getReviewer: () => Promise<ReviewerSession | null>; now?: () => number }) {
  const now = deps.now ?? Date.now
  return {
    async list(): Promise<ListResult> {
      const me = await deps.getReviewer()
      if (!me) return { ok: false, error: 'session' }
      if (!(await deps.store.isReviewer(me.id))) return { ok: false, error: 'unavailable' }
      return { ok: true, items: await deps.store.listQueue(me.id) }
    },
    async open(subjectId: unknown): Promise<OpenResult> {
      const me = await deps.getReviewer()
      if (!me) return { ok: false, error: 'session' }
      if (!isSubjectId(subjectId)) return { ok: false, error: 'unavailable' }
      const detail = await deps.store.load(me.id, subjectId)
      return detail ? { ok: true, detail } : { ok: false, error: 'unavailable' }
    },
    async decide(input: unknown): Promise<DecideResult> {
      const me = await deps.getReviewer()
      if (!me) return { ok: false, error: 'session' }
      const v = validateDecision(input)
      if (!v.ok) return { ok: false, error: 'invalid', errors: v.errors }
      // Approving or declining changes what the university would publish about a named person: a recent second factor is needed.
      if (!me.fresh) return { ok: false, error: 'fresh' }
      const outcome = await deps.store.decide(me.id, v.value, now())
      if (outcome === 'forbidden') return { ok: false, error: 'unavailable' }
      if (outcome === 'stale') return { ok: false, error: 'stale' }
      return { ok: true, decision: v.value.decision }
    },
  }
}
