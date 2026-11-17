// @vitest-environment node
/** CMS-07 / FF-08: the pages sitemap lists published pages only. */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { GET as GET_CONTENT } from '../../src/app/(frontend)/(sitemaps)/content-sitemap.xml/route'
import { GET as GET_POSTS } from '../../src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route'
import { GET } from '../../src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route'
import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, pageData, uniq } from '../helpers/governance'

let payload: Payload
let editor: User, approver: User

const make = async (slug: string) => {
  const p = await payload.create({
    collection: 'pages',
    draft: true,
    data: { ...pageData({}, slug), slug } as never,
    ...as(editor),
  })
  return p.id
}
const step = (id: number | string, user: User, governance: Record<string, unknown>) =>
  payload.update({
    collection: 'pages',
    id,
    draft: true,
    data: { governance } as never,
    ...as(user),
  })

describe('pages sitemap', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, approver] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
    ])
  })

  it('lists a published page, and not a draft or a page with only a newer draft title', async () => {
    const live = uniq('live-page').toLowerCase()
    const draft = uniq('draft-page').toLowerCase()
    const liveId = await make(live)
    await make(draft)
    await step(liveId, editor, { status: 'in_review' })
    await step(liveId, approver, { status: 'approved', verificationStatus: 'verified' })
    await payload.update({
      collection: 'pages',
      id: liveId,
      data: { _status: 'published', governance: {} } as never,
      ...as(approver),
    })
    const xml = await (await GET()).text()
    expect(xml).toContain(`/${live}</loc>`)
    expect(xml).not.toContain(draft)
  })
})

describe('content and news sitemaps', () => {
  const body = (t: string) => ({
    root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, textFormat: 0, children: [{ type: 'text', version: 1, text: t, format: 0, detail: 0, mode: 'normal', style: '' }] }] },
  })
  async function publish(collection: string, data: Record<string, unknown>, source: string, draftOnly = false) {
    const rec = (await payload.create({ collection: collection as never, draft: true, data: { ...data, governance: { ownerOffice: 'Registrar', source } } as never, ...as(editor) })) as unknown as { id: number }
    if (draftOnly) return
    const gov = (u: User, g: Record<string, unknown>) => payload.update({ collection: collection as never, id: rec.id, draft: true, data: { governance: g } as never, ...as(u) })
    await gov(editor, { status: 'in_review' })
    await gov(approver, { status: 'approved', verificationStatus: 'verified' })
    await payload.update({ collection: collection as never, id: rec.id, data: { _status: 'published', governance: {} } as never, ...as(approver) })
  }

  it('lists a published notice and news at their public addresses, and not a draft or a Sample record', async () => {
    const t = uniq('sm').toLowerCase().replace(/[^a-z0-9]/g, '')
    const base = { excerpt: 'Sample excerpt', body: body('Sample') }
    await publish('notices', { ...base, title: `${t} live`, slug: `${t}-live` }, 'https://uswat.edu.pk/x')
    await publish('notices', { ...base, title: `${t} draft`, slug: `${t}-draft` }, 'https://uswat.edu.pk/x', true)
    await publish('notices', { ...base, title: `${t} sample`, slug: `${t}-sample` }, 'https://sample.invalid/seed/notices/x')
    await publish('posts', { title: `${t} story`, slug: `${t}-story`, content: body('Sample') }, 'https://uswat.edu.pk/y')
    const content = await (await GET_CONTENT()).text()
    expect(content).toContain(`/notices/${t}-live</loc>`)
    expect(content).not.toContain(`${t}-draft`)
    expect(content).not.toContain(`${t}-sample`)
    expect(content).toMatch(/<loc>https?:\/\/[^<]+\/news<\/loc>/)
    const news = await (await GET_POSTS()).text()
    expect(news).toContain(`/news/${t}-story</loc>`)
    expect(news).not.toContain('/posts/')
  })
})

