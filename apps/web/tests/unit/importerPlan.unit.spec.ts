import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { legacyKey } from '@/legacy/routeMap'

import { normaliseRecord, type SourceRecord } from '../../../../scripts/import/contract'
import { planImport, readRouteRows, type Existing, type Plan } from '../../../../scripts/import/plan'
import { readPack } from '../../../../scripts/import/cli'
import { redactContacts, attachmentIssue } from '../../../../scripts/import/redact'
import { buildReport } from '../../../../scripts/import/report'
import { assertLocalDatabase } from '../../../../scripts/import/writer'

const root = path.resolve(process.cwd(), '../..')
const sample = path.join(root, 'scripts/import/fixtures/sample')
const sampleRows = readRouteRows(readFileSync(path.join(sample, 'route_map.csv'), 'utf8'))
const sampleRecords = readPack(sample)

const asExisting = (plan: Plan, over: Partial<Existing> = {}) =>
  new Map<string, Existing>(
    plan.decisions
      .filter((d) => d.doc)
      .map((d) => [
        d.key,
        { id: d.line, sourceContentHash: d.doc!.governance.sourceContentHash, origin: 'importer', verification: 'unverified', status: 'draft', ...over },
      ]),
  )

describe('redaction', () => {
  it('removes emails and phone numbers and counts them', () => {
    const r = redactContacts('Write to a.b@sample.invalid or call 0300 1234567 or +92 946 123456 today.')
    expect(r.withheld).toBe(3)
    expect(r.text).not.toMatch(/@|\d{6}/)
  })
  it('leaves dates, years, amounts and ordinary numbers alone', () => {
    for (const t of ['Session 2021-2022', 'Held on 30/11/2026', 'Fee Rs. 50,000', '38th meeting, 12 June 2021']) {
      expect(redactContacts(t)).toEqual({ text: t, withheld: 0 })
    }
  })
  it('drops mailto, tel and unsafe attachment links, keeps web links', () => {
    expect(attachmentIssue('mailto:x@y.z')).toBe('contact')
    expect(attachmentIssue('tel:+920000')).toBe('contact')
    expect(attachmentIssue('javascript:alert(1)')).toBe('unsafe')
    expect(attachmentIssue('https://sample.invalid/a.pdf')).toBeNull()
  })
})

describe('contract v0', () => {
  it('needs an address, ignores unusable dates, keeps nothing it was not given', () => {
    expect(normaliseRecord({ title: 'no url' })).toBeNull()
    const r = normaliseRecord({ url: 'https://x.invalid/a/', date: 'not a date', title: '  ' })!
    expect(r.date).toBeUndefined()
    expect(r.title).toBeUndefined()
  })
})

describe('database guard', () => {
  it('accepts a local database and refuses hosted or unknown ones', () => {
    expect(() => assertLocalDatabase('postgresql://u@127.0.0.1:5433/db')).not.toThrow()
    expect(() => assertLocalDatabase('postgresql://u@localhost/db')).not.toThrow()
    expect(() => assertLocalDatabase('postgresql://u:p@ep-x.neon.tech/db')).toThrow(/hosted/)
    expect(() => assertLocalDatabase('postgresql://u@db.example.com/db')).toThrow(/not this machine/)
    expect(() => assertLocalDatabase('postgresql://u@localhost.neon.tech/db')).toThrow(/hosted/)
    expect(() => assertLocalDatabase(undefined)).toThrow()
  })
})

