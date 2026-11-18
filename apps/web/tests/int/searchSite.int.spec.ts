// @vitest-environment node
/** Site search on a real database: published records only, with the right public address. Sample records only. */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }))

import { searchSite } from '../../src/site/search/queries'
import { as, getTestPayload, makeUser, uniq } from '../helpers/governance'

let payload: Payload
let editor: Awaited<ReturnType<typeof makeUser>>
let approver: Awaited<ReturnType<typeof makeUser>>
const tag = uniq('srch').replace(/[^a-z0-9]/gi, '')
const body = (t: string) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, textFormat: 0, children: [{ type: 'text', version: 1, text: t, format: 0, detail: 0, mode: 'normal', style: '' }] }] },
})

async function make(collection: string, data: Record<string, unknown>, draftOnly = false) {
  const g = { ownerOffice: 'Registrar', source: 'https://sample.invalid/source' }
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
  await make('notices', { title: `${tag} Fee Notice`, slug: `${tag}-fee`, excerpt: 'Sample excerpt', body: body('Sample') })
  await make('posts', { title: `${tag} news story`, slug: `${tag}-story`, content: body('Sample') })
  await make('notices', { title: `${tag} draft notice`, slug: `${tag}-draft`, excerpt: 'Sample excerpt', body: body('Sample') }, true)
}, 120_000)

describe('searchSite', () => {
  it('finds published records by a lower-case part of the title, with the public address of each type', async () => {
    const found = await searchSite({ q: `${tag.toLowerCase()} `.trim(), page: 1 })
    const byTitle = Object.fromEntries(found.hits.map((h) => [h.title, h]))
    expect(byTitle[`${tag} Fee Notice`]).toMatchObject({ href: `/notices/${tag}-fee`, type: 'Notice' })
    expect(byTitle[`${tag} news story`]).toMatchObject({ href: `/news/${tag}-story`, type: 'News' })
  })
  it('never returns a draft', async () => {
    const found = await searchSite({ q: tag, page: 1 })
    expect(found.hits.map((h) => h.title)).not.toContain(`${tag} draft notice`)
  })
  it('returns nothing for an empty query and for a word that is not there', async () => {
    expect((await searchSite({ q: '', page: 1 })).hits).toEqual([])
    expect((await searchSite({ q: `${tag}zzzz`, page: 1 })).total).toBe(0)
  })
  it('treats a percent sign as text, not a wildcard that matches everything', async () => {
    const found = await searchSite({ q: `%${tag}nope`, page: 1 })
    expect(found.total).toBe(0)
  })
})
