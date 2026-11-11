// @vitest-environment node
/**
 * The reviewer's open follow-up: what the REST API shows for versions and drafts, by role.
 * Real PostgreSQL, real route handlers, real JWTs.
 */
import { REST_GET } from '@payloadcms/next/routes'
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import config from '../../src/payload.config'
import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, PASSWORD, pageData, uniq } from '../helpers/governance'

let payload: Payload
let admin: User, manager: User, auditor: User, editorA: User, editorB: User, contributor: User
let approverA: User

async function get(user: User | null, path: string[], query = '') {
  const headers: Record<string, string> = {}
  if (user) {
    const { token } = await payload.login({
      collection: 'users',
      data: { email: user.email, password: PASSWORD },
    })
    headers.Authorization = `JWT ${token}`
  }
  const res = await REST_GET(config)(
    new Request(`http://localhost:3000/api/${path.join('/')}${query}`, { method: 'GET', headers }),
    { params: Promise.resolve({ slug: path }) },
  )
  return { status: res.status, body: (await res.json().catch(() => ({}))) as any }
}

const make = (user: User, title: string) =>
  payload.create({
    collection: 'pages',
    draft: true,
    data: pageData({}, title) as never,
    ...as(user),
  })
const step = (id: number, user: User, governance: Record<string, unknown>) =>
  payload.update({
    collection: 'pages',
    id,
    draft: true,
    data: { governance } as never,
    ...as(user),
  })

async function goLive(id: number, ownerEditor: User) {
  await step(id, ownerEditor, { status: 'in_review' })
  await step(id, approverA, { status: 'approved', verificationStatus: 'verified' })
  await payload.update({
    collection: 'pages',
    id,
    data: { _status: 'published', governance: {} } as never,
    ...as(approverA),
  })
}

const titlesOf = (r: { body: any }) =>
  (r.body.docs ?? []).map((d: any) => d.version?.title ?? d.title)

describe('REST versions and drafts', () => {
  let aTitle: string, bTitle: string, cTitle: string, liveTitle: string, newerDraft: string
  let liveId: number, neverLiveId: number

  beforeAll(async () => {
    payload = await getTestPayload()
    ;[admin, manager, auditor, editorA, editorB, contributor, approverA] = await Promise.all([
      makeUser(payload, 'platformAdmin'),
      makeUser(payload, 'siteManager'),
      makeUser(payload, 'auditor'),
      makeUser(payload, 'editor', ['Registrar']),
      makeUser(payload, 'editor', ['Finance']),
      makeUser(payload, 'contributor'),
      makeUser(payload, 'approver', ['Registrar']),
    ])
    aTitle = uniq('office-a')
    bTitle = uniq('contrib')
    await make(editorA, aTitle)
    // A contributor's own page, in another office.
    const c = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({ ownerOffice: 'Finance' }, (bTitle = uniq('contrib'))) as never,
      ...as(contributor),
    })
    cTitle = bTitle
    neverLiveId = (await make(editorA, uniq('never-live'))).id
    // A live page with a newer, unpublished draft text.
    liveTitle = uniq('live-text')
    liveId = (await make(editorA, liveTitle)).id
    await goLive(liveId, editorA)
    newerDraft = uniq('secret-draft')
    await payload.update({
      collection: 'pages',
      id: liveId,
      draft: true,
      data: { title: newerDraft } as never,
      ...as(editorA),
    })
    void c
  })

  it('anonymous callers cannot list versions', async () => {
    const r = await get(null, ['pages', 'versions'])
    expect(r.status).toBe(403)
  })

  it("an editor of another office sees none of this office's versions", async () => {
    const r = await get(editorB, ['pages', 'versions'], '?limit=200')
    expect(r.status).toBe(200)
    expect(titlesOf(r)).not.toContain(aTitle)
    expect(titlesOf(r)).not.toContain(newerDraft)
  })

  it('the office editor sees them', async () => {
    const r = await get(editorA, ['pages', 'versions'], '?limit=200')
    expect(titlesOf(r)).toContain(aTitle)
    expect(titlesOf(r)).toContain(newerDraft)
  })

  it('a contributor sees only versions of pages they created', async () => {
    const r = await get(contributor, ['pages', 'versions'], '?limit=200')
    expect(r.status).toBe(200)
    expect(titlesOf(r)).toContain(cTitle)
    expect(titlesOf(r)).not.toContain(aTitle)
    expect(titlesOf(r)).not.toContain(newerDraft)
  })

  it.each([
    ['auditor', () => auditor],
    ['site manager', () => manager],
    ['platform admin', () => admin],
  ])('the %s sees every version', async (_n, who) => {
    const r = await get(who(), ['pages', 'versions'], '?limit=500')
    expect(titlesOf(r)).toEqual(expect.arrayContaining([aTitle, cTitle, newerDraft]))
  })

  it('anonymous: a never-published page is not returned, even with draft=true', async () => {
    const byId = await get(null, ['pages', String(neverLiveId)], '?draft=true')
    expect([401, 403, 404]).toContain(byId.status)
    const list = await get(null, ['pages'], '?draft=true&limit=500')
    expect(JSON.stringify(list.body)).not.toContain('never-live')
  })

  it('anonymous: a live page with a newer draft shows the live text, never the draft', async () => {
    const byId = await get(null, ['pages', String(liveId)])
    const list = await get(null, ['pages'], '?limit=500')
    const text = JSON.stringify(byId.body) + JSON.stringify(list.body)
    expect(text).toContain(liveTitle)
    expect(text).not.toContain(newerDraft)
  })

  it('anonymous: asking for drafts returns no draft text (the live page is simply not found that way)', async () => {
    const byId = await get(null, ['pages', String(liveId)], '?draft=true')
    const list = await get(null, ['pages'], '?draft=true&limit=500')
    expect(JSON.stringify(byId.body) + JSON.stringify(list.body)).not.toContain(newerDraft)
  })

  it('anonymous: a status filter cannot be used to find drafts', async () => {
    const r = await get(null, ['pages'], '?where[_status][equals]=draft&limit=500')
    expect(JSON.stringify(r.body)).not.toContain('never-live')
  })
})
