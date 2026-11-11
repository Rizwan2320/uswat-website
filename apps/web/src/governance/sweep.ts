/**
 * The lifecycle sweep: publishes approved records at `publishAt`, archives published records at
 * `expireAt`, and marks verified records Stale when `reviewDueAt` has passed (LIF-01, VER).
 *
 * Runs as the system, record by record, each in its own transaction together with its audit
 * entry. It never invents approval: a scheduled publish still passes the policy (so an
 * unverified record is refused and reported), and a record with a pending draft revision is
 * left to a reviewer instead of being archived over their head (see predictions P3c-b).
 *
 * Archiving and marking Stale change only the live row. Payload's `update` would take the latest
 * draft as its base and publish it, so these two use `payload.db.updateOne` with a partial
 * `governance` (checked in P3c-a: other fields, locales and the draft version are untouched) and
 * write the audit entry themselves. No revalidation hook runs here; listings use `currentWhere`,
 * which is date-based, so they are right before and after the sweep.
 */

import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from 'payload'

import { writeAudit } from './audit'
import { toRecordState } from './hooks'
import { dueAction, type LifecycleAction } from './lifecycle'
import { checkTransition } from './policy'
import { SYSTEM_ACTOR } from './roles'

const BATCH = 100

type Gov = Record<string, unknown>
interface Doc {
  id: string | number
  _status?: string
  governance?: Gov | null
  [key: string]: unknown
}

export interface Skipped {
  id: string | number
  action: LifecycleAction
  reason: string
}
export interface CollectionReport {
  published: number
  archived: number
  markedStale: number
  skipped: Skipped[]
  /** More records were due than one run handles; the next run continues. */
  truncated: boolean
}
export interface SweepReport {
  at: string
  collections: Record<string, CollectionReport>
}

const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)

function lifecycleOf(doc: Doc) {
  const g = (doc.governance ?? {}) as Gov
  const state = toRecordState(g)
  return {
    status: state.status,
    verification: state.verification,
    publishAt: str(g.publishAt),
    expireAt: str(g.expireAt),
    reviewDueAt: str(g.reviewDueAt),
    pinned: state.pinned,
  }
}

/** Collections that carry the governance group. */
export function governedSlugs(payload: Payload): string[] {
  return payload.config.collections
    .filter((c) => c.fields.some((f) => 'name' in f && f.name === 'governance'))
    .map((c) => c.slug)
}

async function inTransaction<T>(
  payload: Payload,
  work: (req: PayloadRequest) => Promise<T>,
  context: Record<string, unknown>,
): Promise<T> {
  const req = await createLocalReq({ context }, payload)
  const owns = await initTransaction(req)
  try {
    const result = await work(req)
    if (owns) await commitTransaction(req)
    return result
  } catch (e) {
    if (owns) await killTransaction(req)
    throw e
  }
}

const reasonOf = (e: unknown): string => {
  const err = e as { data?: { code?: string }; message?: string }
  return err.data?.code ?? err.message ?? 'ERROR'
}

export interface SweepOptions {
  now?: Date
  /** Limit to some collections (tests). */
  collections?: string[]
  /** Extra request context, for example `{ disableRevalidate: true }` outside Next. */
  context?: Record<string, unknown>
}

export async function runLifecycleSweep(
  payload: Payload,
  { now = new Date(), collections, context = {} }: SweepOptions = {},
): Promise<SweepReport> {
  const iso = now.toISOString()
  const report: SweepReport = { at: iso, collections: {} }

  for (const slug of collections ?? governedSlugs(payload)) {
    const c = slug as 'pages'
    const out: CollectionReport = {
      published: 0,
      archived: 0,
      markedStale: 0,
      skipped: [],
      truncated: false,
    }
    report.collections[slug] = out

    // 1. Archive live records whose expiry has passed.
    const expired = await payload.find({
      collection: c,
      depth: 0,
      limit: BATCH,
      overrideAccess: true,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { 'governance.status': { equals: 'published' } },
          { 'governance.expireAt': { less_than_equal: iso } },
        ],
      },
    })
    out.truncated ||= expired.totalDocs > expired.docs.length
    for (const doc of expired.docs as unknown as Doc[]) {
      if (dueAction(lifecycleOf(doc), now, true) !== 'archive') continue
      await archiveOrMark(payload, c, doc, 'archive', out, context)
    }

    // 2. Mark verified live records Stale when their review date has passed.
    const overdue = await payload.find({
      collection: c,
      depth: 0,
      limit: BATCH,
      overrideAccess: true,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { 'governance.status': { equals: 'published' } },
          { 'governance.verificationStatus': { equals: 'verified' } },
          { 'governance.reviewDueAt': { less_than_equal: iso } },
        ],
      },
    })
    out.truncated ||= overdue.totalDocs > overdue.docs.length
    for (const doc of overdue.docs as unknown as Doc[]) {
      if (dueAction(lifecycleOf(doc), now, true) !== 'mark_stale') continue
      await archiveOrMark(payload, c, doc, 'mark_stale', out, context)
    }

    // 3. Publish approved records whose publishAt has come. Judged on the latest saved version.
    const scheduled = await payload.find({
      collection: c,
      draft: true,
      depth: 0,
      limit: BATCH,
      overrideAccess: true,
      where: {
        and: [
          { 'governance.status': { equals: 'approved' } },
          { 'governance.publishAt': { less_than_equal: iso } },
        ],
      },
    })
    out.truncated ||= scheduled.totalDocs > scheduled.docs.length
    for (const doc of scheduled.docs as unknown as Doc[]) {
      const action = dueAction(lifecycleOf(doc), now, false)
      if (action !== 'publish') {
        out.skipped.push({ id: doc.id, action: 'publish', reason: 'ALREADY_EXPIRED' })
        continue
      }
      try {
        await inTransaction(
          payload,
          (req) =>
            payload.update({
              collection: c,
              id: doc.id,
              req,
              overrideAccess: true,
              depth: 0,
              data: { _status: 'published', governance: { status: 'published' } } as never,
            }),
          context,
        )
        out.published++
      } catch (e) {
        out.skipped.push({ id: doc.id, action: 'publish', reason: reasonOf(e) })
      }
    }
  }
  return report
}

async function archiveOrMark(
  payload: Payload,
  collection: 'pages',
  doc: Doc,
  action: 'archive' | 'mark_stale',
  out: CollectionReport,
  context: Record<string, unknown>,
): Promise<void> {
  const state = toRecordState(doc.governance)
  if (action === 'archive') {
    const denial = checkTransition(SYSTEM_ACTOR, state, 'published', 'archived')
    if (denial) {
      out.skipped.push({ id: doc.id, action, reason: denial.code })
      return
    }
  }
  const patch: Gov = action === 'archive' ? { status: 'archived' } : { verificationStatus: 'stale' }
  try {
    await inTransaction(
      payload,
      async (req) => {
        await payload.db.updateOne({
          collection,
          id: doc.id,
          req,
          returning: false,
          data: { governance: patch } as never,
        })
        await writeAudit({
          action: 'update',
          collection,
          recordId: doc.id,
          req,
          previous: doc,
          next: { ...doc, governance: { ...(doc.governance ?? {}), ...patch } },
        })
      },
      context,
    )
    if (action === 'archive') out.archived++
    else out.markedStale++
  } catch (e) {
    out.skipped.push({ id: doc.id, action, reason: reasonOf(e) })
  }
}
