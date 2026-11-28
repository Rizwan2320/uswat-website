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
import { toPersonProfile } from '../../src/site/people/shape'
import { as, getTestPayload, makeUser, refusal, system, uniq } from '../helpers/governance'

let payload: Payload
const slug = uniq('bridge-person')

const edit: ProfileEdit = {
  bio: { en: 'Bridge English bio', ur: 'برج اردو تعارف' }, researchInterests: ['green solvents', 'catalysis'], officeLocation: 'Block B, room 4', officeHours: 'Mon 10 to 12', orcid: '0000-0002-1825-0097', scholarUrl: 'https://scholar.google.com/citations?user=abc',
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

  it('writes stage 2: interests, office, hours, ORCID, Scholar and per-work details; the public shape reads them back (FP21)', async () => {
    const msg = buildMessage(slug, edit, [work({ id: '1', title: 'Detailed', year: 2022, venue: 'Journal of X', workType: 'conference', featured: true, url: 'https://example.org/d.pdf' }), work({ id: '2', title: 'Second', year: 2020 })], new Date())!
    expect(await applyPortalMessage(payload, msg)).toMatchObject({ ok: true, changed: true })
    const d = await read()
    expect(d.researchInterests.map((r: any) => r.text)).toEqual(['green solvents', 'catalysis'])
    expect([d.officeLocation, d.officeHours, d.orcid, d.scholarUrl]).toEqual(['Block B, room 4', 'Mon 10 to 12', '0000-0002-1825-0097', 'https://scholar.google.com/citations?user=abc'])
    expect(d.publications[0]).toMatchObject({ title: 'Detailed', year: 2022, venue: 'Journal of X', workType: 'conference', featured: true })
    const live = (await payload.find({ collection: 'people', where: { slug: { equals: slug } }, draft: false, limit: 1, depth: 1, overrideAccess: false })).docs[0] as never
    const p = toPersonProfile(live)!
    expect(p.interests).toEqual(['green solvents', 'catalysis'])
    expect(p.officeNote).toBe('Block B, room 4')
    expect(p.orcidHref).toBe('https://orcid.org/0000-0002-1825-0097')
    expect(p.scholarHref).toBe('https://scholar.google.com/citations?user=abc')
    expect(p.publications[0]).toMatchObject({ title: 'Detailed', meta: 'Journal of X · 2022 · Conference paper', featured: true, href: 'https://example.org/d.pdf' })
    expect(p.publications[1]).toMatchObject({ title: 'Second', meta: '2020 · Journal article', featured: false })
  })

  it('clearing a field in the portal clears it on the site, and a message without stage 2 keys leaves them alone (FP21)', async () => {
    const cleared = buildMessage(slug, { ...edit, researchInterests: [], officeHours: '', orcid: '', scholarUrl: '' }, [], new Date())!
    expect(await applyPortalMessage(payload, cleared)).toMatchObject({ ok: true, changed: true })
    let d = await read()
    expect(d.researchInterests).toEqual([])
    expect([d.officeHours, d.orcid, d.scholarUrl]).toEqual([null, null, null])
    expect(d.officeLocation).toBe('Block B, room 4')
    const old = { ...buildMessage(slug, edit, [], new Date())! }
    delete (old.edit as Record<string, unknown>).officeLocation
    delete (old.edit as Record<string, unknown>).researchInterests
    delete (old.edit as Record<string, unknown>).officeHours
    delete (old.edit as Record<string, unknown>).orcid
    delete (old.edit as Record<string, unknown>).scholarUrl
    expect(await applyPortalMessage(payload, old)).toMatchObject({ ok: true, changed: false })
    d = await read()
    expect(d.officeLocation).toBe('Block B, room 4')
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
