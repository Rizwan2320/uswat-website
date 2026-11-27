/**
 * What a Registrar action does, free of Next and PostgreSQL. The Verifier comes from `getVerifier` (the session, with whether the
 * second factor is fresh and whether a passkey is registered) and never from the request. AUTH-07: a privileged role needs a passkey,
 * not an authenticator app, so an account without one gets no access. An unknown person, the Verifier's own record and a
 * non-Verifier all answer 'unavailable'.
 */
import { SEARCH_MAX, isSubjectId, validateSave, type FixedErrors } from './rules'
import type { PersonDetail, PersonRow, RegistrarStore } from './types'

export type VerifierSession = { id: string; fresh: boolean; hasPasskey: boolean }
type Gate = { ok: false; error: 'session' | 'unavailable' }

export type SearchResult = { ok: true; people: PersonRow[] } | Gate
export type OpenResult = { ok: true; detail: PersonDetail } | Gate
export type SaveResult = { ok: true } | { ok: false; error: 'session' | 'invalid' | 'fresh' | 'unavailable' | 'has-role'; errors?: FixedErrors }

export function createRegistrarService(deps: { store: RegistrarStore; getVerifier: () => Promise<VerifierSession | null>; now?: () => number }) {
  const now = deps.now ?? Date.now
  /** The session, and the role with a passkey; null with the reason otherwise. */
  async function gate(): Promise<VerifierSession | Gate> {
    const me = await deps.getVerifier()
    if (!me) return { ok: false, error: 'session' }
    if (!me.hasPasskey || !(await deps.store.isVerifier(me.id))) return { ok: false, error: 'unavailable' }
    return me
  }
  return {
    async search(q: unknown): Promise<SearchResult> {
      const me = await gate()
      if ('ok' in me) return me
      const term = typeof q === 'string' ? q.replace(/\s+/g, ' ').trim().slice(0, SEARCH_MAX) : ''
      return { ok: true, people: term.length < 2 ? [] : await deps.store.search(me.id, term) }
    },
    async open(subjectId: unknown): Promise<OpenResult> {
      const me = await gate()
      if ('ok' in me) return me
      if (!isSubjectId(subjectId)) return { ok: false, error: 'unavailable' }
      const detail = await deps.store.load(me.id, subjectId)
      return detail ? { ok: true, detail } : { ok: false, error: 'unavailable' }
    },
    async save(input: unknown): Promise<SaveResult> {
      const me = await gate()
      if ('ok' in me) return me
      const v = validateSave(input)
      if (!v.ok) return { ok: false, error: 'invalid', errors: v.errors }
      // Changing what the university says about a named person: a recent passkey proof is needed.
      if (!me.fresh) return { ok: false, error: 'fresh' }
      const outcome = await deps.store.save(me.id, v.value, now())
      if (outcome === 'forbidden') return { ok: false, error: 'unavailable' }
      if (outcome === 'has-role') return { ok: false, error: 'has-role' }
      return { ok: true }
    },
  }
}
