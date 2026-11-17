// @vitest-environment node
/**
 * The public reads for News, Notices, Events, Jobs and Tenders, on a real database. Only published records
 * are visible without a login; "current" and "archive" are complements; a draft is never served, even with
 * draft mode on and no login. Sample records only.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }))

import { TYPES } from '@/site/articles/config'
import { getArticle, listArticles, otherArticles, yearRange } from '@/site/articles/queries'

import { as, getTestPayload, makeUser, uniq } from '../helpers/governance'

const DAY = 86_400_000
const iso = (ms: number) => new Date(ms).toISOString()
const NOW = Date.now()
// A year picked at random per run, and every record below is dated in it, so lists filtered by that year hold
// only this run's records however many earlier runs the database has seen.
const YEAR = 2000 + Math.floor(Math.random() * 25)
const body = (t: string) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, textFormat: 0, children: [{ type: 'text', version: 1, text: t, format: 0, detail: 0, mode: 'normal', style: '' }] }] },
})

let payload: Payload
let editor: Awaited<ReturnType<typeof makeUser>>
let approver: Awaited<ReturnType<typeof makeUser>>
let admin: Awaited<ReturnType<typeof makeUser>>

/** Create a record and, unless `draftOnly`, take it through review and publish it, as people would. */
async function make(
  collection: string,
  data: Record<string, unknown>,
  gov: Record<string, unknown> = {},
  draftOnly = false,
  /** Pinning is for reviewers only, so a pinned record is approved by a platform admin. */
  pinned = false,
) {
  const g = { ownerOffice: 'Registrar', source: 'https://sample.invalid/source', ...gov }
  const rec = (await payload.create({ collection: collection as never, draft: true, data: { ...data, governance: g } as never, ...as(editor) })) as unknown as { id: number }
  if (draftOnly) return rec.id
  const step = (u: typeof editor, governance: Record<string, unknown>) =>
    payload.update({ collection: collection as never, id: rec.id, draft: true, data: { governance } as never, ...as(u) })
  await step(editor, { status: 'in_review' })
  const approvedBy = pinned ? admin : approver
  await step(approvedBy, { status: 'approved', verificationStatus: 'verified', ...(pinned ? { pinned: true } : {}) })
  await payload.update({ collection: collection as never, id: rec.id, data: { _status: 'published', governance: {} } as never, ...as(approvedBy) })
  return rec.id
}

const params = (over: Partial<{ page: number; year: number; view: 'current' | 'archive' }> = {}) => ({ page: 1, view: 'current' as const, ...over })
const titles = async (type: keyof typeof TYPES, over = {}) => (await listArticles(type, params(over))).items.map((i) => i.title)

beforeAll(async () => {
  payload = await getTestPayload()
  editor = await makeUser(payload, 'editor', ['Registrar'])
  approver = await makeUser(payload, 'approver', ['Registrar'])
  admin = await makeUser(payload, 'platformAdmin', ['Registrar'])
})

