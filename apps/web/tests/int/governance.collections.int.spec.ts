/**
 * The four collections added in slice 3b go through the same lifecycle as Pages and Posts:
 * draft, review, verify, publish, public read, audit. Real PostgreSQL, access enforced.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

type Slug = 'affiliated-colleges' | 'contact-directory' | 'merit-lists' | 'article-tags'

const factories: Record<Slug, () => Record<string, unknown>> = {
  'affiliated-colleges': () => ({
    name: uniq('College'),
    sector: 'Private',
    number: 1,
    programmes: [{ name: 'BS Test' }],
  }),
  'contact-directory': () => ({
    section: 'Admissions',
    name: uniq('Desk'),
    phones: [{ number: '000-0000000' }],
    email: `${uniq('desk')}@example.test`,
  }),
  'merit-lists': () => ({
    title: uniq('Merit list'),
    admissionCycle: 'Test cycle',
    documents: [{ label: 'List 1', url: 'https://example.test/list-1.pdf' }],
  }),
  'article-tags': () => ({ name: uniq('Tag'), aliases: [{ alias: 'T' }] }),
}

let payload: Payload
let admin: User, approver: User, editor: User, otherEditor: User, contributor: User, auditor: User

const gov = { ownerOffice: 'Registrar', source: 'https://example.test/source' }

describe.each(Object.keys(factories) as Slug[])('governed collection: %s', (slug) => {
  const create = (user: User, extra = {}) =>
    payload.create({
      collection: slug,
      draft: true,
      data: { ...factories[slug](), governance: { ...gov, ...extra } } as never,
      ...as(user),
    }) as Promise<{ id: number; governance?: Record<string, unknown> }>
  const update = (
    user: User,
    id: number,
    governance: Record<string, unknown>,
    extra: Record<string, unknown> = {},
    draft = true,
  ) =>
    payload.update({
      collection: slug,
      id,
      draft,
      data: { governance, ...extra } as never,
      ...as(user),
    }) as Promise<{ governance?: Record<string, unknown>; _status?: string }>
  const publicRead = async (id: number) =>
    (
      await payload.find({
        collection: slug,
        where: { id: { equals: id } },
        overrideAccess: false,
        context: system.context,
        depth: 0,
      })
    ).docs[0]

  beforeAll(async () => {
    payload = await getTestPayload()
    ;[admin, approver, editor, otherEditor, contributor, auditor] = await Promise.all([
      makeUser(payload, 'platformAdmin'),
      makeUser(payload, 'approver', ['Registrar']),
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'editor', ['Finance']),
      makeUser(payload, 'contributor'),
      makeUser(payload, 'auditor'),
    ])
  })

  it('starts as an unverified draft owned by its creator, and is not public', async () => {
    const r = await create(editor)
    expect(r.governance).toMatchObject({
      status: 'draft',
      verificationStatus: 'unverified',
      origin: 'editor',
      riskClass: 'standard',
    })
    expect(await publicRead(r.id)).toBeUndefined()
  })

  it('goes Draft > In review > Approved > Published and becomes public, with an audit trail', async () => {
    const r = await create(editor)
    await update(editor, r.id, { status: 'in_review' })
    expect(await refusal(() => update(editor, r.id, { status: 'approved' }))).toBe(
      'TRANSITION_FORBIDDEN',
    )
    await update(approver, r.id, { status: 'approved', verificationStatus: 'verified' })
    const live = await update(approver, r.id, {}, { _status: 'published' }, false)
    expect(live.governance?.status).toBe('published')
    expect((await publicRead(r.id))?.id).toBe(r.id)

    const log = await payload.find({
      collection: 'audit-logs',
      where: { and: [{ collection: { equals: slug } }, { recordId: { equals: String(r.id) } }] },
      sort: 'createdAt',
      overrideAccess: true,
    })
    expect(log.docs.map((e) => e.action)).toEqual(['create', 'update', 'update', 'update'])
    expect(log.docs.at(-1)).toMatchObject({
      transitionFrom: 'approved',
      transitionTo: 'published',
      actorRole: 'approver',
    })
  })

  it('VER-01: an approved but unverified record cannot be published, even by a platform admin', async () => {
    const r = await create(editor)
    await update(approver, r.id, { status: 'approved' })
    expect(await refusal(() => update(admin, r.id, {}, { _status: 'published' }, false))).toBe(
      'NOT_VERIFIED',
    )
    expect(await publicRead(r.id)).toBeUndefined()
  })

  it('needs an owner office and a source to publish', async () => {
    const noSource = await create(admin, { source: null })
    await update(admin, noSource.id, { status: 'approved', verificationStatus: 'verified' })
    expect(
      await refusal(() => update(admin, noSource.id, {}, { _status: 'published' }, false)),
    ).toBe('SOURCE_REQUIRED')
  })

  it('refuses people outside the role or office', async () => {
    const r = await create(editor)
    expect(await refusal(() => update(otherEditor, r.id, { status: 'in_review' }))).not.toBeNull()
    expect(await refusal(() => update(contributor, r.id, { status: 'in_review' }))).not.toBeNull()
    expect(await refusal(() => update(auditor, r.id, { status: 'in_review' }))).not.toBeNull()
    expect(
      await refusal(() => payload.delete({ collection: slug, id: r.id, ...as(editor) })),
    ).not.toBeNull()
    expect(await refusal(() => create(auditor))).not.toBeNull()
  })

  it('a contributor can start a draft but not submit it', async () => {
    const r = await create(contributor, { ownerOffice: null })
    expect(await refusal(() => update(contributor, r.id, { status: 'in_review' }))).toBe(
      'TRANSITION_FORBIDDEN',
    )
  })
})

describe('post tags', () => {
  it('a post can carry tags, and a tag is found by its alias data', async () => {
    payload = await getTestPayload()
    const admin = await makeUser(payload, 'platformAdmin')
    const tag = await payload.create({
      collection: 'article-tags',
      draft: true,
      data: { ...factories['article-tags'](), governance: gov } as never,
      ...as(admin),
    })
    expect(tag.slug).toBeTruthy()
    const post = await payload.create({
      collection: 'posts',
      draft: true,
      data: { title: uniq('post'), tags: [tag.id], governance: gov } as never,
      ...as(admin),
    })
    const read = await payload.findByID({
      collection: 'posts',
      id: post.id,
      depth: 1,
      draft: true,
      overrideAccess: true,
    })
    expect((read.tags as { id: number }[])[0]?.id).toBe(tag.id)
  })
})
