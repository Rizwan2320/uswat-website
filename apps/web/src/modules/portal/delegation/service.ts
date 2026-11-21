/**
 * What the delegation screen does, free of Next and PostgreSQL. The grantor is always the session account. A delegate has no way
 * to reach any of this on someone else's behalf: these actions never take a `forId`.
 */
import { isGrantId, validateGrant, type GrantErrors } from './rules'
import type { AuditView, DelegationStore, GivenView, ReceivedView } from './types'

export type Session = { id: string; fresh: boolean }
export type GrantResult =
  | { ok: true; expiresAt: number }
  | { ok: false; error: 'session' | 'invalid' | 'fresh' | 'unavailable' | 'self'; errors?: GrantErrors }
export type Overview = { given: GivenView[]; received: ReceivedView[]; audit: AuditView[] }

export function createDelegationService(deps: { store: DelegationStore; getSession: () => Promise<Session | null>; now?: () => number }) {
  const now = deps.now ?? Date.now
  return {
    async overview(): Promise<{ ok: true; value: Overview } | { ok: false; error: 'session' }> {
      const me = await deps.getSession()
      if (!me) return { ok: false, error: 'session' }
      const [given, received, audit] = await Promise.all([deps.store.listGiven(me.id, now()), deps.store.listReceived(me.id, now()), deps.store.recentAudit(me.id, 30)])
      return { ok: true, value: { given, received, audit } }
    },
    async grant(input: unknown): Promise<GrantResult> {
      const me = await deps.getSession()
      if (!me) return { ok: false, error: 'session' }
      const v = validateGrant(input)
      if (!v.ok) return { ok: false, error: 'invalid', errors: v.errors }
      // Giving someone else access to your data is a change to who can act as you: a recent second factor is needed (AUTH-09).
      if (!me.fresh) return { ok: false, error: 'fresh' }
      const delegate = await deps.store.findDelegate(v.value.delegateEmail)
      // Unknown, inactive and suspended all give the same answer, so the form is not a way to test which addresses have accounts.
      if (!delegate) return { ok: false, error: 'unavailable' }
      if (delegate.id === me.id) return { ok: false, error: 'self' }
      const made = await deps.store.create(me.id, { delegateId: delegate.id, sections: v.value.sections, days: v.value.days }, now())
      return { ok: true, expiresAt: made.expiresAt }
    },
    async revoke(id: unknown): Promise<{ ok: boolean; error?: 'session' | 'nothing' }> {
      const me = await deps.getSession()
      if (!me) return { ok: false, error: 'session' }
      if (!isGrantId(id)) return { ok: false, error: 'nothing' }
      return (await deps.store.revoke(me.id, id, now())) ? { ok: true } : { ok: false, error: 'nothing' }
    },
  }
}
