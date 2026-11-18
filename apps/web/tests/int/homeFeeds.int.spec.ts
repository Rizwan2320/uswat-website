// @vitest-environment node
/** The home page sections read the same published records as the list pages. Sample records only. */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }))

import { homeEvents, homeFeeds, homeNews } from '../../src/site/home/cms'
import { feeds } from '../../src/site/content/feeds'
import { as, getTestPayload, makeUser, uniq } from '../helpers/governance'

const body = (t: string) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, textFormat: 0, children: [{ type: 'text', version: 1, text: t, format: 0, detail: 0, mode: 'normal', style: '' }] }] },
})

let payload: Payload
let editor: Awaited<ReturnType<typeof makeUser>>
let approver: Awaited<ReturnType<typeof makeUser>>
const tag = uniq('home')

async function make(collection: string, data: Record<string, unknown>, draftOnly = false, extra: Record<string, unknown> = {}) {
  const g = { ownerOffice: 'Registrar', source: 'https://sample.invalid/source', ...extra }
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
  const now = Date.now()
  await make('posts', { title: `${tag} news`, slug: `${tag}-news`, content: body('Sample'), publishedAt: new Date(now + 60_000).toISOString() })
  await make('notices', { title: `${tag} notice`, slug: `${tag}-notice`, excerpt: 'Sample excerpt', body: body('Sample body'), publishedAt: new Date(now + 60_000).toISOString() })
  await make('notices', { title: `${tag} draft notice`, slug: `${tag}-draft`, excerpt: 'Sample excerpt', body: body('Sample body'), publishedAt: new Date(now + 90_000).toISOString() }, true)
  // Events list soonest first, and earlier test runs leave events behind; a 1990 start sorts ahead of all of them.
  await make('events', { title: `${tag} event`, slug: `${tag}-event`, excerpt: 'Sample excerpt', body: body('Sample body'), startsAt: '1990-01-01T00:00:00.000Z', venue: 'Sample hall', publishedAt: new Date(now).toISOString() }, false, { expireAt: new Date(now + 10 * 86_400_000).toISOString() })
}, 120_000)

describe('home sections', () => {
  it('shows a newly published news item first, linked to this site', async () => {
    const news = await homeNews([])
    expect(news[0]).toMatchObject({ title: `${tag} news`, href: `/news/${tag}-news` })
  })
  it('shows a published notice, and never a draft one, with "view all" pointing at this site', async () => {
    const notices = (await homeFeeds(feeds)).find((f) => f.id === 'notices')!
    expect(notices.viewAllHref).toBe('/notices')
    expect(notices.items.map((i) => i.title)).toContain(`${tag} notice`)
    expect(notices.items.map((i) => i.title)).not.toContain(`${tag} draft notice`)
  })
  it('shows a published event with its venue and start', async () => {
    const events = await homeEvents([])
    expect(events.find((e) => e.title === `${tag} event`)).toMatchObject({ venue: 'Sample hall', href: `/events/${tag}-event` })
  })
})
