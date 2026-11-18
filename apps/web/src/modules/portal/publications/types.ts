/** A work found by a source (today a sample list; later OpenAlex by ORCID). Source text is data and is rendered as plain text only. */
export type Candidate = {
  title: string
  year: number
  venue: string
  /** As the source wrote it; normalised for matching in rules.ts. Empty when the work has no DOI. */
  doi: string
  authors: string[]
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
}

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
  addCandidates(accountId: string, works: Candidate[], sample: boolean): Promise<{ added: number; alreadyKnown: number }>
  list(accountId: string): Promise<WorkLists>
  /** Only a pending work can be decided. Returns false when nothing changed. */
  claim(accountId: string, workId: string): Promise<boolean>
  reject(accountId: string, workId: string): Promise<boolean>
  /** `ofId` must be a claimed work of the same account. Returns false when nothing changed. */
  markDuplicate(accountId: string, workId: string, ofId: string): Promise<boolean>
}
