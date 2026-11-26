export const WORK_TYPES = ['article', 'conference', 'chapter', 'book', 'thesis', 'patent', 'report', 'other'] as const
export type WorkType = (typeof WORK_TYPES)[number]
/** Where a row came from. Only 'harvest' rows are kept for good, so a "not me" is remembered. */
export const ORIGINS = ['harvest', 'doi', 'manual', 'file'] as const
export type Origin = (typeof ORIGINS)[number]
export const MAX_FEATURED = 5

/** A work found by a source or typed in. Source text is data and is rendered as plain text only. */
export type Candidate = {
  title: string
  year: number
  venue: string
  /** As the source wrote it; normalised for matching in rules.ts. Empty when the work has no DOI. */
  doi: string
  authors: string[]
  /** Defaults to 'article' when a source does not say. */
  workType?: WorkType
  /** Optional http(s) link to the full text; empty when none. */
  url?: string
}

export type Decision = 'claimed' | 'rejected' | 'duplicate'
export type Status = 'pending' | Decision

export type StoredWork = Candidate & {
  id: string
  status: Status
  /** For status 'duplicate': the claimed work this one repeats. */
  duplicateOf: string | null
  /** True for dummy data; the "Sample" label on screen is driven by this. */
  sample: boolean
  workType: WorkType
  origin: Origin
  url: string
  featured: boolean
  isPublic: boolean
}

/** What the person may change on a claimed work. */
export type WorkDetails = { workType: WorkType; url: string }

export type WorkLists = { pending: StoredWork[]; claimed: StoredWork[]; rejected: StoredWork[]; duplicate: StoredWork[] }

export type HarvestCounts = { added: number; alreadyKnown: number; invalid: number }

/** Where works come from. The real one reads OpenAlex by ORCID iD; this workspace cannot reach it, so today it is a sample list. */
export interface CandidateSource {
  readonly sample: boolean
  fetch(orcid: string): Promise<unknown[]>
}

/** Where claim decisions live. The account id always comes from the session, never from a request. */
export interface PublicationStore {
  /** Stores new candidates; anything already known to this account (any status, by DOI or by title and year) is skipped. */
  addCandidates(accountId: string, works: Candidate[], sample: boolean, origin?: Origin): Promise<{ added: number; alreadyKnown: number }>
  /** A work the person typed in or looked up: stored as claimed at once. `exists` when this account already has it in any status. */
  addClaimed(accountId: string, work: Candidate, origin: Exclude<Origin, 'harvest'>): Promise<{ ok: true; id: string } | { ok: false; reason: 'exists' }>
  list(accountId: string): Promise<WorkLists>
  /** Only a pending work can be decided. Returns false when nothing changed. */
  claim(accountId: string, workId: string): Promise<boolean>
  reject(accountId: string, workId: string): Promise<boolean>
  /** `ofId` must be a claimed work of the same account. Returns false when nothing changed. */
  markDuplicate(accountId: string, workId: string, ofId: string): Promise<boolean>
  /** Claimed works only. */
  updateDetails(accountId: string, workId: string, details: WorkDetails): Promise<boolean>
  /** Claimed works only. Turning it on fails (false) when five are already featured. */
  setFeatured(accountId: string, workId: string, featured: boolean): Promise<boolean>
  /** Claimed works only. */
  setPublic(accountId: string, workId: string, isPublic: boolean): Promise<boolean>
  /** Only works that did not come from a harvest (typed, looked up, imported). */
  remove(accountId: string, workId: string): Promise<boolean>
}
