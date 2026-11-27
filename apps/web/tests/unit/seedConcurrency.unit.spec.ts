/**
 * The seeds on an in-memory stand-in for the CMS (prediction A4-q): running records a few at a time gives the same
 * final state as running them one by one, each record still walks the workflow in order, a second run writes nothing,
 * and a run cut short by the deadline is finished by the next run.
 */
import { describe, expect, it } from 'vitest'

import { applyAllSeeds } from '../../../../scripts/import/seeds/all'
import { departments, offices } from '../../../../scripts/import/seeds/data'
import type { Run } from '../../../../scripts/import/seeds/pool'
import type { Cms } from '../../../../scripts/import/writer'

type Rec = { id: number; collection: string; _status: string; governance: Record<string, unknown>; data: Record<string, unknown>; steps: string[] }
type Args = Record<string, unknown>
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

class FakeCms implements Cms {
  recs: Rec[] = []
  private next = 1
  inFlight = 0
  peak = 0
  private async op<T>(fn: () => T): Promise<T> {
    this.inFlight++
    this.peak = Math.max(this.peak, this.inFlight)
    await sleep(1) // a round trip, so concurrent records really interleave
    try {
      return fn()
    } finally {
      this.inFlight--
    }
  }
  find(args: Args) {
    return this.op(() => {
      const where = (args.where ?? {}) as Record<string, { like?: string }>
      const [key, cond] = Object.entries(where)[0] ?? []
      const prefix = cond?.like ?? ''
      const docs = this.recs
        .filter((r) => r.collection === args.collection)
        .filter((r) => (key === 'sourceUrl' ? String(r.data.sourceUrl ?? '').startsWith(prefix) : String(r.governance.source ?? '').startsWith(prefix)))
        .map((r) => ({ id: r.id, slug: r.data.slug, sourceUrl: r.data.sourceUrl, governance: r.governance, _status: r._status, ...r.data }))
      return { docs, hasNextPage: false }
    })
  }
  create(args: Args) {
    return this.op(() => {
      const data = structuredClone((args.data ?? {}) as Args)
      const rec: Rec = { id: this.next++, collection: String(args.collection), _status: 'draft', governance: (data.governance as Args) ?? {}, data, steps: ['create'] }
      this.recs.push(rec)
      return { id: rec.id }
    })
  }
  update(args: Args) {
    return this.op(() => {
      const rec = this.recs.find((r) => r.id === args.id && r.collection === args.collection)
      if (!rec) throw new Error(`no ${String(args.collection)} ${String(args.id)}`)
      const data = structuredClone((args.data ?? {}) as Args)
      if (args.locale === 'ur') {
        rec.steps.push('ur')
        return { id: rec.id }
      }
      if (data._status) {
        rec._status = String(data._status)
        rec.steps.push(String(data._status))
      }
      if (data.governance) {
        const g = data.governance as Args
        Object.assign(rec.governance, g)
        if (g.status) rec.steps.push(String(g.status))
      }
      for (const [k, v] of Object.entries(data)) if (k !== 'governance' && k !== '_status') rec.data[k] = v
      return { id: rec.id }
    })
  }
  /** What a run left behind, with no ids (they depend on the order records were made). */
  state() {
    return this.recs
      .map((r) => `${r.collection} ${String(r.governance.source)} ${r._status} ${String(r.governance.status)} tags=${Array.isArray(r.data.tags) ? r.data.tags.length : '-'} hero=${r.data.heroImage ? 'y' : 'n'}`)
      .sort()
  }
}

const actor = { user: { id: 1, role: 'platformAdmin' } } as never
const render = async () => Buffer.from('png')
const total = (r: Awaited<ReturnType<typeof applyAllSeeds>>) =>
  r.created + r.contacts.created + r.media.created + r.articles.created + r.pages.created

async function seed(cms: FakeCms, run?: Run) {
  return applyAllSeeds(cms, actor, render, Date.now(), run)
}

describe('seeds with records written at once', () => {
  it('gives the same final state as one at a time, with the same counts', async () => {
    const a = new FakeCms()
    const b = new FakeCms()
    const ra = await seed(a, { concurrency: 1 })
    const rb = await seed(b, { concurrency: 6 })
    expect(b.state()).toEqual(a.state())
    expect(total(rb)).toBe(total(ra))
    expect(rb.partial).toBe(false)
    expect(a.peak).toBe(1)
    expect(b.peak).toBeGreaterThan(1)
    expect(b.peak).toBeLessThanOrEqual(6)
  }, 60_000)

  it('walks every published record through draft, review, approved, published in that order', async () => {
    const cms = new FakeCms()
    await seed(cms, { concurrency: 6 })
    const published = cms.recs.filter((r) => r._status === 'published')
    expect(published.length).toBe(127) // 82 organisation (DCST and its five programmes, the 27 offices with a rich page, and the Allied Health faculty group with two centres and four programmes, included), 6 contacts, 35 articles, tags and merit lists (DCST news included), 4 pages
    for (const r of published) {
      const flow = r.steps.filter((s) => s !== 'ur' && s !== 'create')
      // organisation records are also linked while still drafts, which adds no workflow step
      expect(flow, `${r.collection} ${String(r.governance.source)}`).toEqual(['in_review', 'approved', 'published'])
      expect(r.steps[0]).toBe('create')
    }
  }, 60_000)

  it('writes nothing on a second run', async () => {
    const cms = new FakeCms()
    await seed(cms, { concurrency: 6 })
    const before = cms.state()
    const again = await seed(cms, { concurrency: 6 })
    expect(total(again)).toBe(0)
    expect(again.published + again.articles.published + again.pages.published + again.contacts.published).toBe(0)
    expect(cms.state()).toEqual(before)
  }, 60_000)

  it('stops at the deadline, says it is partial, and the next run finishes with the same final state', async () => {
    const whole = new FakeCms()
    await seed(whole, { concurrency: 6 })

    const cms = new FakeCms()
    const first = await seed(cms, { concurrency: 6, deadline: Date.now() + 1 })
    expect(first.partial).toBe(true)
    // the organisation data is never cut short, so it is complete; the articles are not
    expect(first.created).toBe(82)
    expect(first.articles.created).toBeLessThan(50)
    const second = await seed(cms, { concurrency: 6 })
    expect(second.partial).toBe(false)
    expect(cms.state()).toEqual(whole.state())
  }, 60_000)
})

describe('seed data the concurrent links rely on', () => {
  it('has a different head for every department and every office', () => {
    const dept = departments.flatMap((d) => (d.head ? [d.head] : []))
    // the nine offices with a rich page have no seeded head (their people live in src/site/offices/profiles)
    const off = offices.flatMap((o) => (o.head ? [o.head] : []))
    expect(new Set(dept).size).toBe(dept.length)
    expect(new Set(off).size).toBe(off.length)
  })
})
