/**
 * One record's path through the real workflow, shared by the seeds that have no slug-keyed linking
 * (contacts, tags, articles, merit lists). Found by governance.source, so a second run finds what the first made.
 *
 *   wanted 'draft'      -> created as a draft and left there
 *   wanted 'in_review'  -> created, then submitted for review and left there (an approver has work to do)
 *   wanted 'published'  -> draft, in_review, approved and verified, published (all by the acting platformAdmin)
 *
 * A record that already exists is never moved backwards or rewritten; a draft or in-review record that is
 * wanted published is moved forward. Written under the real access rules (`overrideAccess: false`).
 */
import type { Cms } from '../writer'

import { SAMPLE_HOST } from './data'
import type { SeedActor } from './apply'

export type SeedState = 'draft' | 'in_review' | 'published'
export type FlowResult = { created: number; published: number; inReview: number; drafts: number; unchanged: number }
export const emptyResult = (): FlowResult => ({ created: 0, published: 0, inReview: 0, drafts: 0, unchanged: 0 })
export const addResults = (a: FlowResult, b: FlowResult): FlowResult => ({
  created: a.created + b.created,
  published: a.published + b.published,
  inReview: a.inReview + b.inReview,
  drafts: a.drafts + b.drafts,
  unchanged: a.unchanged + b.unchanged,
})

type Args = Record<string, unknown>
type Found = { id: number | string; status: string }
const CONTEXT = { disableRevalidate: true }
export const REVIEW_DUE = '2027-12-31T00:00:00.000Z'

export async function loadBySource(cms: Cms, collection: string): Promise<Map<string, Found>> {
  const found = await cms.find({
    collection,
    draft: true,
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: { 'governance.source': { like: `https://${SAMPLE_HOST}/seed/${collection}/` } },
  })
  const out = new Map<string, Found>()
  for (const d of found.docs) {
    const g = d.governance as { source?: string; status?: string } | undefined
    out.set(String(g?.source ?? ''), {
      id: d.id as number | string,
      status: (d as { _status?: string })._status === 'published' ? 'published' : String(g?.status ?? 'draft'),
    })
  }
  return out
}

export type SeedRecord = {
  collection: string
  source: string
  state: SeedState
  data: Args
  /** Values for the Urdu locale, written while the record is still a draft. */
  ur?: Args
}

/** Returns the id of the record (created or found), and how it moved. */
export async function seedRecord(
  cms: Cms,
  actor: SeedActor,
  existing: Map<string, Found>,
  r: SeedRecord,
  out: FlowResult,
): Promise<number | string> {
  const as = (): Args => ({ user: actor.user, overrideAccess: false, context: CONTEXT })
  let rec = existing.get(r.source)
  if (rec && (rec.status === 'published' || r.state === 'draft' || (r.state === 'in_review' && rec.status !== 'draft'))) {
    out.unchanged++
    return rec.id
  }
  if (!rec) {
    const doc = await cms.create({ collection: r.collection, draft: true, data: r.data, ...as() })
    rec = { id: doc.id as number | string, status: 'draft' }
    existing.set(r.source, rec)
    out.created++
    if (r.ur) await cms.update({ collection: r.collection, id: rec.id, draft: true, locale: 'ur', data: r.ur, ...as() })
  }
  const step = (data: Args) => cms.update({ collection: r.collection, id: rec!.id, draft: true, data, ...as() })
  if (r.state === 'draft') {
    out.drafts++
    return rec.id
  }
  await step({ governance: { status: 'in_review' } })
  if (r.state === 'in_review') {
    rec.status = 'in_review'
    out.inReview++
    return rec.id
  }
  await step({ governance: { status: 'approved', verificationStatus: 'verified', reviewDueAt: REVIEW_DUE } })
  await cms.update({ collection: r.collection, id: rec.id, data: { _status: 'published' }, ...as() })
  rec.status = 'published'
  out.published++
  return rec.id
}
