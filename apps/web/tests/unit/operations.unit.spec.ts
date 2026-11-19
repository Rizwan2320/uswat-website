import { describe, expect, it } from 'vitest'

import {
  NO_OFFICE,
  readReport,
  summarizeSweeps,
  tallyOffices,
  type JobRow,
  type OfficeRecord,
} from '../../src/governance/operations'

const NOW = new Date('2027-03-10T12:00:00.000Z')
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString()

const report = (over: Record<string, unknown> = {}) => ({
  at: hoursAgo(1),
  collections: {
    pages: { published: 2, archived: 1, markedStale: 3, skipped: [], truncated: false, ...over },
  },
})
const run = (hAgo: number, over: Partial<JobRow> = {}, rep: unknown = report()): JobRow => ({
  createdAt: hoursAgo(hAgo),
  completedAt: hoursAgo(hAgo),
  hasError: false,
  log: [{ state: 'succeeded', output: { report: rep } }],
  ...over,
})

describe('readReport', () => {
  it('adds up every collection and lists why records were skipped', () => {
    const r = readReport({
      collections: {
        pages: { published: 1, archived: 0, markedStale: 2, skipped: [{ id: 7, action: 'publish', reason: 'Not verified' }], truncated: false },
        news: { published: 4, archived: 1, markedStale: 0, skipped: [], truncated: true },
      },
    })
    expect(r).toMatchObject({ published: 5, archived: 1, markedStale: 2, skipped: 1, truncated: true })
    expect(r?.skippedReasons).toEqual(['pages #7: Not verified'])
  })
  it('gives null, not zeros, for anything unreadable', () => {
    for (const bad of [null, undefined, 'x', 5, [], {}, { collections: [] }]) expect(readReport(bad)).toBeNull()
  })
})

describe('summarizeSweeps', () => {
  it('says never when there are no runs, or only unfinished ones', () => {
    expect(summarizeSweeps([], NOW).state).toBe('never')
    expect(summarizeSweeps([{ createdAt: hoursAgo(0), completedAt: null, hasError: false }], NOW).state).toBe('never')
  })
  it('is ok when the latest run is recent, and totals the last 24 hours only', () => {
    const s = summarizeSweeps([run(1), run(2), run(30)], NOW)
    expect(s.state).toBe('ok')
    expect(s.last24h).toMatchObject({ runs: 2, failures: 0, published: 4, archived: 2, markedStale: 6 })
    expect(s.message).toContain('60 minutes ago')
  })
  it('is late after three hours with no run', () => {
    expect(summarizeSweeps([run(3.5)], NOW).state).toBe('late')
    expect(summarizeSweeps([run(2.9)], NOW).state).toBe('ok')
  })
  it('is failed when the latest run failed, and names the last good one', () => {
    const s = summarizeSweeps([run(0.5, { hasError: true, log: [] }), run(2)], NOW)
    expect(s.state).toBe('failed')
    expect(s.message).toContain('2 hours ago')
    expect(s.last24h.failures).toBe(1)
  })
  it('says so when there has never been a good run', () => {
    const s = summarizeSweeps([run(1, { hasError: true, completedAt: null, log: [] })], NOW)
    expect(s.state).toBe('failed')
    expect(s.message).toContain('no good run')
  })
  it('a later good run clears an earlier failure', () => {
    expect(summarizeSweeps([run(0.5), run(1.5, { hasError: true })], NOW).state).toBe('ok')
  })
  it('does not trust an unreadable report: it is flagged, not counted as zero work', () => {
    const s = summarizeSweeps([run(1, {}, 'garbage')], NOW)
    expect(s.last?.reportReadable).toBe(false)
    expect(s.state).toBe('ok')
  })
  it('ignores a run dated in the future instead of reporting it as "just now"', () => {
    const future = run(-48)
    expect(summarizeSweeps([future], NOW).state).toBe('never')
    expect(summarizeSweeps([future, run(2)], NOW).message).toContain('2 hours ago')
  })
  it('counts skipped records', () => {
    const rep = report({ skipped: [{ id: 1, action: 'publish', reason: 'Not verified' }] })
    expect(summarizeSweeps([run(1, {}, rep)], NOW).last24h.skipped).toBe(1)
  })
})

describe('tallyOffices', () => {
  const rec = (o: Partial<OfficeRecord>): OfficeRecord => ({ ownerOffice: 'Registrar', status: 'published', ...o })
  it('counts drafts, in review, stale and expiring by office', () => {
    const t = tallyOffices(
      [
        rec({ status: 'draft' }),
        rec({ status: 'draft' }),
        rec({ status: 'in_review' }),
        rec({ verificationStatus: 'stale' }),
        rec({ reviewDueAt: hoursAgo(5) }),
        rec({ expireAt: '2027-03-15T00:00:00.000Z' }),
        rec({ ownerOffice: 'Library', status: 'draft' }),
      ],
      NOW,
    )
    expect(t[0]).toEqual({ office: 'Registrar', drafts: 2, inReview: 1, stale: 2, expiringSoon: 1 })
    expect(t[1]).toEqual({ office: 'Library', drafts: 1, inReview: 0, stale: 0, expiringSoon: 0 })
  })
  it('leaves out archived records and offices with nothing waiting', () => {
    const t = tallyOffices([rec({ status: 'archived', verificationStatus: 'stale' }), rec({})], NOW)
    expect(t).toEqual([])
  })
  it('puts records with no office under one clear name', () => {
    const t = tallyOffices([rec({ ownerOffice: null, status: 'draft' }), rec({ ownerOffice: '  ', status: 'draft' })], NOW)
    expect(t).toEqual([{ office: NO_OFFICE, drafts: 2, inReview: 0, stale: 0, expiringSoon: 0 }])
  })
  it('expiring soon: only within the window, only approved or live, not already past', () => {
    const t = tallyOffices(
      [
        rec({ expireAt: '2027-03-30T00:00:00.000Z' }), // 20 days: outside
        rec({ expireAt: '2027-03-01T00:00:00.000Z' }), // already past
        rec({ status: 'draft', expireAt: '2027-03-12T00:00:00.000Z' }), // not live
        rec({ status: 'approved', expireAt: '2027-03-12T00:00:00.000Z' }),
      ],
      NOW,
    )
    expect(t).toEqual([{ office: 'Registrar', drafts: 1, inReview: 0, stale: 0, expiringSoon: 1 }])
  })
  it('sorts the busiest office first, then by name', () => {
    const t = tallyOffices(
      [rec({ ownerOffice: 'B', status: 'draft' }), rec({ ownerOffice: 'A', status: 'draft' }), rec({ ownerOffice: 'C', status: 'draft' }), rec({ ownerOffice: 'C', status: 'draft' })],
      NOW,
    )
    expect(t.map((x) => x.office)).toEqual(['C', 'A', 'B'])
  })
})
