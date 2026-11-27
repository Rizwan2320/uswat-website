import { describe, expect, it, vi } from 'vitest'

import { createPublicationService } from '@/modules/portal/publications/service'
import type { CandidateSource, PublicationStore } from '@/modules/portal/publications/types'
import type { ProfileStore } from '@/modules/portal/profile/types'
import { EMPTY_EDIT } from '@/modules/portal/profile/sampleStore'

const ID = '0b5e2b0e-6c47-4b0e-9a54-1f3a7c0c2d11'
const OTHER = '1c6f3c1f-7d58-4c1f-8b65-2a4b8d1d3e22'
const NOW = Date.UTC(2026, 10, 18)

function setup(opts: { account?: { id: string; email: string } | null; orcid?: string; raw?: unknown[]; fail?: boolean; store?: Partial<PublicationStore> } = {}) {
  const account = opts.account === undefined ? { id: 'u1', email: 'a@example.invalid' } : opts.account
  const store: PublicationStore = {
    addCandidates: vi.fn(async (_a, w) => ({ added: w.length, alreadyKnown: 0 })),
    list: vi.fn(),
    claim: vi.fn(async () => true),
    reject: vi.fn(async () => true),
    markDuplicate: vi.fn(async () => true),
    addClaimed: vi.fn(async () => ({ ok: true as const, id: ID })),
    updateDetails: vi.fn(async () => true),
    setFeatured: vi.fn(async () => true),
    setPublic: vi.fn(async () => true),
    remove: vi.fn(async () => true),
    ...opts.store,
  }
  const profiles = { load: vi.fn(async () => ({ profile: { ...EMPTY_EDIT, orcid: opts.orcid ?? '0000-0002-1825-0097' }, status: 'draft', updatedAt: 1 })) } as unknown as ProfileStore
  const source: CandidateSource = { sample: true, fetch: vi.fn(async () => { if (opts.fail) throw new Error('down'); return opts.raw ?? [] }) }
  return { store, profiles, source, service: createPublicationService({ store, profiles, source, getAccount: async () => account, now: () => NOW }) }
}
const w = (over = {}) => ({ title: 'T', year: 2020, venue: 'V', doi: '', authors: ['A'], ...over })

