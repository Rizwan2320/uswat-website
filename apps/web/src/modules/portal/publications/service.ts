/**
 * What the publication actions do, free of Next and PostgreSQL so it is tested directly. The account comes from `getAccount`
 * (the session). Works from the source are validated one by one; invalid ones are dropped and counted, never stored.
 */
import type { ProfileStore } from '../profile/types'
import { isWorkId, validateCandidate } from './rules'
import type { CandidateSource, HarvestCounts, PublicationStore } from './types'

export type Account = { id: string; email: string }
export type PubResult =
  | { ok: true; counts?: HarvestCounts }
  | { ok: false; error: 'session' | 'orcid' | 'source' | 'invalid' | 'nothing' }

export function createPublicationService(deps: {
  store: PublicationStore
  profiles: ProfileStore
  source: CandidateSource
  getAccount: () => Promise<Account | null>
  now?: () => number
}) {
  const now = deps.now ?? Date.now
  return {
    async harvest(): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      const { profile } = await deps.profiles.load(account)
      if (!profile.orcid) return { ok: false, error: 'orcid' }
      let raw: unknown[]
      try {
        raw = await deps.source.fetch(profile.orcid)
      } catch {
        return { ok: false, error: 'source' }
      }
      if (!Array.isArray(raw)) return { ok: false, error: 'source' }
      const valid = raw.flatMap((r) => {
        const c = validateCandidate(r, now())
        return c ? [c] : []
      })
      const { added, alreadyKnown } = await deps.store.addCandidates(account.id, valid, deps.source.sample)
      return { ok: true, counts: { added, alreadyKnown, invalid: raw.length - valid.length } }
    },
    async claim(workId: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (!isWorkId(workId)) return { ok: false, error: 'invalid' }
      return (await deps.store.claim(account.id, workId)) ? { ok: true } : { ok: false, error: 'nothing' }
    },
    async reject(workId: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (!isWorkId(workId)) return { ok: false, error: 'invalid' }
      return (await deps.store.reject(account.id, workId)) ? { ok: true } : { ok: false, error: 'nothing' }
    },
    async markDuplicate(workId: unknown, ofId: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (!isWorkId(workId) || !isWorkId(ofId)) return { ok: false, error: 'invalid' }
      return (await deps.store.markDuplicate(account.id, workId, ofId)) ? { ok: true } : { ok: false, error: 'nothing' }
    },
  }
}
