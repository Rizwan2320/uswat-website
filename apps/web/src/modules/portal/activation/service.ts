/** What an activation action does, free of Next and PostgreSQL. The head comes from the session only. */
import { validateActivation } from './rules'
import type { ActivationDecision, ActivationStore, PendingItem } from './types'

export type HeadSession = { id: string; fresh: boolean }
export type PendingResult = { ok: true; items: PendingItem[] } | { ok: false; error: 'session' | 'unavailable' }
export type ActivateResult = { ok: true; decision: ActivationDecision } | { ok: false; error: 'session' | 'invalid' | 'fresh' | 'unavailable' | 'stale' }

export function createActivationService(deps: { store: ActivationStore; getHead: () => Promise<HeadSession | null>; now?: () => number }) {
  const now = deps.now ?? Date.now
  return {
    async list(): Promise<PendingResult> {
      const me = await deps.getHead()
      if (!me) return { ok: false, error: 'session' }
      if (!(await deps.store.isHead(me.id))) return { ok: false, error: 'unavailable' }
      return { ok: true, items: await deps.store.listPending(me.id) }
    },
    async decide(input: unknown): Promise<ActivateResult> {
      const me = await deps.getHead()
      if (!me) return { ok: false, error: 'session' }
      const v = validateActivation(input)
      if (!v.ok) return { ok: false, error: 'invalid' }
      if (!me.fresh) return { ok: false, error: 'fresh' }
      const outcome = await deps.store.decide(me.id, v.value, now())
      if (outcome === 'forbidden') return { ok: false, error: 'unavailable' }
      if (outcome === 'stale') return { ok: false, error: 'stale' }
      return { ok: true, decision: v.value.decision }
    },
  }
}
