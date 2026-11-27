/**
 * What the publication actions do, free of Next and PostgreSQL so it is tested directly. The account comes from `getAccount`
 * (the session). Works from the source are validated one by one; invalid ones are dropped and counted, never stored.
 */
import type { ProfileStore } from '../profile/types'
import type { DoiLookup } from './crossref'
import { exportWorks, EXPORT_FORMATS, type ExportFile } from './exporters'
import { parseImport } from './importers'
import { isWorkId, isWorkType, normaliseDoi, normaliseUrl, validateCandidate, validateWorkInput, type WorkField } from './rules'
import { MAX_FEATURED, type Candidate, type CandidateSource, type HarvestCounts, type PublicationStore } from './types'

export type Account = { id: string; email: string }
export type PubError = 'session' | 'orcid' | 'source' | 'invalid' | 'nothing' | 'exists' | 'notfound' | 'incomplete' | 'format' | 'size' | 'limit' | 'off'
export type PubResult = { ok: true; counts?: HarvestCounts; truncated?: boolean } | { ok: false; error: PubError; field?: WorkField; fields?: WorkField[] }
export type LookupResult = { ok: true; work: Candidate } | { ok: false; error: PubError; field?: WorkField }
export type ExportResult = ({ ok: true } & ExportFile) | { ok: false; error: PubError }

export function createPublicationService(deps: {
  store: PublicationStore
  profiles: ProfileStore
  source: CandidateSource
  /** null when the DOI lookup is switched off. */
  lookup?: DoiLookup | null
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
    /** Reads a DOI service for one record and returns it for the person to check. Nothing is stored. */
    async lookupDoi(doi: unknown): Promise<LookupResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (typeof doi !== 'string' || normaliseDoi(doi) === null) return { ok: false, error: 'invalid', field: 'doi' }
      if (!deps.lookup) return { ok: false, error: 'off' }
      const r = await deps.lookup(doi)
      if (!r.ok) return { ok: false, error: r.error }
      const work = validateCandidate(r.record, now())
      return work ? { ok: true, work } : { ok: false, error: 'incomplete' }
    },
    /** A work the person typed in, or checked after a lookup. It is theirs, so it is claimed at once. */
    async addWork(input: unknown, via: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (via !== 'manual' && via !== 'doi') return { ok: false, error: 'invalid' }
      const v = validateWorkInput(input, now())
      if (!v.ok) return { ok: false, error: 'invalid', field: v.field, fields: v.fields }
      const r = await deps.store.addClaimed(account.id, v.work, via)
      return r.ok ? { ok: true } : { ok: false, error: 'exists' }
    },
    /** BibTeX, RIS or CSV text. Records go to "To review", where the person claims them. */
    async importFile(text: unknown, filename: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      const parsed = parseImport(text, filename)
      if (!parsed.ok) return { ok: false, error: parsed.error }
      const valid = parsed.records.flatMap((r) => {
        const c = validateCandidate(r, now())
        return c ? [c] : []
      })
      const { added, alreadyKnown } = await deps.store.addCandidates(account.id, valid, false, 'file')
      return { ok: true, counts: { added, alreadyKnown, invalid: parsed.records.length - valid.length }, ...(parsed.truncated ? { truncated: true } : {}) }
    },
    async updateDetails(workId: unknown, details: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (!isWorkId(workId) || typeof details !== 'object' || details === null) return { ok: false, error: 'invalid' }
      const d = details as Record<string, unknown>
      if (!isWorkType(d.workType)) return { ok: false, error: 'invalid', field: 'type' }
      const urlText = typeof d.url === 'string' ? d.url : ''
      const url = urlText.trim() === '' ? '' : normaliseUrl(urlText)
      if (url === null) return { ok: false, error: 'invalid', field: 'url' }
      return (await deps.store.updateDetails(account.id, workId, { workType: d.workType, url })) ? { ok: true } : { ok: false, error: 'nothing' }
    },
    async setFeatured(workId: unknown, featured: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (!isWorkId(workId) || typeof featured !== 'boolean') return { ok: false, error: 'invalid' }
      if (await deps.store.setFeatured(account.id, workId, featured)) return { ok: true }
      if (featured) {
        const { claimed } = await deps.store.list(account.id)
        if (claimed.some((w) => w.id === workId) && claimed.filter((w) => w.featured).length >= MAX_FEATURED) return { ok: false, error: 'limit' }
      }
      return { ok: false, error: 'nothing' }
    },
    async setPublic(workId: unknown, isPublic: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (!isWorkId(workId) || typeof isPublic !== 'boolean') return { ok: false, error: 'invalid' }
      return (await deps.store.setPublic(account.id, workId, isPublic)) ? { ok: true } : { ok: false, error: 'nothing' }
    },
    /** Works that were typed, looked up or imported. A harvested work is kept so "not me" is remembered. */
    async remove(workId: unknown): Promise<PubResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (!isWorkId(workId)) return { ok: false, error: 'invalid' }
      return (await deps.store.remove(account.id, workId)) ? { ok: true } : { ok: false, error: 'nothing' }
    },
    /** The person's own claimed works, public or not. */
    async exportWorks(format: unknown): Promise<ExportResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (typeof format !== 'string' || !(EXPORT_FORMATS as readonly string[]).includes(format)) return { ok: false, error: 'invalid' }
      const { claimed } = await deps.store.list(account.id)
      return { ok: true, ...exportWorks(claimed, format as (typeof EXPORT_FORMATS)[number]) }
    },
  }
}