describe('plan over the Sample fixtures', () => {
  const plan = planImport({ rows: sampleRows, records: sampleRecords, existing: new Map() })
  const report = buildReport(plan)

  it('gives every route row exactly one outcome, and the outcomes sum to the rows', () => {
    expect(plan.decisions).toHaveLength(sampleRows.length)
    expect(Object.values(report.outcomes).reduce((a, b) => a + b, 0)).toBe(sampleRows.length)
    expect(report.outcomes).toMatchObject({ create: 6, 'redirect-only': 2, listing: 1, gone: 1, deferred: 2, skipped: 2 })
  })
  it('gives every skip a reason and never invents a title', () => {
    for (const d of plan.decisions.filter((x) => x.outcome === 'skipped')) expect(d.reason).toBeTruthy()
    expect(plan.decisions.find((d) => d.line === 5)?.reason).toBe('missing title')
  })
  it('withholds contact details and counts them without keeping them', () => {
    const two = plan.decisions.find((d) => d.key === '/2026/11/sample-notice-two')!
    expect(two.withheld).toEqual({ contacts: 4, attachmentsDropped: 3 })
    expect(JSON.stringify(two)).not.toMatch(/@sample|1234567|mailto|tel:|javascript/)
    expect(two.doc!.attachments).toHaveLength(1)
  })
  it('marks a record with no text as a stub, and sets no date it was not given', () => {
    const tender = plan.decisions.find((d) => d.collection === 'tenders')!
    expect(tender.doc!.bodyStatus).toBe('stub')
    expect(tender.doc!.publishedAt).toBeUndefined()
    expect(plan.decisions.find((d) => d.collection === 'posts')!.doc!.publishedAt).toBe('2021-05-27T00:00:00.000Z')
  })
  it('creates drafts only: origin importer, source is the old address, crawl date set', () => {
    for (const d of plan.decisions.filter((x) => x.doc)) {
      expect(d.doc!.governance).toMatchObject({ origin: 'importer', collectedAt: '2026-11-06T00:00:00.000Z' })
      expect(d.doc!.governance.source).toMatch(/^https:\/\/sample\.invalid\//)
    }
  })
  it('reports pack records that are repeated or not in the route map', () => {
    expect(report.duplicateRecordsInPack).toBe(1)
    expect(report.recordsNotInRouteMap).toBe(1)
  })
})

describe('idempotency and protection of human work', () => {
  const first = planImport({ rows: sampleRows, records: sampleRecords, existing: new Map() })
  it('a second plan over what the first wrote has nothing to write', () => {
    const second = buildReport(planImport({ rows: sampleRows, records: sampleRecords, existing: asExisting(first) }))
    expect(second.outcomes.create).toBe(0)
    expect(second.outcomes.update).toBe(0)
    expect(second.outcomes.unchanged).toBe(6)
  })
  const changed: SourceRecord[] = sampleRecords.map((r) => (r.url.includes('sample-news-a') ? { ...r, title: 'Sample: news item, corrected' } : r))
  it('a changed source updates a draft that nobody has verified', () => {
    const p = buildReport(planImport({ rows: sampleRows, records: changed, existing: asExisting(first) }))
    expect(p.outcomes).toMatchObject({ update: 1, unchanged: 5 })
  })
  it('a changed source never overwrites a verified or edited record', () => {
    for (const over of [{ verification: 'verified' }, { status: 'published' }, { origin: 'editor' }]) {
      const p = buildReport(planImport({ rows: sampleRows, records: changed, existing: asExisting(first, over) }))
      expect(p.outcomes).toMatchObject({ update: 0, review: 1 })
    }
  })
})

describe('accounting over the committed route map (a synthetic Sample pack, not the real one)', () => {
  const rows = readRouteRows(readFileSync(path.join(root, 'scripts/import/data/route_map.csv'), 'utf8'))
  // One invented record per row that expects content; every 40th has no title (to test the skip path).
  const records: SourceRecord[] = rows
    .filter((r) => r.action.startsWith('migrate') && ['News', 'Notices', 'Events', 'Jobs', 'Tenders'].includes(r.collection))
    .map((r, i) => ({ url: r.oldUrl, title: i % 40 === 0 ? undefined : `Sample ${i}`, categories: [], attachments: [] }))
  const plan = planImport({ rows, records, existing: new Map() })
  const report = buildReport(plan)

  it('every one of the 1,613 rows lands in exactly one outcome', () => {
    expect(rows).toHaveLength(1613)
    expect(report.rows).toBe(1613)
    expect(Object.values(report.outcomes).reduce((a, b) => a + b, 0)).toBe(1613)
  })
  it('every skip has a reason, and only the rows made untitled are skipped', () => {
    expect(report.skipped.every((s) => s.reason)).toBe(true)
    expect(report.skipped.length).toBe(Math.ceil(records.length / 40))
  })
  it('the redirect-only, listing and gone rows are exactly the rows the route map marks that way', () => {
    const n = (p: (a: string) => boolean) => rows.filter((r) => p(r.action)).length
    expect(report.outcomes['redirect-only']).toBe(n((a) => a.startsWith('duplicate address') || a.startsWith('redirect to nearest parent')))
    expect(report.outcomes.gone).toBe(5)
  })
  it('two articles never get the same new address within a collection', () => {
    const seen = new Set<string>()
    for (const d of plan.decisions.filter((x) => x.doc)) {
      const k = `${d.collection}/${d.doc!.slug}`
      expect(seen.has(k), k).toBe(false)
      seen.add(k)
    }
  })
  it('keys are the route-map addresses in one spelling', () => {
    for (const d of plan.decisions) expect(d.key).toBe(legacyKey(d.key))
  })
})