describe('publication service', () => {
  it('no session: nothing happens and no source is called', async () => {
    const t = setup({ account: null })
    expect(await t.service.harvest()).toEqual({ ok: false, error: 'session' })
    expect(await t.service.claim(ID)).toEqual({ ok: false, error: 'session' })
    expect(await t.service.reject(ID)).toEqual({ ok: false, error: 'session' })
    expect(await t.service.markDuplicate(ID, OTHER)).toEqual({ ok: false, error: 'session' })
    expect(t.source.fetch).not.toHaveBeenCalled()
    expect(t.store.addCandidates).not.toHaveBeenCalled()
    expect(t.store.claim).not.toHaveBeenCalled()
  })

  it('harvest needs an ORCID iD in the saved profile and does not call the source without one', async () => {
    const t = setup({ orcid: '' })
    expect(await t.service.harvest()).toEqual({ ok: false, error: 'orcid' })
    expect(t.source.fetch).not.toHaveBeenCalled()
  })

  it('harvest stores only valid works under the session account and counts the rest', async () => {
    const t = setup({ raw: [w(), w({ title: '' }), 'junk', w({ title: 'U' })] })
    expect(await t.service.harvest()).toEqual({ ok: true, counts: { added: 2, alreadyKnown: 0, invalid: 2 } })
    expect(t.source.fetch).toHaveBeenCalledWith('0000-0002-1825-0097')
    const [acct, works, sample] = (t.store.addCandidates as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(acct).toBe('u1')
    expect(works).toHaveLength(2)
    expect(sample).toBe(true)
  })

  it('reports works the store already knew', async () => {
    const t = setup({ raw: [w(), w({ title: 'U' })], store: { addCandidates: vi.fn(async () => ({ added: 1, alreadyKnown: 1 })) } })
    expect(await t.service.harvest()).toEqual({ ok: true, counts: { added: 1, alreadyKnown: 1, invalid: 0 } })
  })

  it('a failing or malformed source gives a source error and stores nothing', async () => {
    const down = setup({ fail: true })
    expect(await down.service.harvest()).toEqual({ ok: false, error: 'source' })
    const bad = setup({ raw: 'nope' as unknown as unknown[] })
    expect(await bad.service.harvest()).toEqual({ ok: false, error: 'source' })
    expect(down.store.addCandidates).not.toHaveBeenCalled()
    expect(bad.store.addCandidates).not.toHaveBeenCalled()
  })

  it('decisions use the session account and refuse ids that are not uuids before touching the store', async () => {
    const t = setup()
    expect(await t.service.claim(ID)).toEqual({ ok: true })
    expect(await t.service.reject(ID)).toEqual({ ok: true })
    expect(await t.service.markDuplicate(ID, OTHER)).toEqual({ ok: true })
    expect(t.store.claim).toHaveBeenCalledWith('u1', ID)
    expect(t.store.reject).toHaveBeenCalledWith('u1', ID)
    expect(t.store.markDuplicate).toHaveBeenCalledWith('u1', ID, OTHER)
    for (const bad of ['', "x'; drop", 5, null, undefined]) {
      expect(await t.service.claim(bad)).toEqual({ ok: false, error: 'invalid' })
      expect(await t.service.reject(bad)).toEqual({ ok: false, error: 'invalid' })
      expect(await t.service.markDuplicate(bad, OTHER)).toEqual({ ok: false, error: 'invalid' })
      expect(await t.service.markDuplicate(ID, bad)).toEqual({ ok: false, error: 'invalid' })
    }
    expect(t.store.claim).toHaveBeenCalledTimes(1)
  })

  it('answers nothing when the store changed nothing', async () => {
    const t = setup({ store: { claim: vi.fn(async () => false), reject: vi.fn(async () => false), markDuplicate: vi.fn(async () => false) } })
    expect(await t.service.claim(ID)).toEqual({ ok: false, error: 'nothing' })
    expect(await t.service.reject(ID)).toEqual({ ok: false, error: 'nothing' })
    expect(await t.service.markDuplicate(ID, OTHER)).toEqual({ ok: false, error: 'nothing' })
  })
})

describe('publication service: intake, details, featured, export (FP-19)', () => {
  const ACC = { id: 'u1', email: 'a@example.invalid' }
  const form = (over: Record<string, unknown> = {}) => ({ workType: 'article', title: 'A title', authors: 'A. Person; B. Other', year: '2021', venue: 'A journal', doi: '', url: '', ...over })
  function make(opts: { account?: typeof ACC | null; lookup?: ((d: string) => Promise<unknown>) | null; store?: Partial<PublicationStore> } = {}) {
    const store: PublicationStore = {
      addCandidates: vi.fn(async (_a, w) => ({ added: w.length, alreadyKnown: 0 })),
      list: vi.fn(async () => ({ pending: [], claimed: [], rejected: [], duplicate: [] })),
      claim: vi.fn(async () => true),
      reject: vi.fn(async () => true),
      markDuplicate: vi.fn(async () => true),
      addClaimed: vi.fn(async () => ({ ok: true as const, id: ID })),
      updateDetails: vi.fn(async () => true),
      setFeatured: vi.fn(async () => true),
      setPublic: vi.fn(async () => true),
      remove: vi.fn(async () => true),
      ...opts.store,
    }
    const profiles = { load: vi.fn() } as unknown as ProfileStore
    const source: CandidateSource = { sample: true, fetch: vi.fn(async () => []) }
    const lookup = opts.lookup === undefined ? vi.fn(async () => ({ ok: true as const, record: { title: 'Found', year: 2020, venue: 'V', doi: 'https://doi.org/10.5555/F', authors: ['A'], workType: 'chapter', url: '' } })) : opts.lookup
    const account = opts.account === undefined ? ACC : opts.account
    return { store, lookup, service: createPublicationService({ store, profiles, source, lookup: lookup as never, getAccount: async () => account, now: () => NOW }) }
  }

  it('without a session every new action stops before touching the store or the network', async () => {
    const t = make({ account: null })
    const results = [await t.service.lookupDoi('10.5555/a'), await t.service.addWork(form(), 'manual'), await t.service.importFile('@a{k,}', 'a.bib'), await t.service.updateDetails(ID, { workType: 'book', url: '' }), await t.service.setFeatured(ID, true), await t.service.setPublic(ID, false), await t.service.remove(ID), await t.service.exportWorks('csv')]
    for (const r of results) expect(r).toEqual({ ok: false, error: 'session' })
    expect(t.lookup).not.toHaveBeenCalled()
    for (const fn of Object.values(t.store)) expect(fn).not.toHaveBeenCalled()
  })

  it('lookup: a bad DOI does not call the service; a good one returns a checked record and stores nothing', async () => {
    const t = make()
    expect(await t.service.lookupDoi('nonsense')).toEqual({ ok: false, error: 'invalid', field: 'doi' })
    expect(await t.service.lookupDoi(5)).toEqual({ ok: false, error: 'invalid', field: 'doi' })
    expect(t.lookup).not.toHaveBeenCalled()
    expect(await t.service.lookupDoi('10.5555/F')).toEqual({ ok: true, work: { title: 'Found', year: 2020, venue: 'V', doi: '10.5555/f', authors: ['A'], workType: 'chapter', url: '' } })
    expect(t.store.addClaimed).not.toHaveBeenCalled()
    expect(t.store.addCandidates).not.toHaveBeenCalled()
  })
  it('lookup: off, not found, unreachable and an incomplete record each give their own answer', async () => {
    expect(await make({ lookup: null }).service.lookupDoi('10.5555/a')).toEqual({ ok: false, error: 'off' })
    expect(await make({ lookup: async () => ({ ok: false, error: 'notfound' }) }).service.lookupDoi('10.5555/a')).toEqual({ ok: false, error: 'notfound' })
    expect(await make({ lookup: async () => ({ ok: false, error: 'source' }) }).service.lookupDoi('10.5555/a')).toEqual({ ok: false, error: 'source' })
    expect(await make({ lookup: async () => ({ ok: true, record: { title: '', year: 2020, venue: '', doi: '', authors: [] } }) }).service.lookupDoi('10.5555/a')).toEqual({ ok: false, error: 'incomplete' })
  })

  it('add: stores under the session account, claimed, with the way it arrived; a bad form names the field; a repeat says exists', async () => {
    const t = make()
    expect(await t.service.addWork(form({ doi: '10.5555/X', url: 'https://example.invalid/x' }), 'manual')).toEqual({ ok: true })
    expect(t.store.addClaimed).toHaveBeenCalledWith('u1', { title: 'A title', year: 2021, venue: 'A journal', doi: '10.5555/x', authors: ['A. Person', 'B. Other'], workType: 'article', url: 'https://example.invalid/x' }, 'manual')
    expect(await t.service.addWork(form({ year: 'x', authors: ' ' }), 'doi')).toEqual({ ok: false, error: 'invalid', field: 'authors', fields: ['authors', 'year'] })
    expect(await t.service.addWork(form(), 'harvest')).toEqual({ ok: false, error: 'invalid' })
    expect(await t.service.addWork(form(), undefined)).toEqual({ ok: false, error: 'invalid' })
    const dup = make({ store: { addClaimed: vi.fn(async () => ({ ok: false as const, reason: 'exists' as const })) } })
    expect(await dup.service.addWork(form(), 'manual')).toEqual({ ok: false, error: 'exists' })
  })

  it('import: valid records go to review as origin file and not sample; bad ones are counted; unreadable and huge files are refused', async () => {
    const t = make()
    const bib = '@article{a, author={A. B}, title={One}, year={2020}}\n@article{b, title={No year or author}}'
    expect(await t.service.importFile(bib, 'my.bib')).toEqual({ ok: true, counts: { added: 1, alreadyKnown: 0, invalid: 1 } })
    const [acct, works, sample, origin] = (t.store.addCandidates as ReturnType<typeof vi.fn>).mock.calls[0]
    expect([acct, works.length, sample, origin]).toEqual(['u1', 1, false, 'file'])
    expect(await t.service.importFile('hello', 'x.txt')).toEqual({ ok: false, error: 'format' })
    expect(await t.service.importFile('x'.repeat(200_001), 'x.bib')).toEqual({ ok: false, error: 'size' })
    expect(await t.service.importFile(undefined, undefined)).toEqual({ ok: false, error: 'format' })
  })
  it('import: says when it stopped at the record cap', async () => {
    const t = make()
    const many = Array.from({ length: 520 }, (_, i) => `@article{k${i}, author={A. B}, title={T ${i}}, year={2020}}`).join('\n')
    expect(await t.service.importFile(many, 'x.bib')).toMatchObject({ ok: true, truncated: true, counts: { added: 500 } })
  })

  it('details: type and link are checked; a bad link names the field', async () => {
    const t = make()
    expect(await t.service.updateDetails(ID, { workType: 'book', url: ' https://example.invalid/b ' })).toEqual({ ok: true })
    expect(t.store.updateDetails).toHaveBeenCalledWith('u1', ID, { workType: 'book', url: 'https://example.invalid/b' })
    expect(await t.service.updateDetails(ID, { workType: 'book', url: '' })).toEqual({ ok: true })
    expect(await t.service.updateDetails(ID, { workType: 'poster', url: '' })).toEqual({ ok: false, error: 'invalid', field: 'type' })
    expect(await t.service.updateDetails(ID, { workType: 'book', url: 'javascript:alert(1)' })).toEqual({ ok: false, error: 'invalid', field: 'url' })
    expect(await t.service.updateDetails('not-an-id', { workType: 'book', url: '' })).toEqual({ ok: false, error: 'invalid' })
    expect(await t.service.updateDetails(ID, null)).toEqual({ ok: false, error: 'invalid' })
    expect(await make({ store: { updateDetails: vi.fn(async () => false) } }).service.updateDetails(ID, { workType: 'book', url: '' })).toEqual({ ok: false, error: 'nothing' })
  })

  it('featured: needs a real id and a boolean; a refusal at five says limit, any other refusal says nothing', async () => {
    const t = make()
    expect(await t.service.setFeatured(ID, true)).toEqual({ ok: true })
    expect(await t.service.setFeatured('x', true)).toEqual({ ok: false, error: 'invalid' })
    expect(await t.service.setFeatured(ID, 'yes')).toEqual({ ok: false, error: 'invalid' })
    const claimed = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i === 0 ? OTHER : `00000000-0000-4000-8000-00000000000${i}`, featured: i > 0 }))
    const full = make({ store: { setFeatured: vi.fn(async () => false), list: vi.fn(async () => ({ pending: [], claimed: claimed(6), rejected: [], duplicate: [] }) as never) } })
    expect(await full.service.setFeatured(OTHER, true)).toEqual({ ok: false, error: 'limit' })
    expect(await full.service.setFeatured(ID, true)).toEqual({ ok: false, error: 'nothing' }) // not one of this account's claimed works
    expect(await full.service.setFeatured(OTHER, false)).toEqual({ ok: false, error: 'nothing' })
  })

  it('public flag and removal check their inputs and report a refusal', async () => {
    const t = make()
    expect(await t.service.setPublic(ID, false)).toEqual({ ok: true })
    expect(await t.service.setPublic(ID, 'no')).toEqual({ ok: false, error: 'invalid' })
    expect(await t.service.remove(ID)).toEqual({ ok: true })
    expect(await t.service.remove(5)).toEqual({ ok: false, error: 'invalid' })
    expect(await make({ store: { remove: vi.fn(async () => false) } }).service.remove(ID)).toEqual({ ok: false, error: 'nothing' })
  })

  it('export: only claimed works of the session account, only the four formats', async () => {
    const claimed = [{ id: ID, title: 'Mine', year: 2020, venue: '', doi: '', authors: ['A. B'], status: 'claimed', duplicateOf: null, sample: false, workType: 'article', origin: 'manual', url: '', featured: false, isPublic: false }]
    const t = make({ store: { list: vi.fn(async () => ({ pending: [{ ...claimed[0], title: 'Pending one' }], claimed, rejected: [], duplicate: [] }) as never) } })
    const r = await t.service.exportWorks('bibtex')
    expect(r).toMatchObject({ ok: true, filename: 'publications.bib' })
    expect((r as { text: string }).text).toContain('Mine')
    expect((r as { text: string }).text).not.toContain('Pending one')
    expect(t.store.list).toHaveBeenCalledWith('u1')
    expect(await t.service.exportWorks('pdf')).toEqual({ ok: false, error: 'invalid' })
    expect(await t.service.exportWorks(undefined)).toEqual({ ok: false, error: 'invalid' })
  })
})
