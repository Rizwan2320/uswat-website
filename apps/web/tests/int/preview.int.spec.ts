// @vitest-environment node
/**
 * Preview reads. Draft mode is a browser cookie, not a login, so the page must read the draft with
 * the person's own access. Found with a real browser run (prediction P3l-a, P3l-b): the template
 * used `overrideAccess: draft`, so another office's editor and a logged-out browser saw drafts.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { findForPreview, previewReadOptions } from '@/governance/preview'

import {
  as,
  getTestPayload,
  makeUser,
  PASSWORD,
  pageData,
  system,
  uniq,
} from '../helpers/governance'

let payload: Payload
// Unique per run: the slug is made from the title and must not collide with an earlier run.
const LIVE = uniq('live-headline')
const DRAFT = uniq('draft-headline')

async function headersFor(email: string | null): Promise<Headers> {
  const h = new Headers()
  if (email) {
    const { token } = await payload.login({
      collection: 'users',
      data: { email, password: PASSWORD },
    })
    h.set('cookie', `payload-token=${token}`)
  }
  return h
}

async function readPage(slug: string, draftModeOn: boolean, email: string | null) {
  const read = await previewReadOptions(payload, draftModeOn, await headersFor(email))
  const doc = await findForPreview(payload, 'pages', {
    slug,
    draftModeOn,
    headers: await headersFor(email),
  })
  return { read, title: doc?.title ?? null }
}

describe('preview reads', () => {
  let slug: string
  let registrar: Awaited<ReturnType<typeof makeUser>>
  let finance: Awaited<ReturnType<typeof makeUser>>
  let approver: Awaited<ReturnType<typeof makeUser>>
  let contributor: Awaited<ReturnType<typeof makeUser>>
  let otherContributor: Awaited<ReturnType<typeof makeUser>>
  let auditor: Awaited<ReturnType<typeof makeUser>>

  beforeAll(async () => {
    payload = await getTestPayload()
    registrar = await makeUser(payload, 'editor', ['Registrar'])
    finance = await makeUser(payload, 'editor', ['Finance'])
    approver = await makeUser(payload, 'approver', ['Registrar'])
    contributor = await makeUser(payload, 'contributor', ['Registrar'])
    otherContributor = await makeUser(payload, 'contributor', ['Registrar'])
    auditor = await makeUser(payload, 'auditor')

    // A live page created by `contributor`, then a newer unpublished draft on top of it.
    const page = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({ ownerOffice: 'Registrar' }, LIVE) as never,
      ...as(contributor),
    })
    slug = page.slug as string
    for (const [u, governance] of [
      [registrar, { status: 'in_review' }],
      [approver, { status: 'approved', verificationStatus: 'verified' }],
    ] as const) {
      await payload.update({
        collection: 'pages',
        id: page.id,
        draft: true,
        data: { governance } as never,
        ...as(u),
      })
    }
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { _status: 'published', governance: {} } as never,
      ...as(approver),
      ...system,
    })
    await payload.update({
      collection: 'pages',
      id: page.id,
      draft: true,
      data: { title: DRAFT } as never,
      ...as(approver),
      ...system,
    })
  })

  it('draft mode off: the live page, as the public sees it', async () => {
    const r = await readPage(slug, false, registrar.email)
    expect(r.read.draft).toBe(false)
    expect(r.title).toBe(LIVE)
  })

  it('draft mode on but nobody logged in (a stale cookie): the live page, never the draft', async () => {
    const r = await readPage(slug, true, null)
    expect(r.read).toEqual({ draft: false, overrideAccess: false })
    expect(r.title).toBe(LIVE)
  })

  it('draft mode on with a login token that is not valid: the live page', async () => {
    const h = new Headers({ cookie: 'payload-token=not-a-real-token' })
    const read = await previewReadOptions(payload, true, h)
    expect(read.draft).toBe(false)
    expect(read.user).toBeUndefined()
  })

  it('an editor of the owning office sees the newer draft', async () => {
    expect((await readPage(slug, true, registrar.email)).title).toBe(DRAFT)
  })

  it('an approver of the owning office sees the newer draft', async () => {
    expect((await readPage(slug, true, approver.email)).title).toBe(DRAFT)
  })

  it('the auditor, who reads everything, sees the newer draft', async () => {
    expect((await readPage(slug, true, auditor.email)).title).toBe(DRAFT)
  })

  it('an editor of ANOTHER office gets the live page, not the draft, so turning preview on never hides a page', async () => {
    expect((await readPage(slug, true, finance.email)).title).toBe(LIVE)
  })

  it('a page that was never published has no preview for another office, and none for the public', async () => {
    const page = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({ ownerOffice: 'Registrar' }, uniq('never-live')) as never,
      ...as(registrar),
    })
    const s = page.slug as string
    expect((await readPage(s, true, registrar.email)).title).toBe(page.title)
    expect((await readPage(s, true, finance.email)).title).toBeNull()
    expect((await readPage(s, true, null)).title).toBeNull()
  })

  it('a contributor sees the draft of a page they created, not of one someone else created', async () => {
    expect((await readPage(slug, true, contributor.email)).title).toBe(DRAFT)
    expect((await readPage(slug, true, otherContributor.email)).title).toBe(LIVE)
  })

  it('never reads as the system: overrideAccess is always false', async () => {
    for (const email of [null, registrar.email, finance.email]) {
      const read = await previewReadOptions(payload, true, await headersFor(email))
      expect(read.overrideAccess).toBe(false)
    }
  })
})
