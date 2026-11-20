/**
 * Writes the Sample organisation data through the CMS Local API as one acting user (brief p4-seeds).
 * Like writer.ts it takes a CMS handle and imports nothing from Payload.
 *
 * Order matters: all records are created as drafts, then linked while still drafts (a published
 * record would count a link as a content edit), then published in dependency order.
 * A record that is already published is never touched, so a second run writes nothing.
 */
import type { Cms } from '../writer'

import { runPool, SEQUENTIAL, withoutDeadline, type Run } from './pool'
import { textToLexical } from '../writer'

import {
  SAMPLE_HOST,
  SAMPLE_OWNER_OFFICE,
  campuses,
  departments,
  facultyGroups,
  offices,
  people,
  programmes,
  sampleSource,
} from './data'

type Id = number | string
type Args = Record<string, unknown>
export type SeedActor = { user: Record<string, unknown> }
export type SeedResult = { created: number; linked: number; published: number; unchanged: number }

const CONTEXT = { disableRevalidate: true }
const REVIEW_DUE = '2027-12-31T00:00:00.000Z'
const COLLECTIONS = ['faculties', 'campuses', 'people', 'offices', 'departments', 'programmes'] as const
type Coll = (typeof COLLECTIONS)[number]

export function seedRows(): Record<Coll, { slug: string; name: string }[]> {
  return { faculties: facultyGroups, campuses, people, offices, departments, programmes }
}

export async function applySeeds(cms: Cms, actor: SeedActor, run: Run = SEQUENTIAL): Promise<SeedResult> {
  const as = (): Args => ({ user: actor.user, overrideAccess: false, context: CONTEXT })
  const result: SeedResult = { created: 0, linked: 0, published: 0, unchanged: 0 }
  const ids = new Map<string, Id>() // `${collection}/${slug}` -> id
  const states = new Map<string, { published: boolean; links: Args }>()

  // 1. Find what exists (latest saved state, drafts included), by source.
  for (const c of COLLECTIONS) {
    const res = await cms.find({
      collection: c,
      draft: true,
      depth: 0,
      limit: 500,
      overrideAccess: true,
      where: { 'governance.source': { like: `https://${SAMPLE_HOST}/seed/${c}/` } },
    })
    for (const d of res.docs) {
      const slug = String(d.slug)
      ids.set(`${c}/${slug}`, d.id as Id)
      states.set(`${c}/${slug}`, { published: (d as { _status?: string })._status === 'published', links: d })
    }
  }

  const gov = (c: Coll, slug: string) => ({ ownerOffice: SAMPLE_OWNER_OFFICE, source: sampleSource(c, slug) })
  const base = (c: Coll, row: { slug: string; name: string }) => ({
    name: row.name,
    slug: row.slug,
    generateSlug: false,
    governance: gov(c, row.slug),
  })
  const make = async (c: Coll, row: { slug: string; name: string }, extra: Args) => {
    const key = `${c}/${row.slug}`
    if (ids.has(key)) return
    const doc = await cms.create({ collection: c, draft: true, data: { ...base(c, row), ...extra }, ...as() })
    ids.set(key, doc.id)
    states.set(key, { published: false, links: {} })
    result.created++
  }

  // 2. Create drafts (no links yet, except those that only point at records created before them). Records of one
  //    stage do not depend on each other, so a stage runs a few at a time; the next stage needs this one's ids.
  //    The organisation data is never cut short by the deadline: a department without its head would be wrong.
  const org = withoutDeadline(run)
  const stage = (jobs: (() => Promise<void>)[]) => runPool(jobs, org, (job) => job())
  await stage([
    ...facultyGroups.map((r) => () => make('faculties', r, {})),
    ...campuses.map((r) => () => make('campuses', r, {})),
    ...people.map((r) => () =>
      make('people', r, {
        designation: r.designation,
        details: r.details,
        email: r.email,
        visibility: { email: r.emailPublic ? 'public' : 'hidden', photo: 'hidden' },
      }),
    ),
    ...offices.map((r) => () =>
      make('offices', r, {
        group: r.group,
        hours: r.hours,
        text: textToLexical(`Sample page text for ${r.name}. Invented, for layout testing.`),
        ...(r.email ? { emails: [{ email: r.email }] } : {}),
      }),
    ),
  ])
  const id = (c: Coll, slug: string) => ids.get(`${c}/${slug}`) as Id
  await stage(
    departments.map((r) => () =>
      make('departments', r, { summary: r.summary, facultyGroup: id('faculties', r.facultyGroup), head: id('people', r.head) }),
    ),
  )
  await stage(
    programmes.map((r) => () =>
      make('programmes', r, {
        level: r.level,
        duration: r.duration,
        eligibility: 'Sample eligibility text. Invented, not a real requirement.',
        department: id('departments', r.department),
        campus: id('campuses', r.campus),
      }),
    ),
  )

  // 3. Link people to their department and office (drafts only).
  const link = async (c: Coll, slug: string, data: Args) => {
    const s = states.get(`${c}/${slug}`)!
    if (s.published) return
    const current = s.links
    const same = Object.entries(data).every(([k, v]) => String(current[k] ?? '') === String(v))
    if (same) return
    await cms.update({ collection: c, id: id(c, slug), draft: true, data, ...as() })
    result.linked++
  }
  // Each loop touches different records (a test checks that the heads are distinct), and the loops run one after another.
  await stage(departments.map((d) => () => link('people', d.head, { department: id('departments', d.slug) })))
  await stage(offices.map((o) => () => link('people', o.head, { office: id('offices', o.slug) })))
  await stage(offices.map((o) => () => link('offices', o.slug, { head: id('people', o.head) })))

  // 4. Publish: draft, in review, approved and verified, published.
  // Collections go one after another (a department is published after its head), the rows of one collection together.
  for (const c of COLLECTIONS) {
    await runPool(seedRows()[c], org, async (row) => {
      const key = `${c}/${row.slug}`
      if (states.get(key)?.published) {
        result.unchanged++
        return
      }
      const target = id(c, row.slug)
      const step = (data: Args) => cms.update({ collection: c, id: target, draft: true, data, ...as() })
      await step({ governance: { status: 'in_review' } })
      await step({ governance: { status: 'approved', verificationStatus: 'verified', reviewDueAt: REVIEW_DUE } })
      await cms.update({ collection: c, id: target, data: { _status: 'published' }, ...as() })
      result.published++
    })
  }
  return result
}
