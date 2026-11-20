// @vitest-environment node
/**
 * Slice 3w (P3w-a, P3w-b): governed content refreshes the public site's cache when it changes in a way
 * the public can see, and not otherwise. Real PostgreSQL; next/cache is replaced by a recorder.
 */
import type { Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const tags = vi.hoisted(() => ({ calls: [] as string[] }))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: (tag: string) => {
    tags.calls.push(tag)
  },
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { hasGovernance } from '../../src/plugins/revalidateOnChange'
import { runLifecycleSweep } from '../../src/governance/sweep'
import { as, getTestPayload, makeUser, uniq } from '../helpers/governance'

const DAY = 86_400_000
let payload: Payload
let editor: User, approver: User

// These requests run with revalidation ON (the helpers switch it off for the other tests).
const live = (user: User) => ({ ...as(user), context: {} })
const noteData = (g: Record<string, unknown> = {}) =>
  ({
    title: uniq('notice'),
    excerpt: 'Sample text',
    governance: { ownerOffice: 'Registrar', source: 'https://example.test/source', ...g },
  }) as never

async function approvedNotice(g: Record<string, unknown> = {}) {
  const n = await payload.create({ collection: 'notices', draft: true, data: noteData(g), ...live(editor) })
  const step = (user: User, governance: Record<string, unknown>) =>
    payload.update({ collection: 'notices', id: n.id, draft: true, data: { governance } as never, ...live(user) })
  await step(editor, { status: 'in_review' })
  await step(approver, { status: 'approved', verificationStatus: 'verified' })
  return n
}
const publish = (id: number) =>
  payload.update({ collection: 'notices', id, data: { _status: 'published', governance: {} } as never, ...live(approver) })

beforeAll(async () => {
  payload = await getTestPayload()
  ;[editor, approver] = await Promise.all([
    makeUser(payload, 'editor', ['Registrar']),
    makeUser(payload, 'approver', ['Registrar']),
  ])
}, 120_000)
beforeEach(() => {
  tags.calls.length = 0
})

describe('every governed collection is covered', () => {
  it('has the change and delete hooks (so a new governed collection cannot be forgotten)', () => {
    const governed = payload.config.collections.filter(hasGovernance)
    expect(governed.length).toBeGreaterThanOrEqual(10)
    for (const c of governed) {
      expect(c.hooks.afterChange.length, c.slug).toBeGreaterThan(0)
      expect(c.hooks.afterDelete.length, c.slug).toBeGreaterThan(0)
    }
  })
})

describe('notices refresh the public lists when they change visibly', () => {
  it('does nothing for a draft, an autosave or a review step', async () => {
    await approvedNotice()
    expect(tags.calls).toEqual([])
  })

  it('refreshes the list, the item and the sitemap when published', async () => {
    const n = await approvedNotice()
    await publish(n.id)
    expect(tags.calls).toContain('list:notices')
    expect(tags.calls).toContain(`item:notices:${n.id}`)
    expect(tags.calls).toContain('content-sitemap')
  })

  it('stays quiet when the request asks for no revalidation', async () => {
    const n = await approvedNotice()
    await payload.update({
      collection: 'notices',
      id: n.id,
      data: { _status: 'published', governance: {} } as never,
      ...as(approver),
    })
    expect(tags.calls).toEqual([])
  })

  it('refreshes when a live notice is unpublished', async () => {
    const n = await approvedNotice()
    await publish(n.id)
    tags.calls.length = 0
    await payload.update({
      collection: 'notices',
      id: n.id,
      data: { _status: 'draft', governance: {} } as never,
      ...live(approver),
    })
    expect(tags.calls).toContain(`item:notices:${n.id}`)
  })

  it('refreshes when a live notice is deleted, not when a never-published draft is', async () => {
    const draft = await payload.create({ collection: 'notices', draft: true, data: noteData(), ...live(editor) })
    await payload.delete({ collection: 'notices', id: draft.id, ...live(editor) })
    expect(tags.calls).toEqual([])
    const n = await approvedNotice()
    await publish(n.id)
    tags.calls.length = 0
    await payload.delete({ collection: 'notices', id: n.id, overrideAccess: true, context: {} })
    expect(tags.calls).toContain(`item:notices:${n.id}`)
  })

  it('a failed refresh does not fail the save (P3w risk 2)', async () => {
    const n = await approvedNotice()
    tags.calls.push = () => {
      throw new Error('no request context')
    }
    try {
      await expect(publish(n.id)).resolves.toBeDefined()
    } finally {
      delete (tags.calls as unknown as Record<string, unknown>).push
    }
  })
})

describe('the lifecycle sweep refreshes the public lists itself (P3w-b)', () => {
  it('archiving an expired notice refreshes the list', async () => {
    const n = await approvedNotice({ expireAt: new Date(Date.now() + 2 * DAY).toISOString() })
    await publish(n.id)
    tags.calls.length = 0
    const report = await runLifecycleSweep(payload, {
      now: new Date(Date.now() + 10 * DAY),
      collections: ['notices'],
      context: {},
    })
    expect(report.collections.notices.archived).toBeGreaterThanOrEqual(1)
    expect(tags.calls).toContain('list:notices')
    expect(tags.calls).toContain(`item:notices:${n.id}`)
  })

  it('stays quiet when the sweep is run with revalidation off (importer, scripts, tests)', async () => {
    const n = await approvedNotice({ expireAt: new Date(Date.now() + 2 * DAY).toISOString() })
    await publish(n.id)
    tags.calls.length = 0
    await runLifecycleSweep(payload, {
      now: new Date(Date.now() + 10 * DAY),
      collections: ['notices'],
      context: { disableRevalidate: true },
    })
    expect(tags.calls).toEqual([])
  })
})
