// @vitest-environment node
/**
 * Unpublish is a reviewer action on every path, not only over REST (main agent review of PR #1,
 * follow-up 1). A draft revision of live content stays open to the people who may edit it.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, pageData, refusal } from '../helpers/governance'

let payload: Payload
let editor: User, approver: User

const main = (id: number) =>
  payload.findByID({ collection: 'pages', id, overrideAccess: true, depth: 0 })

async function livePage() {
  const p = await payload.create({
    collection: 'pages',
    draft: true,
    data: pageData(),
    ...as(editor),
  })
  const step = (user: User, governance: Record<string, unknown>) =>
    payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { governance },
      ...as(user),
    })
  await step(editor, { status: 'in_review' })
  await step(approver, { status: 'approved', verificationStatus: 'verified' })
  await payload.update({
    collection: 'pages',
    id: p.id,
    data: { _status: 'published', governance: {} },
    ...as(approver),
  })
  return p
}

describe('unpublish through the Local API', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, approver] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
    ])
  })

  it('refuses an editor who tries to take live content offline', async () => {
    const p = await livePage()
    const code = await refusal(() =>
      payload.update({ collection: 'pages', id: p.id, data: { _status: 'draft' }, ...as(editor) }),
    )
    expect(code).toBe('UNPUBLISH_FORBIDDEN')
    expect((await main(p.id))._status).toBe('published')
  })

  it('lets a reviewer take it offline', async () => {
    const p = await livePage()
    await payload.update({
      collection: 'pages',
      id: p.id,
      data: { _status: 'draft' },
      ...as(approver),
    })
    expect((await main(p.id))._status).toBe('draft')
  })

  it('still lets an editor save a draft revision of live content, which leaves it live', async () => {
    const p = await livePage()
    await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { title: 'A pending edit' },
      ...as(editor),
    })
    const live = await main(p.id)
    expect(live._status).toBe('published')
    expect(live.title).not.toBe('A pending edit')
  })

  it('an autosave of live content is also a draft revision, not an unpublish', async () => {
    const p = await livePage()
    await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      autosave: true,
      data: { title: 'Autosaved edit' },
      ...as(editor),
    })
    expect((await main(p.id))._status).toBe('published')
  })
})
