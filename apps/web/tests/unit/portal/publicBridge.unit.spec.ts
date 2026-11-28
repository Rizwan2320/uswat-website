import { describe, expect, it, vi } from 'vitest'

import { buildMessage, parseMessage, publicWorks, workLink, type BridgeMessage } from '@/modules/portal/bridge/contract'
import { readBridgeConfig, sendMessage } from '@/modules/portal/bridge/sender'
import { syncPublicPage } from '@/modules/portal/bridge/service'
import { HEADER_SIG, HEADER_TIME, MAX_AGE_MS, signRequest, verifyRequest } from '@/modules/portal/bridge/signing'
import type { StoredWork } from '@/modules/portal/publications/types'
import type { ProfileEdit } from '@/modules/portal/profile/types'

const SECRET = 's'.repeat(40)
const NOW = 1_800_000_000_000
const headers = (h: Record<string, string>) => ({ get: (n: string) => h[n.toLowerCase()] ?? null })

const work = (o: Partial<StoredWork> = {}): StoredWork => ({
  id: 'w1', title: 'A work', year: 2024, venue: 'V', doi: '', authors: [], status: 'claimed', duplicateOf: null, sample: true,
  workType: 'article', origin: 'manual', url: '', featured: false, isPublic: true, ...o,
})
const edit: ProfileEdit = {
  bio: { en: 'English bio', ur: 'اردو' }, researchInterests: ['green solvents', 'catalysis'], officeLocation: 'Block B, room 4', officeHours: 'Mon 10 to 12', orcid: '0000-0002-1825-0097', scholarUrl: 'https://scholar.google.com/citations?user=abc', cvLink: 'https://example.org/cv.pdf',
  visibility: { email: 'public', photo: 'hidden' },
}

describe('signing (FP20-b)', () => {
  const body = '{"a":1}'
  const ok = (h: Record<string, string>, b = body, s: string | undefined = SECRET, now = NOW) => verifyRequest(s, b, headers(h), now)
  it('accepts a fresh correct request', () => expect(ok(signRequest(SECRET, body, NOW))).toBe(true))
  it('rejects a changed body', () => expect(ok(signRequest(SECRET, body, NOW), '{"a":2}')).toBe(false))
  it('rejects a timestamp six minutes old and one from the future', () => {
    expect(ok(signRequest(SECRET, body, NOW - MAX_AGE_MS - 60_000))).toBe(false)
    expect(ok(signRequest(SECRET, body, NOW + MAX_AGE_MS + 60_000))).toBe(false)
  })
  it('rejects a wrong secret, no secret and a short secret', () => {
    expect(ok(signRequest('x'.repeat(40), body, NOW))).toBe(false)
    expect(ok(signRequest(SECRET, body, NOW), body, '')).toBe(false)
    expect(ok(signRequest('short', body, NOW), body, 'short')).toBe(false)
  })
  it('rejects missing, malformed or altered headers', () => {
    const h = signRequest(SECRET, body, NOW)
    expect(ok({})).toBe(false)
    expect(ok({ [HEADER_TIME]: h[HEADER_TIME] })).toBe(false)
    expect(ok({ ...h, [HEADER_SIG]: 'zz' })).toBe(false)
    expect(ok({ ...h, [HEADER_TIME]: String(NOW - 1) })).toBe(false) // signature was for another timestamp
  })
})

