// @vitest-environment node
/**
 * Importer on a real database (ADR 0009). Sample fixtures only, renamed per run so parallel specs
 * and earlier runs do not collide. Needs a local PostgreSQL; never a hosted one.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { PACK_FILES, normaliseRecord, recordsOf, type SourceRecord } from '../../../../scripts/import/contract'
import { planImport, readRouteRows } from '../../../../scripts/import/plan'
import { buildReport } from '../../../../scripts/import/report'
import { applyDecisions, loadExisting, articleSlugs, type Cms } from '../../../../scripts/import/writer'
import { as, getTestPayload, makeUser, refusal, run } from '../helpers/governance'

const sample = path.resolve(process.cwd(), '../../scripts/import/fixtures/sample')
const tag = `t${run}`
const rename = (s: string) => s.replaceAll('sample.invalid', `${tag}.invalid`).replaceAll('sample-', `${tag}-`)

const rows = readRouteRows(rename(readFileSync(path.join(sample, 'route_map.csv'), 'utf8')))
const records = (): SourceRecord[] =>
  PACK_FILES.flatMap((f) => {
    try {
      return recordsOf(JSON.parse(rename(readFileSync(path.join(sample, f), 'utf8'))))
    } catch {
      return []
    }
  }).flatMap((r) => normaliseRecord(r) ?? [])

let payload: Payload
let cms: Cms
const once = async (recs = records()) => {
  const existing = await loadExisting(cms, articleSlugs())
  const plan = planImport({ rows, records: recs, existing })
  const applied = await applyDecisions(cms, plan.decisions)
  return { plan, report: buildReport(plan), applied }
}
const found = (collection: string) =>
  payload.find({ collection: collection as never, draft: true, depth: 0, limit: 50, where: { 'governance.source': { like: `${tag}.invalid` } } as never })
const versionsOf = async (collection: string, id: number | string) =>
  (await payload.countVersions({ collection: collection as never, where: { parent: { equals: id } } as never })).totalDocs

beforeAll(async () => {
  payload = await getTestPayload()
  cms = payload as unknown as Cms
})

describe('first run', () => {
  it('creates 6 drafts that nobody has verified or published', async () => {
    const { report, applied } = await once()
    expect(report.outcomes.create).toBe(6)
    expect(applied).toEqual({ created: 6, updated: 0 })
    for (const c of ['posts', 'notices', 'events', 'jobs', 'tenders']) {
      const { docs } = await found(c)
      expect(docs.length, c).toBe(1 + (c === 'notices' ? 1 : 0))
      for (const d of docs as unknown as { _status: string; governance: Record<string, string> }[]) {
        expect(d._status).toBe('draft')
        expect(d.governance).toMatchObject({ origin: 'importer', status: 'draft', verificationStatus: 'unverified', collectedAt: expect.stringMatching(/^2026-11-06/) })
      }
    }
  })
  it('stores no contact detail', async () => {
    const { docs } = await found('notices')
    const text = JSON.stringify(docs)
    expect(text).not.toMatch(/@|1234567|mailto:|tel:|javascript:/)
    expect(text).toContain(`${tag}-circular.pdf`)
  })
  it('keeps the address from the route map as the slug', async () => {
    const { docs } = await found('notices')
    expect(docs.map((d) => (d as { slug?: string }).slug).sort()).toEqual([`${tag}-notice-one`, `${tag}-notice-two`])
  })
})

describe('second run', () => {
  it('writes nothing: all unchanged, no new version rows', async () => {
    const before = await found('notices')
    const ids = (before.docs as unknown as { id: number }[]).map((d) => d.id)
    const counts = await Promise.all(ids.map((id) => versionsOf('notices', id)))
    const { report, applied } = await once()
    expect(report.outcomes).toMatchObject({ create: 0, update: 0, unchanged: 6 })
    expect(applied).toEqual({ created: 0, updated: 0 })
    expect(await Promise.all(ids.map((id) => versionsOf('notices', id)))).toEqual(counts)
  })
  it('contrast: a plain re-save of the same data does add a version row (why the hash check exists)', async () => {
    const [doc] = (await found('jobs')).docs as unknown as { id: number; title: string; governance: Record<string, unknown> }[]
    const n = await versionsOf('jobs', doc.id)
    await payload.update({ collection: 'jobs', id: doc.id, draft: true, data: { title: doc.title } as never, context: { disableRevalidate: true } })
    expect(await versionsOf('jobs', doc.id)).toBeGreaterThan(n)
  })
})

describe('a changed source', () => {
  const changed = () => records().map((r) => (r.url.includes('-news-a') ? { ...r, title: 'Sample: news item, corrected' } : r))
  it('updates a draft nobody has verified', async () => {
    const { report, applied } = await once(changed())
    expect(report.outcomes).toMatchObject({ update: 1, unchanged: 5 })
    expect(applied.updated).toBe(1)
    const [post] = (await found('posts')).docs as unknown as { title: string }[]
    expect(post.title).toBe('Sample: news item, corrected')
  })
  it('does not overwrite a record once a person has verified it', async () => {
    const [post] = (await found('posts')).docs as unknown as { id: number; title: string }[]
    const verify = { verificationStatus: 'verified' }
    // The importer itself can never verify (VER-01) ...
    expect(
      await refusal(() =>
        payload.update({ collection: 'posts', id: post.id, draft: true, data: { governance: verify } as never, context: { disableRevalidate: true } }),
      ),
    ).toBe('VERIFY_FORBIDDEN')
    // ... a reviewer can.
    const reviewer = await makeUser(payload, 'platformAdmin')
    await payload.update({ collection: 'posts', id: post.id, draft: true, data: { governance: verify } as never, ...as(reviewer) })
    const again = changed().map((r) => (r.url.includes('-news-a') ? { ...r, title: 'Sample: news item, corrected again' } : r))
    const { report, applied } = await once(again)
    expect(report.outcomes).toMatchObject({ update: 0, review: 1 })
    expect(applied.updated).toBe(0)
    const [after] = (await found('posts')).docs as unknown as { title: string }[]
    expect(after.title).toBe('Sample: news item, corrected')
  })
})
