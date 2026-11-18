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
