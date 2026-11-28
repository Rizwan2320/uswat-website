// @vitest-environment node
/**
 * The faculty portal bridge writing a live People record through the real governance hooks (ADR-0029, FP20-a). Needs a local PostgreSQL.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }))

import { buildMessage } from '../../src/modules/portal/bridge/contract'
import { applyPortalMessage } from '../../src/modules/portal/bridge/receive'
import type { ProfileEdit } from '../../src/modules/portal/profile/types'
import { as, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

let payload: Payload
const slug = uniq('bridge-person')

const edit: ProfileEdit = {
  bio: { en: 'Bridge English bio', ur: 'برج اردو تعارف' }, researchInterests: [], officeLocation: '', officeHours: '', orcid: '', scholarUrl: '',
  cvLink: 'https://example.org/cv.pdf', visibility: { email: 'public', photo: 'hidden' },
}
const work = (o: Record<string, unknown>) => ({ id: 'w', title: 'T', year: 2024, venue: '', doi: '', authors: [], status: 'claimed', duplicateOf: null, sample: true, workType: 'article', origin: 'manual', url: '', featured: false, isPublic: true, ...o }) as never

async function read() {
  const doc = (await payload.find({ collection: 'people', where: { slug: { equals: slug } }, draft: false, limit: 1, locale: 'all', depth: 0, overrideAccess: true })).docs[0] as Record<string, any>
  return doc
}

async function makeLive(personSlug: string, urduName: boolean) {
  const admin = await makeUser(payload, 'platformAdmin', ['Registrar'])
  const closer = await makeUser(payload, 'platformAdmin', ['Registrar'])
  const rec = (await payload.create({
    collection: 'people', draft: true,
    data: { name: 'Bridge Person', slug: personSlug, designation: 'Lecturer', governance: { ownerOffice: 'Registrar', source: `https://${personSlug}.invalid/x` } } as never,
    ...as(admin),
  })) as unknown as { id: number }
  if (urduName) await payload.update({ collection: 'people', id: rec.id, draft: true, locale: 'ur', data: { name: 'برج شخص' } as never, ...as(admin) })
  const step = (d: Record<string, unknown>, who = admin) => payload.update({ collection: 'people', id: rec.id, draft: true, data: d as never, ...as(who) })
  await step({ governance: { status: 'in_review' } })
  await step({ governance: { status: 'approved', verificationStatus: 'verified', reviewDueAt: '2027-12-31T00:00:00.000Z' } }, closer)
  await payload.update({ collection: 'people', id: rec.id, data: { _status: 'published' } as never, ...as(closer) })
}

beforeAll(async () => {
  payload = await getTestPayload()
  await makeLive(slug, true)
})

describe('portal message applied to a live People record', () => {
  it('without the flag a system write to live content is still refused', async () => {
    const id = (await read()).id
    const code = await refusal(() => payload.update({ collection: 'people', id, data: { cvLink: 'https://example.org/x' } as never, draft: false, ...system }))
    expect(code).toBe('EDIT_LIVE_NEEDS_REVIEWER')
  })

  it('writes bio (English and Urdu), CV link, visibility and works; keeps the name, designation, status and Fact-check', async () => {
    const msg = buildMessage(slug, edit, [work({ id: '1', title: 'Plain', doi: '10.1/plain' }), work({ id: '2', title: 'Featured', featured: true, url: 'https://example.org/full.pdf' }), work({ id: '3', title: 'Private', isPublic: false }), work({ id: '4', title: 'Bare' })], new Date())!
    expect(await applyPortalMessage(payload, msg)).toEqual({ ok: true, slug, changed: true, urduSkipped: false })
    const d = await read()
    expect(d.details).toEqual({ en: 'Bridge English bio', ur: 'برج اردو تعارف' })
    expect(d.cvLink).toBe('https://example.org/cv.pdf')
    expect(d.visibility).toMatchObject({ email: 'public', photo: 'hidden' })
    expect(d.publications.map((p: any) => [p.title, p.url ?? null])).toEqual([['Featured', 'https://example.org/full.pdf'], ['Plain', 'https://doi.org/10.1/plain'], ['Bare', null]])
    expect(d.name).toEqual({ en: 'Bridge Person', ur: 'برج شخص' })
    expect(d.designation.en).toBe('Lecturer')
    expect(d._status).toBe('published')
    expect(d.governance.verificationStatus).toBe('verified')
    expect(d.governance.status).toBe('published')
  })

  it('a second identical message changes nothing, and a smaller list replaces the old one', async () => {
    const same = buildMessage(slug, edit, [work({ id: '1', title: 'Plain', doi: '10.1/plain' }), work({ id: '2', title: 'Featured', featured: true, url: 'https://example.org/full.pdf' }), work({ id: '4', title: 'Bare' })], new Date())!
    expect(await applyPortalMessage(payload, same)).toEqual({ ok: true, slug, changed: false, urduSkipped: false })
    const smaller = buildMessage(slug, edit, [work({ id: '2', title: 'Featured', featured: true, url: 'https://example.org/full.pdf' })], new Date())!
    expect(await applyPortalMessage(payload, smaller)).toMatchObject({ ok: true, changed: true })
    expect((await read()).publications).toHaveLength(1)
  })

  it('with nothing approved yet, leaves the text, CV link and visibility alone', async () => {
    const msg = buildMessage(slug, null, [], new Date())!
    expect(await applyPortalMessage(payload, msg)).toMatchObject({ ok: true })
    const d = await read()
    expect(d.publications).toEqual([])
    expect(d.details.en).toBe('Bridge English bio')
    expect(d.cvLink).toBe('https://example.org/cv.pdf')
  })

  it('a person with no Urdu name still gets everything else; the Urdu text is skipped, not an error', async () => {
    const other = uniq('bridge-nour')
    await makeLive(other, false)
    const msg = buildMessage(other, edit, [work({ id: '1', title: 'Only' })], new Date())!
    expect(await applyPortalMessage(payload, msg)).toEqual({ ok: true, slug: other, changed: true, urduSkipped: true })
    const d = (await payload.find({ collection: 'people', where: { slug: { equals: other } }, draft: false, limit: 1, locale: 'all', depth: 0, overrideAccess: true })).docs[0] as Record<string, any>
    expect(d.details.en).toBe('Bridge English bio')
    expect(d.publications).toHaveLength(1)
  })

  it('keeps the live name and designation even when the live row was changed outside Payload (a SQL data fill)', async () => {
    const other = uniq('bridge-sqlfill')
    await makeLive(other, true)
    const pool = (payload.db as unknown as { pool: { query: (q: string, v: unknown[]) => Promise<unknown> } }).pool
    await pool.query(`update people_locales set name = $1, designation = $2 where _locale = 'en' and _parent_id = (select id from people where slug = $3)`, ['Dr. Filled In', 'Professor', other])
    const msg = buildMessage(other, edit, [], new Date())!
    expect(await applyPortalMessage(payload, msg)).toMatchObject({ ok: true, changed: true })
    const d = (await payload.find({ collection: 'people', where: { slug: { equals: other } }, draft: false, limit: 1, locale: 'all', depth: 0, overrideAccess: true })).docs[0] as Record<string, any>
    expect(d.name.en).toBe('Dr. Filled In')
    expect(d.designation.en).toBe('Professor')
    expect(d.name.ur).toBe('برج شخص')
  })

  it('never creates a record for an unknown person', async () => {
    const msg = buildMessage('nobody-' + slug, edit, [], new Date())!
    expect(await applyPortalMessage(payload, msg)).toEqual({ ok: false, reason: 'no-record' })
  })
})
