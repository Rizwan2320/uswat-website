// @vitest-environment node
/**
 * PR #5 review R1 and R2: link fields refuse unsafe addresses on save, and an event cannot be
 * published without a start.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, refusal, uniq } from '../helpers/governance'

let payload: Payload
let editor: User, approver: User

const gov = { ownerOffice: 'Registrar', source: 'https://example.test/source' }
const BAD = [
  'javascript:alert(1)',
  ' JaVaScRiPt:alert(1)',
  'data:text/html,x',
  '//evil.test/x',
  'java\tscript:alert(1)',
]
const GOOD = [
  'https://example.test/a.pdf',
  'mailto:registrar@example.test',
  'tel:0946920810',
  '/documents/a.pdf',
]

const notice = (attachments: unknown) =>
  payload.create({
    collection: 'notices',
    draft: true,
    data: { title: uniq('n'), excerpt: 'Sample', attachments, governance: gov } as never,
    ...as(editor),
  }) as Promise<{ id: number }>
const approve = async (id: number) => {
  for (const [u, governance] of [
    [editor, { status: 'in_review' }],
    [approver, { status: 'approved', verificationStatus: 'verified' }],
  ] as const) {
    await payload.update({
      collection: 'notices',
      id,
      draft: true,
      data: { governance } as never,
      ...as(u),
    })
  }
}
const publish = (id: number) =>
  payload.update({
    collection: 'notices',
    id,
    data: { _status: 'published', governance: {} } as never,
    ...as(approver),
  })

describe('safe links', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[editor, approver] = await Promise.all([
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'approver', ['Registrar']),
    ])
  })

  // Payload checks field rules when publishing, not when saving a draft, so a draft may hold the
  // text; it cannot go live, and the site refuses it again at render time.
  it.each(BAD)('refuses %j as an attachment address when publishing', async (url) => {
    const n = await notice([{ label: 'File', url }])
    await approve(n.id)
    expect(await refusal(() => publish(n.id))).not.toBeNull()
    const row = await payload.findByID({
      collection: 'notices',
      id: n.id,
      overrideAccess: true,
      depth: 0,
    })
    expect(row._status).not.toBe('published')
  })

  it.each(GOOD)('publishes with %j', async (url) => {
    const n = await notice([{ label: 'File', url }])
    await approve(n.id)
    expect(await refusal(() => publish(n.id))).toBeNull()
  })

  it('wires the same validator onto every link field', () => {
    const find = (slug: string, group: string, name: string) => {
      const col = payload.collections[slug as 'notices'].config
      const arr = col.fields.find((f) => 'name' in f && f.name === group) as {
        fields: { name: string; validate?: unknown }[]
      }
      return arr.fields.find((f) => f.name === name)
    }
    const top = (slug: string, name: string) =>
      payload.collections[slug as 'notices'].config.fields.find(
        (f) => 'name' in f && f.name === name,
      ) as {
        validate?: unknown
      }
    const v = find('notices', 'attachments', 'url')?.validate
    expect(typeof v).toBe('function')
    expect(find('merit-lists', 'documents', 'url')?.validate).toBe(v)
    expect(top('affiliated-colleges', 'link').validate).toBe(v)
  })
})

describe('events need a start (R2)', () => {
  const event = (extra: Record<string, unknown> = {}) =>
    payload.create({
      collection: 'events',
      draft: true,
      data: {
        title: uniq('e'),
        excerpt: 'Sample',
        governance: { ...gov, expireAt: new Date(Date.now() + 40 * 86_400_000).toISOString() },
        ...extra,
      } as never,
      ...as(editor),
    }) as Promise<{ id: number }>
  const approveEv = async (id: number) => {
    for (const [u, governance] of [
      [editor, { status: 'in_review' }],
      [approver, { status: 'approved', verificationStatus: 'verified' }],
    ] as const) {
      await payload.update({
        collection: 'events',
        id,
        draft: true,
        data: { governance } as never,
        ...as(u),
      })
    }
  }
  const publishEv = (id: number) =>
    payload.update({
      collection: 'events',
      id,
      data: { _status: 'published', governance: {} } as never,
      ...as(approver),
    })

  it('saves a draft without a start, refuses to publish it, then publishes once a start is set', async () => {
    const e = await event()
    await approveEv(e.id)
    expect(await refusal(() => publishEv(e.id))).not.toBeNull()
    await payload.update({
      collection: 'events',
      id: e.id,
      draft: true,
      data: { startsAt: new Date(Date.now() + 86_400_000).toISOString() } as never,
      ...as(editor),
    })
    await approveEv(e.id)
    expect(await refusal(() => publishEv(e.id))).toBeNull()
  })
})
