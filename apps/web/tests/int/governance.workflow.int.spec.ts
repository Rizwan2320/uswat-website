// @vitest-environment node
/**
 * CMS-03 (states and transitions) and VER-01 (an unverified record cannot go live).
 * Real PostgreSQL. Local API with access enforced; unpublish also goes through the REST handler.
 */
import { REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

// REST requests cannot carry `context.disableRevalidate`; Next's cache is not running in tests.
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import config from '../../src/payload.config'
import type { User } from '../../src/payload-types'
import {
  PASSWORD,
  as,
  can,
  getTestPayload,
  makeUser,
  pageData,
  refusal,
  system,
  uniq,
} from '../helpers/governance'

let payload: Payload
let admin: User, manager: User, approver: User, editor: User, otherEditor: User, contributor: User

const create = (user: User, gov = {}, title?: string) =>
  payload.create({ collection: 'pages', draft: true, data: pageData(gov, title), ...as(user) })
const move = (
  user: User,
  id: number,
  governance: Record<string, unknown>,
  extra: Record<string, unknown> = {},
) =>
  payload.update({
    collection: 'pages',
    id,
    draft: true,
    data: { governance, ...extra },
    ...as(user),
  })
const publish = (user: User, id: number, governance: Record<string, unknown> = {}) =>
  payload.update({
    collection: 'pages',
    id,
    data: { _status: 'published', governance },
    ...as(user),
  })
const publicRead = async (id: number) =>
  (
    await payload.find({
      collection: 'pages',
      where: { id: { equals: id } },
      overrideAccess: false,
      context: system.context,
      depth: 0,
    })
  ).docs[0]
const mainRow = (id: number) =>
  payload.findByID({ collection: 'pages', id, overrideAccess: true, depth: 0 })

/** A record that is approved and verified, ready to publish. */
async function approved(gov = {}) {
  const p = await create(editor, gov)
  await move(editor, p.id, { status: 'in_review' })
  await move(approver, p.id, {
    status: 'approved',
    verificationStatus: 'verified',
    reviewDueAt: '2027-06-30T00:00:00.000Z',
  })
  return p
}

async function call(
  method: 'PATCH' | 'POST',
  user: User,
  path: string[],
  query: string,
  body: unknown,
) {
  const { token } = await payload.login({
    collection: 'users',
    data: { email: user.email, password: PASSWORD },
  })
  const handler = method === 'PATCH' ? REST_PATCH(config) : REST_POST(config)
  const res = await handler(
    new Request(`http://localhost:3000/api/${path.join('/')}${query}`, {
      method,
      headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ slug: path }) },
  )
  return {
    status: res.status,
    body: (await res.json().catch(() => ({}))) as Record<string, unknown>,
  }
}
const rest = (user: User, id: number, query: string, body: unknown) =>
  call('PATCH', user, ['pages', String(id)], query, body)