describe('payload (FP20-c)', () => {
  it('sends only claimed Public works, featured first', () => {
    const list = [
      work({ id: '1', title: 'Plain' }),
      work({ id: '2', title: 'Private', isPublic: false }),
      work({ id: '3', title: 'Unclaimed', status: 'pending' }),
      work({ id: '4', title: 'Featured', featured: true }),
      work({ id: '5', title: 'Rejected', status: 'rejected' }),
    ]
    expect(publicWorks(list).map((w) => w.title)).toEqual(['Featured', 'Plain'])
  })
  it('links the full text, else the DOI, else nothing', () => {
    expect(workLink({ url: 'https://example.org/p.pdf', doi: '10.1/x' })).toBe('https://example.org/p.pdf')
    expect(workLink({ url: '', doi: '10.1/x' })).toBe('https://doi.org/10.1/x')
    expect(workLink({ url: '', doi: '' })).toBe('')
    expect(workLink({ url: 'javascript:alert(1)', doi: '' })).toBe('')
  })
  it('never carries a private work, and never the name, designation or email address', () => {
    const m = buildMessage('sample-person-01', edit, [work({ title: 'Hidden', isPublic: false })], new Date(NOW))!
    expect(JSON.stringify(m)).not.toMatch(/Hidden/)
    expect(m.publications).toEqual([])
    expect(Object.keys(m.edit!).sort()).toEqual(['bio', 'cvLink', 'officeHours', 'officeLocation', 'orcid', 'researchInterests', 'scholarUrl', 'visibility'])
  })
  it('carries stage 2 profile fields and per-work details (FP21-b)', () => {
    const m = buildMessage('sample-person-01', edit, [work({ title: 'W', year: 2021, venue: 'Journal of X', workType: 'conference', featured: true })], new Date(NOW))!
    expect(m.edit).toMatchObject({ researchInterests: ['green solvents', 'catalysis'], officeLocation: 'Block B, room 4', officeHours: 'Mon 10 to 12', orcid: '0000-0002-1825-0097' })
    expect(m.publications[0]).toEqual({ title: 'W', url: '', year: 2021, venue: 'Journal of X', workType: 'conference', featured: true })
  })
  it('sends no edit when nothing has been approved, and refuses a bad subject', () => {
    expect(buildMessage('sample-person-01', null, [], new Date(NOW))!.edit).toBeNull()
    expect(buildMessage('../x', edit, [], new Date(NOW))).toBeNull()
  })
})

describe('allow-list on the site side', () => {
  const good = (): BridgeMessage => buildMessage('sample-person-01', edit, [work({ doi: '10.1/x' })], new Date(NOW))!
  it('accepts what the portal builds, and drops unknown keys', () => {
    const raw = { ...good(), name: 'Evil', designation: 'Vice Chancellor', edit: { ...good().edit, email: 'a@b.c' } }
    const m = parseMessage(JSON.parse(JSON.stringify(raw)))!
    expect(m).toEqual(good())
    expect(Object.keys(m).sort()).toEqual(['approvedAt', 'edit', 'publications', 'subject'])
  })
  it('accepts a message from an older portal build and leaves the stage 2 keys out (FP21-b)', () => {
    const old = { subject: 'sample-person-01', approvedAt: new Date(NOW).toISOString(), edit: { bio: { en: 'a', ur: '' }, cvLink: '', visibility: { email: 'hidden', photo: 'hidden' } }, publications: [{ title: 'T', url: '' }] }
    const m = parseMessage(old)!
    expect(m.edit).toEqual({ bio: { en: 'a', ur: '' }, cvLink: '', visibility: { email: 'hidden', photo: 'hidden' } })
    expect(m.publications[0]).toEqual({ title: 'T', url: '', year: null, venue: '', workType: 'other', featured: false })
  })
  it('refuses bad stage 2 values (FP21-b)', () => {
    const base = JSON.parse(JSON.stringify(good()))
    const bad = (f: (m: Record<string, any>) => void) => { const m = JSON.parse(JSON.stringify(base)); f(m); return parseMessage(m) }
    expect(bad((m) => { m.edit.orcid = '0000-0002-1825-0098' })).toBeNull() // wrong check character
    expect(bad((m) => { m.edit.orcid = 'not-an-orcid' })).toBeNull()
    expect(bad((m) => { m.edit.scholarUrl = 'https://example.org/x' })).toBeNull()
    expect(bad((m) => { m.edit.scholarUrl = 'http://scholar.google.com/x' })).toBeNull()
    expect(bad((m) => { m.edit.researchInterests = new Array(16).fill('k') })).toBeNull()
    expect(bad((m) => { m.edit.researchInterests = ['x'.repeat(61)] })).toBeNull()
    expect(bad((m) => { m.edit.officeHours = 'x'.repeat(201) })).toBeNull()
    expect(bad((m) => { m.publications[0].workType = 'magazine' })).toBeNull()
    expect(bad((m) => { m.publications[0].year = 1800 })).toBeNull()
    expect(bad((m) => { m.publications[0].featured = 'yes' })).toBeNull()
    expect(bad((m) => { m.edit.orcid = ''; m.edit.scholarUrl = ''; m.edit.researchInterests = [] })).not.toBeNull() // empty means "cleared"
  })
  it('refuses wrong types, bad links and oversize text', () => {
    const base = JSON.parse(JSON.stringify(good()))
    const bad = (f: (m: Record<string, any>) => void) => { const m = JSON.parse(JSON.stringify(base)); f(m); return parseMessage(m) }
    expect(bad((m) => { m.subject = 'a b' })).toBeNull()
    expect(bad((m) => { m.edit.visibility.email = 'everyone' })).toBeNull()
    expect(bad((m) => { m.edit.cvLink = 'javascript:alert(1)' })).toBeNull()
    expect(bad((m) => { m.publications[0].url = 'javascript:alert(1)' })).toBeNull()
    expect(bad((m) => { m.publications[0].title = '' })).toBeNull()
    expect(bad((m) => { m.edit.bio.en = 'x'.repeat(5001) })).toBeNull()
    expect(bad((m) => { m.publications = new Array(201).fill({ title: 't', url: '' }) })).toBeNull()
    expect(parseMessage(null)).toBeNull()
  })
})

