// @vitest-environment node
/**
 * Sample organisation seeds on a real local database (brief p4-seeds). The seeds have fixed keys,
 * so the test does not assume an empty database: after the first call everything exists and is
 * published; a second call changes nothing.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { applySeeds, seedRows } from '../../../../scripts/import/seeds/apply'
import { SAMPLE_HOST } from '../../../../scripts/import/seeds/data'
import type { Cms } from '../../../../scripts/import/writer'
import { getTestPayload, makeUser } from '../helpers/governance'

let payload: Payload
let cms: Cms
let actor: { user: Record<string, unknown> }

const count = (c: string) =>
  payload.find({ collection: c as never, draft: true, depth: 0, limit: 1, overrideAccess: true, where: { 'governance.source': { like: `https://${SAMPLE_HOST}/seed/${c}/` } } as never })
const versions = async (c: string) => (await payload.countVersions({ collection: c as never, overrideAccess: true })).totalDocs
const anon = (c: string, extra: Record<string, unknown> = {}) =>
  payload.find({ collection: c as never, overrideAccess: false, draft: false, limit: 100, depth: 1, context: { disableRevalidate: true }, where: { 'governance.source': { like: `https://${SAMPLE_HOST}/seed/${c}/` } } as never, ...extra } as never)

beforeAll(async () => {
  payload = await getTestPayload()
  cms = payload as unknown as Cms
  actor = { user: { ...(await makeUser(payload, 'platformAdmin')), collection: 'users' } }
}, 60_000)

describe('applySeeds', () => {
  it('leaves every Sample record published, and a second run changes nothing', async () => {
    await applySeeds(cms, actor)
    const before = Object.fromEntries(await Promise.all(Object.keys(seedRows()).map(async (c) => [c, await versions(c)])))
    const second = await applySeeds(cms, actor)
    expect(second).toMatchObject({ created: 0, linked: 0, published: 0, unchanged: 41 })
    for (const [c, rows] of Object.entries(seedRows())) {
      expect((await count(c)).totalDocs, c).toBe(rows.length)
      expect(await versions(c), c).toBe(before[c])
    }
  }, 120_000)

  it('shows anonymous readers the published rows with their relations', async () => {
    const depts = await anon('departments')
    expect(depts.totalDocs).toBe(8)
    for (const d of depts.docs as unknown as { slug: string; facultyGroup: { name: string }; head: { name: string } }[]) {
      expect(d.facultyGroup.name, d.slug).toMatch(/^Sample Faculty/)
      expect(d.head.name, d.slug).toMatch(/^Sample Person/)
    }
    const progs = await anon('programmes')
    expect(progs.totalDocs).toBe(14)
    for (const p of progs.docs as unknown as { department: { name: string }; campus: { name: string } }[]) {
      expect(p.department.name).toMatch(/^Sample Department/)
      expect(p.campus.name).toMatch(/^Sample .*Campus/)
    }
    const heads = (await anon('people')).docs as unknown as { slug: string; department?: { name: string } | null }[]
    expect(heads.find((p) => p.slug === 'sample-person-01')?.department?.name).toBe('Sample Department of Physics')
  })

  it('hides a hidden email from anonymous readers and shows the one public email', async () => {
    const docs = (await anon('people')).docs as unknown as { slug: string; email?: string | null }[]
    expect(docs).toHaveLength(10)
    const shown = docs.filter((p) => p.email)
    expect(shown.map((p) => p.slug)).toEqual(['sample-person-01'])
    expect(shown[0].email).toBe(`person01@${SAMPLE_HOST}`)
  })

  it('keeps the slug it was given and stores the governance data the policy requires (owner office is stored in lower case)', async () => {
    const docs = (await anon('faculties')).docs as unknown as { slug: string; governance: Record<string, string> }[]
    expect(docs.map((d) => d.slug).sort()).toEqual(seedRows().faculties.map((r) => r.slug).sort())
    for (const d of docs) expect(d.governance).toMatchObject({ status: 'published', verificationStatus: 'verified', ownerOffice: 'sample owner office' })
  })
})