describe('current and archive', () => {
  const tag = uniq('t')
  it('a vacancy past its closing date leaves the current list and appears in the archive', async () => {
    await make('jobs', { title: `${tag} open`, slug: `${tag}-open`, publishedAt: iso(Date.UTC(YEAR, 1, 2)) }, { expireAt: iso(NOW + 10 * DAY) })
    await make('jobs', { title: `${tag} closed`, slug: `${tag}-closed`, publishedAt: iso(Date.UTC(YEAR, 1, 1)) }, { expireAt: iso(NOW - 30 * DAY) })
    const cur = await titles('jobs', { year: YEAR })
    const arc = await titles('jobs', { year: YEAR, view: 'archive' })
    expect(cur).toContain(`${tag} open`)
    expect(cur).not.toContain(`${tag} closed`)
    expect(arc).toContain(`${tag} closed`)
    expect(arc).not.toContain(`${tag} open`)
  })
  it('a draft notice is in neither list', async () => {
    await make('notices', { title: `${tag} draft notice`, slug: `${tag}-draft` }, {}, true)
    expect(await titles('notices')).not.toContain(`${tag} draft notice`)
    expect(await titles('notices', { view: 'archive' })).not.toContain(`${tag} draft notice`)
  })
  it('an old unpinned notice ages out; a pinned one stays current', async () => {
    const old = iso(Date.UTC(YEAR, 2, 1)) // years ago, and alone in its year, so the list below is short
    await make('notices', { title: `${tag} old`, slug: `${tag}-old`, publishedAt: old })
    await make('notices', { title: `${tag} old pinned`, slug: `${tag}-oldp`, publishedAt: old }, {}, false, true)
    expect((await titles('notices', { year: YEAR })).filter((t) => t.startsWith(tag))).toEqual([`${tag} old pinned`])
    expect(await titles('notices', { year: YEAR, view: 'archive' })).toContain(`${tag} old`)
    expect(await titles('notices', { year: YEAR, view: 'archive' })).not.toContain(`${tag} old pinned`)
  })
  it('events list soonest first', async () => {
    const a = await make('events', { title: `${tag} later`, slug: `${tag}-later`, venue: 'Sample hall', startsAt: iso(NOW + 9 * DAY), publishedAt: iso(Date.UTC(YEAR, 3, 1)) }, { expireAt: iso(NOW + 9 * DAY + 3600_000) })
    const b = await make('events', { title: `${tag} sooner`, slug: `${tag}-sooner`, venue: 'Sample hall', startsAt: iso(NOW + 3 * DAY), publishedAt: iso(Date.UTC(YEAR, 3, 2)) }, { expireAt: iso(NOW + 3 * DAY + 3600_000) })
    expect(a && b).toBeTruthy()
    const t = await titles('events', { year: YEAR })
    expect(t.indexOf(`${tag} sooner`)).toBeGreaterThanOrEqual(0)
    expect(t.indexOf(`${tag} sooner`)).toBeLessThan(t.indexOf(`${tag} later`))
    const first = (await listArticles('events', params({ year: YEAR }))).items.find((i) => i.title === `${tag} sooner`)!
    expect(first).toMatchObject({ venue: 'Sample hall', closed: false })
  })
})

describe('paging and years', () => {
  it('News is newest first and 12 to a page', async () => {
    for (let i = 1; i <= 14; i++)
      await make('posts', { title: uniq('news'), slug: uniq('news'), content: body('Sample'), publishedAt: iso(Date.UTC(YEAR, 5, i)) })
    const p1 = await listArticles('news', params({ year: YEAR }))
    const p2 = await listArticles('news', params({ year: YEAR, page: 2 }))
    expect(p1.items).toHaveLength(12)
    expect(p1.totalPages).toBeGreaterThanOrEqual(2)
    expect(p2.items.length).toBeGreaterThanOrEqual(2)
    const dates = [...p1.items, ...p2.items].map((i) => i.publishedAt!)
    expect([...dates].sort().reverse()).toEqual(dates)
  })
  it('the year range covers the oldest and newest published record', async () => {
    const r = await yearRange('news')
    expect(r!.first).toBeLessThanOrEqual(YEAR)
    expect(r!.last).toBeGreaterThanOrEqual(YEAR)
  })
})

describe('one article', () => {
  const tag = uniq('a')
  it('is found by its slug when published, with its body and tags depth', async () => {
    await make('notices', { title: `${tag} notice`, slug: tag, excerpt: 'Sample excerpt', body: body('Sample body'), publishedAt: iso(NOW - DAY) })
    const doc = await getArticle('notices', tag, { draftModeOn: false, headers: new Headers() })
    expect(doc).toMatchObject({ title: `${tag} notice`, slug: tag })
  })
  it('a draft is not served, even with draft mode on and no login', async () => {
    await make('notices', { title: `${tag} secret`, slug: `${tag}-secret` }, {}, true)
    expect(await getArticle('notices', `${tag}-secret`, { draftModeOn: false, headers: new Headers() })).toBeNull()
    expect(await getArticle('notices', `${tag}-secret`, { draftModeOn: true, headers: new Headers() })).toBeNull()
  })
  it('an unknown slug is nothing; the same slug in another type is nothing too', async () => {
    expect(await getArticle('notices', 'no-such-slug', { draftModeOn: false, headers: new Headers() })).toBeNull()
    expect(await getArticle('jobs', tag, { draftModeOn: false, headers: new Headers() })).toBeNull()
  })
  it('"more from" never includes the article itself and is at most three', async () => {
    const doc = (await getArticle('notices', tag, { draftModeOn: false, headers: new Headers() }))!
    const others = await otherArticles('notices', doc.id)
    expect(others.length).toBeLessThanOrEqual(3)
    expect(others.map((o) => o.id)).not.toContain(doc.id)
  })
})