describe('config and sender', () => {
  it('is off unless both settings are valid; http only for localhost', () => {
    expect(readBridgeConfig({})).toBeNull()
    expect(readBridgeConfig({ PORTAL_BRIDGE_SITE_URL: 'https://site.example', PORTAL_BRIDGE_SECRET: 'short' })).toBeNull()
    expect(readBridgeConfig({ PORTAL_BRIDGE_SITE_URL: 'http://site.example', PORTAL_BRIDGE_SECRET: SECRET })).toBeNull()
    expect(readBridgeConfig({ PORTAL_BRIDGE_SITE_URL: 'https://u:p@site.example', PORTAL_BRIDGE_SECRET: SECRET })).toBeNull()
    expect(readBridgeConfig({ PORTAL_BRIDGE_SITE_URL: 'http://localhost:3000/x', PORTAL_BRIDGE_SECRET: SECRET })).toEqual({ siteUrl: 'http://localhost:3000', secret: SECRET })
  })
  it('posts a signed body to the fixed path and maps outcomes without reading the response', async () => {
    const m = buildMessage('sample-person-01', edit, [], new Date(NOW))!
    let seen: { url: string; init: RequestInit } | null = null
    const f = (status: number) => (async (url: string, init: RequestInit) => { seen = { url, init }; return new Response(null, { status }) }) as unknown as typeof fetch
    const cfg = { siteUrl: 'https://site.example', secret: SECRET }
    expect(await sendMessage(cfg, m, f(200), NOW)).toEqual({ ok: true })
    expect(seen!.url).toBe('https://site.example/api/portal/publish')
    const h = seen!.init.headers as Record<string, string>
    expect(verifyRequest(SECRET, seen!.init.body as string, headers(h), NOW)).toBe(true)
    expect(seen!.init.redirect).toBe('error')
    expect(await sendMessage(cfg, m, f(404), NOW)).toEqual({ ok: false, reason: 'rejected' })
    expect(await sendMessage(cfg, m, f(503), NOW)).toEqual({ ok: false, reason: 'server' })
    expect(await sendMessage(cfg, m, (async () => { throw new Error('down') }) as unknown as typeof fetch, NOW)).toEqual({ ok: false, reason: 'network' })
  })
})

