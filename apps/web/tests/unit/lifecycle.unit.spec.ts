import { describe, expect, it } from 'vitest'

import {
  currentWhere,
  dueAction,
  reviewQueueWhere,
  type LifecycleRecord,
} from '@/governance/lifecycle'

const NOW = new Date('2026-11-09T10:00:00.000Z')
const past = '2026-11-01T00:00:00.000Z'
const future = '2026-12-01T00:00:00.000Z'

const rec = (o: Partial<LifecycleRecord> = {}): LifecycleRecord => ({
  status: 'published',
  verification: 'verified',
  publishAt: null,
  expireAt: null,
  reviewDueAt: null,
  pinned: false,
  ...o,
})

describe('dueAction', () => {
  it('archives a live record whose expiry has passed (LIF-01)', () => {
    expect(dueAction(rec({ expireAt: past }), NOW, true)).toBe('archive')
  })

  it('leaves a live record alone before its expiry, and at none', () => {
    expect(dueAction(rec({ expireAt: future }), NOW, true)).toBeNull()
    expect(dueAction(rec(), NOW, true)).toBeNull()
  })

  it('archives exactly at the expiry instant', () => {
    expect(dueAction(rec({ expireAt: NOW.toISOString() }), NOW, true)).toBe('archive')
  })

  it('publishes an approved draft when its publish time arrives', () => {
    expect(dueAction(rec({ status: 'approved', publishAt: past }), NOW, false)).toBe('publish')
    expect(dueAction(rec({ status: 'approved', publishAt: future }), NOW, false)).toBeNull()
  })

  it('only publishes approved records', () => {
    for (const status of ['draft', 'in_review', 'archived']) {
      expect(dueAction(rec({ status, publishAt: past }), NOW, false), status).toBeNull()
    }
  })

  it('never publishes something that has already expired', () => {
    expect(
      dueAction(rec({ status: 'approved', publishAt: past, expireAt: past }), NOW, false),
    ).toBeNull()
  })

  it('marks a verified live record stale when its review is overdue', () => {
    expect(dueAction(rec({ reviewDueAt: past }), NOW, true)).toBe('mark_stale')
    expect(dueAction(rec({ reviewDueAt: future }), NOW, true)).toBeNull()
  })

  it('does not mark unverified or already stale records', () => {
    expect(dueAction(rec({ verification: 'unverified', reviewDueAt: past }), NOW, true)).toBeNull()
    expect(dueAction(rec({ verification: 'stale', reviewDueAt: past }), NOW, true)).toBeNull()
  })

  it('prefers archive over stale when both are due', () => {
    expect(dueAction(rec({ expireAt: past, reviewDueAt: past }), NOW, true)).toBe('archive')
  })

  it('ignores unparseable dates', () => {
    expect(dueAction(rec({ expireAt: 'not a date' }), NOW, true)).toBeNull()
  })
})

describe('currentWhere', () => {
  it('excludes archived and past-expiry records', () => {
    const w = currentWhere(NOW)
    expect(w).toEqual({
      and: [
        { 'governance.status': { not_equals: 'archived' } },
        {
          or: [
            { 'governance.expireAt': { exists: false } },
            { 'governance.expireAt': { greater_than: NOW.toISOString() } },
          ],
        },
      ],
    })
  })

  it('adds the 90-day age-out unless pinned or given an expiry', () => {
    const cutoff = new Date(NOW.getTime() - 90 * 86_400_000).toISOString()
    const w = currentWhere(NOW, { ageOutDays: 90, dateField: 'publishedOn' }) as {
      and: unknown[]
    }
    expect(w.and).toHaveLength(3)
    expect(w.and[2]).toEqual({
      or: [
        { 'governance.expireAt': { exists: true } },
        { 'governance.pinned': { equals: true } },
        { publishedOn: { greater_than: cutoff } },
      ],
    })
  })

  it('does not age out without a date field', () => {
    const w = currentWhere(NOW, { ageOutDays: 90 }) as { and: unknown[] }
    expect(w.and).toHaveLength(2)
  })
})

describe('reviewQueueWhere', () => {
  it('lists in-review, importer or watcher drafts, and stale records', () => {
    const w = reviewQueueWhere() as { or: unknown[] }
    expect(w.or).toHaveLength(3)
    expect(JSON.stringify(w)).toContain('"importer","watcher"')
    expect(JSON.stringify(w)).toContain('stale')
  })
})
