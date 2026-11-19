// @vitest-environment node
/**
 * RSS feeds on a real database (brief p5-rss): published, current records only (Sample ones included); never a draft.
 * Records are named with the run id and the checks look only at those. Needs a local PostgreSQL.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }))

import { feedXml } from '@/site/feeds/collect'

import { as, getTestPayload, makeUser, uniq } from '../helpers/governance'

const DAY = 86_400_000
const iso = (ms: number) => new Date(ms).toISOString()
const NOW = Date.now()

let payload: Payload
let editor: Awaited<ReturnType<typeof makeUser>>
let approver: Awaited<ReturnType<typeof makeUser>>
const tag = uniq('rss')

async function make(collection: string, data: Record<string, unknown>, gov: Record<string, unknown> = {}, draftOnly = false) {
  const g = { ownerOffice: 'Registrar', source: `https://${tag}.invalid/x`, ...gov }
  const rec = (await payload.create({ collection: collection as never, draft: true, data: { ...data, governance: g } as never, ...as(editor) })) as unknown as { id: number }
  if (draftOnly) return
  const step = (u: typeof editor, governance: Record<string, unknown>) =>
    payload.update({ collection: collection as never, id: rec.id, draft: true, data: { governance } as never, ...as(u) })
  await step(editor, { status: 'in_review' })
  await step(approver, { status: 'approved', verificationStatus: 'verified' })
  await payload.update({ collection: collection as never, id: rec.id, data: { _status: 'published', governance: {} } as never, ...as(approver) })
}

beforeAll(async () => {
  payload = await getTestPayload()
  editor = await makeUser(payload, 'editor', ['Registrar'])
  approver = await makeUser(payload, 'approver', ['Registrar'])
  await make('notices', { title: `${tag} live & <b>notice</b>`, slug: `${tag}-live`, excerpt: 'Short line.' })
  await make('notices', { title: `${tag} draft notice`, slug: `${tag}-draft` }, {}, true)
  await make('notices', { title: `${tag} sample notice`, slug: `${tag}-sample` }, { source: 'https://sample.invalid/seed/notices/x' })
  await make('jobs', { title: `${tag} open job`, slug: `${tag}-open` }, { expireAt: iso(NOW + 10 * DAY) })
  await make('jobs', { title: `${tag} closed job`, slug: `${tag}-closed` }, { expireAt: iso(NOW - 10 * DAY) })
  await make('events', { title: `${tag} event`, slug: `${tag}-event`, venue: 'Main hall', startsAt: iso(NOW + 5 * DAY) }, { expireAt: iso(NOW + 5 * DAY + 3_600_000) })
})

describe('feeds', () => {
  it('lists a published current notice with its text escaped, and not a draft, but a Sample record', async () => {
    const xml = await feedXml('notices')
    expect(xml).toContain(`${tag} live &amp; &lt;b&gt;notice&lt;/b&gt;`)
    expect(xml).toContain(`/notices/${tag}-live</link>`)
    expect(xml).not.toContain(`${tag} draft notice`)
    expect(xml).toContain(`${tag} sample notice`)
  })
  it('lists an open vacancy and leaves out a closed one', async () => {
    const xml = await feedXml('jobs')
    expect(xml).toContain(`${tag} open job`)
    expect(xml).not.toContain(`${tag} closed job`)
    expect(xml).toMatch(new RegExp(`${tag} open job[\\s\\S]*?Closes: `))
  })
  it('lists an upcoming event with its venue and a date', async () => {
    const xml = await feedXml('events')
    const item = xml.split('<item>').find((i) => i.includes(`${tag} event`)) ?? ''
    expect(item).toContain('Where: Main hall.')
    expect(item).toContain('<pubDate>')
  })
  it('is an empty channel, not an error, for a type with nothing published by this run', async () => {
    const xml = await feedXml('tenders')
    expect(xml).toContain('<channel>')
    expect(xml).not.toContain(tag)
  })
})