describe('sync service', () => {
  const mk = (over: { recordRef?: string | null; state?: any; send?: any; config?: any } = {}) => {
    const record = vi.fn(async () => {})
    const send = over.send ?? vi.fn(async () => ({ ok: true }))
    const deps = {
      store: { source: async () => ({ recordRef: over.recordRef === undefined ? 'sample-person-01' : over.recordRef, edit, approvedAt: new Date(NOW) }), state: async () => over.state ?? null, record },
      publications: { list: async () => ({ pending: [], claimed: [work({ doi: '10.1/x' })], rejected: [], duplicate: [] }) },
      config: over.config === undefined ? { siteUrl: 'https://site.example', secret: SECRET } : over.config,
      send, now: () => new Date(NOW),
    }
    return { deps, record, send }
  }
  it('is off without configuration and does nothing', async () => {
    const t = mk({ config: null })
    expect(await syncPublicPage(t.deps as any, 'u1')).toEqual({ status: 'off' })
    expect(t.send).not.toHaveBeenCalled()
  })
  it('does not send for an account with no record link', async () => {
    const t = mk({ recordRef: null })
    expect(await syncPublicPage(t.deps as any, 'u1')).toEqual({ status: 'not-linked' })
    expect(t.send).not.toHaveBeenCalled()
  })
  it('sends, records success, and skips an unchanged message unless forced', async () => {
    const t = mk()
    expect(await syncPublicPage(t.deps as any, 'u1')).toEqual({ status: 'sent' })
    const hash = (t.record.mock.calls as any[][])[0][1].hash as string
    const again = mk({ state: { lastAttemptAt: new Date(NOW), lastOkAt: new Date(NOW), lastHash: hash, lastError: null } })
    expect(await syncPublicPage(again.deps as any, 'u1')).toEqual({ status: 'unchanged' })
    expect(again.send).not.toHaveBeenCalled()
    expect(await syncPublicPage(again.deps as any, 'u1', { force: true })).toEqual({ status: 'sent' })
  })
  it('stores a short failure and does not throw', async () => {
    const t = mk({ send: vi.fn(async () => ({ ok: false, reason: 'network' })) })
    expect(await syncPublicPage(t.deps as any, 'u1')).toEqual({ status: 'failed', reason: 'network' })
    expect(t.record).toHaveBeenCalledWith('u1', expect.objectContaining({ ok: false, error: 'site not reachable' }))
  })
})

describe('departure (FP22-c)', () => {
  const base = () => JSON.parse(JSON.stringify(buildMessage('sample-person-02', edit, [work()], new Date(NOW))))
  it('a departure round-trips, and carries no profile text', () => {
    for (const d of ['former', 'emeritus'] as const) {
      const msg = buildMessage('sample-person-02', edit, [work()], new Date(NOW), d)!
      expect(msg.departure).toBe(d)
      expect(msg.edit).toBeNull()
      expect(parseMessage(JSON.parse(JSON.stringify(msg)))).toMatchObject({ subject: 'sample-person-02', departure: d, edit: null })
    }
  })
  it('refuses any other value, and a message without one is as before', () => {
    expect(parseMessage({ ...base(), departure: 'retired' })).toBeNull()
    expect(parseMessage({ ...base(), departure: 7 })).toBeNull()
    expect(parseMessage({ ...base(), departure: 'current' })).toBeNull()
    const plain = parseMessage(base())!
    expect(plain.departure).toBeUndefined()
    expect(plain.edit).not.toBeNull()
    expect(parseMessage({ ...base(), departure: null })!.departure).toBeUndefined()
  })
  it('a parsed departure drops an edit sent with it', () => {
    expect(parseMessage({ ...base(), departure: 'former' })!.edit).toBeNull()
  })
})
