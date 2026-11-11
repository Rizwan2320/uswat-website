/**
 * Lifecycle rules as pure functions (Addendum 7: LIF-01, LIF-02, stale content).
 *
 * Two things are kept apart on purpose:
 * - what is *current* is decided at query time from dates (`currentWhere`), so a record that
 *   passed its expiry never shows in a current list even if the sweep has not run yet;
 * - the sweep (sweep.ts) then records the change (archives, marks stale, publishes on schedule).
 */

import type { Where } from 'payload'

export const AGE_OUT_DAYS_NOTICES = 90

export interface LifecycleRecord {
  status: string
  verification: string
  publishAt: string | null
  expireAt: string | null
  reviewDueAt: string | null
  pinned: boolean
}

export type LifecycleAction = 'publish' | 'archive' | 'mark_stale'

const t = (iso: string | null): number | null => {
  if (!iso) return null
  const n = Date.parse(iso)
  return Number.isNaN(n) ? null : n
}

/**
 * What the sweep should do to a record right now, if anything. One action at most, in this
 * order: archive (expired), then publish (scheduled), then mark stale (review overdue).
 * `live` is true for the record as currently shown to the public.
 */
export function dueAction(rec: LifecycleRecord, now: Date, live: boolean): LifecycleAction | null {
  const at = now.getTime()
  const expire = t(rec.expireAt)
  if (live && rec.status === 'published' && expire !== null && expire <= at) return 'archive'
  const publish = t(rec.publishAt)
  if (!live && rec.status === 'approved' && publish !== null && publish <= at) {
    // Never publish something that has already expired; a reviewer has to look at it.
    return expire !== null && expire <= at ? null : 'publish'
  }
  const due = t(rec.reviewDueAt)
  if (
    live &&
    rec.status === 'published' &&
    rec.verification === 'verified' &&
    due !== null &&
    due <= at
  ) {
    return 'mark_stale'
  }
  return null
}

export interface CurrentListingOptions {
  /** Leave current lists this many days after `dateField` when there is no expireAt (notices: 90). */
  ageOutDays?: number
  /** The date an item counts from for age-out, as a field path (for example `publishedOn`). */
  dateField?: string
}

/**
 * Filter for "current" public lists: not archived, not past its expiry, and (when configured)
 * not aged out. Combine it with the type's own filters. `now` is passed in so tests are exact.
 */
export function currentWhere(now: Date, opts: CurrentListingOptions = {}): Where {
  const iso = now.toISOString()
  const notExpired: Where = {
    or: [
      { 'governance.expireAt': { exists: false } },
      { 'governance.expireAt': { greater_than: iso } },
    ],
  }
  const conditions: Where[] = [{ 'governance.status': { not_equals: 'archived' } }, notExpired]
  if (opts.ageOutDays && opts.dateField) {
    const cutoff = new Date(now.getTime() - opts.ageOutDays * 86_400_000).toISOString()
    conditions.push({
      or: [
        { 'governance.expireAt': { exists: true } }, // has its own end date; age-out does not apply
        { 'governance.pinned': { equals: true } },
        { [opts.dateField]: { greater_than: cutoff } },
      ],
    })
  }
  return { and: conditions }
}

/** The reviewer queue (LIF-03, VER-02): what a reviewer should look at next. */
export function reviewQueueWhere(): Where {
  return {
    or: [
      { 'governance.status': { equals: 'in_review' } },
      // Drafts that no person wrote wait for a person.
      {
        and: [
          { 'governance.status': { equals: 'draft' } },
          { 'governance.origin': { in: ['importer', 'watcher'] } },
        ],
      },
      { 'governance.verificationStatus': { equals: 'stale' } },
    ],
  }
}