describe('CMS-03 editorial workflow', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    ;[admin, manager, approver, editor, otherEditor, contributor] = await Promise.all([
      makeUser(payload, 'platformAdmin'),
      makeUser(payload, 'siteManager'),
      makeUser(payload, 'approver', ['Registrar']),
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'editor', ['Finance']),
      makeUser(payload, 'contributor'),
    ])
  })

  it('walks Draft > In review > Approved > Published > Archived > Published, one role at a time', async () => {
    const p = await create(editor)
    expect(p.governance).toMatchObject({
      status: 'draft',
      verificationStatus: 'unverified',
      origin: 'editor',
      riskClass: 'standard',
    })
    expect(p.governance?.createdBy).toMatchObject({ id: editor.id })
    expect(p.governance?.contentHash).toMatch(/^[0-9a-f]{64}$/)

    expect((await move(editor, p.id, { status: 'in_review' })).governance?.status).toBe('in_review')
    expect(await refusal(() => move(editor, p.id, { status: 'approved' }))).toBe(
      'TRANSITION_FORBIDDEN',
    )
    expect(await refusal(() => move(editor, p.id, { verificationStatus: 'verified' }))).toBe(
      'VERIFY_FORBIDDEN',
    )
    expect(await refusal(() => publish(editor, p.id))).not.toBeNull()
    expect(await publicRead(p.id)).toBeUndefined()

    const ok = await move(approver, p.id, { status: 'approved', verificationStatus: 'verified' })
    expect(ok.governance).toMatchObject({ status: 'approved', verificationStatus: 'verified' })
    expect(ok.governance?.verifiedAt).toBeTruthy()
    expect(await publicRead(p.id)).toBeUndefined() // approved is not public

    const live = await publish(approver, p.id)
    expect(live._status).toBe('published')
    expect(live.governance?.status).toBe('published')
    expect((await publicRead(p.id))?.id).toBe(p.id)

    const archived = await publish(approver, p.id, { status: 'archived' })
    expect(archived.governance?.status).toBe('archived')
    expect((await publicRead(p.id))?.id).toBe(p.id) // archived stays readable for the archive listing

    expect(await refusal(() => publish(editor, p.id, { status: 'published' }))).not.toBeNull()
    expect(await refusal(() => publish(manager, p.id, { status: 'published' }))).toBe(
      'TRANSITION_FORBIDDEN',
    )
    expect((await publish(approver, p.id, { status: 'published' })).governance?.status).toBe(
      'published',
    )
  })

  it('refuses to skip steps, create as published, or publish out of the blue', async () => {
    expect(
      await refusal(() =>
        payload.create({
          collection: 'pages',
          draft: false as unknown as true,
          data: { ...pageData(), _status: 'published' },
          ...as(admin),
        }),
      ),
    ).toBe('CREATE_PUBLISHED')
    const p = await create(admin)
    expect(await refusal(() => publish(admin, p.id))).toBe('TRANSITION_ILLEGAL') // draft cannot go straight to live
    expect(await refusal(() => move(admin, p.id, { status: 'archived' }))).toBe(
      'NEEDS_PUBLISH_ACTION',
    )
  })

  it('an editor cannot mark a new record verified', async () => {
    const p = await create(editor, { verificationStatus: 'verified' })
    expect(p.governance?.verificationStatus).toBe('unverified')
    expect(p.governance?.verifiedAt).toBeNull()
  })

  it('VER-01: an unverified record cannot be published by anyone, including a platform admin', async () => {
    const p = await create(editor)
    await move(editor, p.id, { status: 'in_review' })
    await move(approver, p.id, { status: 'approved' }) // approved, but not verified
    expect(await refusal(() => publish(approver, p.id))).toBe('NOT_VERIFIED')
    expect(await refusal(() => publish(admin, p.id))).toBe('NOT_VERIFIED')
    expect(await publicRead(p.id)).toBeUndefined()
  })

  it('VER-01: the system (importers, jobs) can never mark a record verified', async () => {
    const p = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({
        origin: 'importer',
        sourceContentHash: 'abc',
        collectedAt: '2026-11-01T00:00:00.000Z',
      }),
      ...system,
    })
    expect(p.governance).toMatchObject({
      origin: 'importer',
      sourceContentHash: 'abc',
      verificationStatus: 'unverified',
    })
    expect(
      await refusal(() =>
        payload.update({
          collection: 'pages',
          id: p.id,
          draft: true,
          data: { governance: { verificationStatus: 'verified' } },
          ...system,
        }),
      ),
    ).toBe('VERIFY_FORBIDDEN')
  })

  it('a person cannot claim a record came from an importer, or edit its source hash', async () => {
    const p = await create(editor, {
      origin: 'importer',
      sourceContentHash: 'forged',
      collectedAt: '2020-01-01T00:00:00.000Z',
    })
    expect(p.governance).toMatchObject({
      origin: 'editor',
      sourceContentHash: null,
      collectedAt: null,
    })
  })

  it('missing owner or source blocks publishing', async () => {
    const noSource = await approved({ source: null })
    expect(await refusal(() => publish(approver, noSource.id))).toBe('SOURCE_REQUIRED')
    const noOwner = await create(admin, { ownerOffice: null })
    await move(admin, noOwner.id, { status: 'approved', verificationStatus: 'verified' })
    expect(await refusal(() => publish(admin, noOwner.id))).toBe('OWNER_REQUIRED')
  })

  it('edits invalidate approval: a non-reviewer changing content sends it back to draft and unverified', async () => {
    const p = await approved()
    const edited = await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { title: uniq('swapped') },
      ...as(editor),
    })
    expect(edited.governance).toMatchObject({ status: 'draft', verificationStatus: 'unverified' })
    expect(await refusal(() => publish(approver, p.id))).not.toBeNull()
  })

  it('a reviewer editing keeps their own approval', async () => {
    const p = await approved()
    const edited = await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { title: uniq('tidied') },
      ...as(approver),
    })
    expect(edited.governance).toMatchObject({ status: 'approved', verificationStatus: 'verified' })
  })

  it('live content: a draft revision is allowed, a direct edit is not, and the public keeps the old version', async () => {
    const p = await approved()
    await publish(approver, p.id)
    const before = (await publicRead(p.id))!
    const direct = () =>
      payload.update({
        collection: 'pages',
        id: p.id,
        data: { title: uniq('direct') },
        ...as(editor),
      })
    expect(await refusal(direct)).toBe('EDIT_LIVE_NEEDS_REVIEWER')

    const title = uniq('revision')
    const rev = await payload.update({
      collection: 'pages',
      id: p.id,
      draft: true,
      data: { title },
      ...as(editor),
    })
    expect(rev.governance?.status).toBe('draft')
    expect((await publicRead(p.id))?.title).toBe(before.title)

    // The new revision has to go through review again before it replaces the live page.
    expect(await refusal(() => publish(approver, p.id))).not.toBeNull()
    await move(editor, p.id, { status: 'in_review' })
    await move(approver, p.id, { status: 'approved', verificationStatus: 'verified' })
    await publish(approver, p.id)
    expect((await publicRead(p.id))?.title).toBe(title)
  })

  it('high-impact records need an approver in the owning office and a review date', async () => {
    const p = await create(editor, { riskClass: 'high_impact' })
    await move(editor, p.id, { status: 'in_review' })
    expect(await refusal(() => move(manager, p.id, { status: 'approved' }))).toBe(
      'TRANSITION_FORBIDDEN',
    )
    expect(await refusal(() => move(manager, p.id, { verificationStatus: 'verified' }))).toBe(
      'VERIFY_FORBIDDEN',
    )
    await move(approver, p.id, { status: 'approved', verificationStatus: 'verified' })
    expect(await refusal(() => publish(approver, p.id))).toBe('REVIEW_DATE_REQUIRED')
    expect(await refusal(() => publish(manager, p.id))).not.toBeNull()
    await move(approver, p.id, { reviewDueAt: '2027-01-31T00:00:00.000Z' })
    expect((await publish(approver, p.id)).governance?.status).toBe('published')
  })

  it('a site manager can approve and publish a standard record', async () => {
    const p = await create(manager, { ownerOffice: 'Registrar' })
    await move(manager, p.id, { status: 'approved', verificationStatus: 'verified' })
    expect((await publish(manager, p.id)).governance?.status).toBe('published')
  })

  it('an editor from another office cannot submit or touch the record', async () => {
    const p = await create(editor)
    expect(await refusal(() => move(otherEditor, p.id, { status: 'in_review' }))).not.toBeNull()
  })

  it('contributors can only draft: they cannot submit, publish or lower risk', async () => {
    const p = await create(contributor, { ownerOffice: null })
    expect(await refusal(() => move(contributor, p.id, { status: 'in_review' }))).toBe(
      'TRANSITION_FORBIDDEN',
    )
    expect(await refusal(() => publish(contributor, p.id))).not.toBeNull()
    expect(
      await can(() =>
        payload.update({
          collection: 'pages',
          id: p.id,
          draft: true,
          data: { title: uniq('mine') },
          ...as(contributor),
        }),
      ),
    ).toBe(true)
    // A reviewer takes over; the contributor is locked out.
    await move(manager, p.id, { status: 'in_review' })
    expect(
      await refusal(() =>
        payload.update({
          collection: 'pages',
          id: p.id,
          draft: true,
          data: { title: uniq('late') },
          ...as(contributor),
        }),
      ),
    ).toBe('NOT_YOUR_DRAFT')
  })

  it('restore-version cannot be used to bypass the gate', async () => {
    const p = await approved()
    await publish(approver, p.id)
    const versions = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: p.id } },
      sort: 'createdAt',
      overrideAccess: true,
      depth: 0,
    })
    const unverified = versions.docs.find(
      (v) => v.version.governance?.verificationStatus === 'unverified',
    )!
    const verified = versions.docs.find(
      (v) => v.version.governance?.verificationStatus === 'verified',
    )!

    // Local API: restoring a verified version is a promotion; an editor cannot do it.
    expect(
      await refusal(() =>
        payload.restoreVersion({ collection: 'pages', id: verified.id, ...as(editor) }),
      ),
    ).not.toBeNull()

    // Local API: restoring an old unverified version would lower the verification status; only a reviewer may.
    expect(
      await refusal(() =>
        payload.restoreVersion({
          collection: 'pages',
          id: unverified.id,
          draft: true,
          ...as(editor),
        }),
      ),
    ).toBe('VERIFY_FORBIDDEN')

    // REST, no draft flag: restoring a draft version over live content would take the page offline.
    const byEditor = await call(
      'POST',
      editor,
      ['pages', 'versions', String(unverified.id)],
      '',
      {},
    )
    expect(byEditor.status, JSON.stringify(byEditor.body)).toBeGreaterThanOrEqual(400)
    expect((await publicRead(p.id))?.id).toBe(p.id)
  })

  it('unpublish over REST needs a reviewer; saving a draft revision over REST does not', async () => {
    const p = await approved()
    await publish(approver, p.id)

    const asDraft = await rest(editor, p.id, '?draft=true', { title: uniq('rest-draft') })
    expect(asDraft.status).toBe(200)
    expect((await publicRead(p.id))?.id).toBe(p.id)

    const byEditor = await rest(editor, p.id, '', { _status: 'draft' })
    expect(byEditor.status, JSON.stringify(byEditor.body)).toBeGreaterThanOrEqual(400)
    expect(JSON.stringify(byEditor.body)).toContain('UNPUBLISH_FORBIDDEN')
    expect((await publicRead(p.id))?.id).toBe(p.id)

    const byApprover = await rest(approver, p.id, '', { _status: 'draft' })
    expect(byApprover.status, JSON.stringify(byApprover.body)).toBe(200)
    expect(await publicRead(p.id)).toBeUndefined()
    expect((await mainRow(p.id)).governance?.status).toBe('draft')
  })
})
