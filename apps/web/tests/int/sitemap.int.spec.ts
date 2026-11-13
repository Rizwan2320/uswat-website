// @vitest-environment node
/** CMS-07 / FF-08: the pages sitemap lists published pages only. */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

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
