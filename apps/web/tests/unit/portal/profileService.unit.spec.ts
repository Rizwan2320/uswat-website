import { describe, expect, it, vi } from 'vitest'

import { createProfileService } from '@/modules/portal/profile/service'
import { EMPTY_EDIT } from '@/modules/portal/profile/sampleStore'
import type { ProfileStore } from '@/modules/portal/profile/types'

function setup(account: { id: string; email: string } | null = { id: 'u1', email: 'a@example.invalid' }, store: Partial<ProfileStore> = {}) {
  const full: ProfileStore = {
    load: vi.fn(),
    saveDraft: vi.fn(async () => true),
    submit: vi.fn(async () => true),
    withdraw: vi.fn(async () => true),
    ...store,
  }
  return { full, service: createProfileService({ store: full, getAccount: async () => account }) }
}

describe('profile service', () => {
  it('no session: every action refuses and the store is never touched', async () => {
    const { full, service } = setup(null)
    expect(await service.save(EMPTY_EDIT)).toEqual({ ok: false, error: 'session' })
    expect(await service.submit()).toEqual({ ok: false, error: 'session' })
    expect(await service.withdraw()).toEqual({ ok: false, error: 'session' })
    expect(full.saveDraft).not.toHaveBeenCalled()
    expect(full.submit).not.toHaveBeenCalled()
    expect(full.withdraw).not.toHaveBeenCalled()
  })

  it('saves under the session account, whatever id the request carries', async () => {
    const { full, service } = setup()
    expect(await service.save({ ...EMPTY_EDIT })).toEqual({ ok: true })
    expect(full.saveDraft).toHaveBeenCalledWith('u1', EMPTY_EDIT)
    // An id (or any extra key) in the request is refused, not used.
    const r = await service.save({ ...EMPTY_EDIT, userId: 'u2' })
    expect(r).toEqual({ ok: false, error: 'invalid', errors: { userId: 'unknown' } })
    expect(full.saveDraft).toHaveBeenCalledTimes(1)
  })

  it('refuses a high-impact key and does not save', async () => {
    const { full, service } = setup()
    expect(await service.save({ ...EMPTY_EDIT, designation: 'x' })).toEqual({ ok: false, error: 'invalid', errors: { designation: 'read-only' } })
    expect(full.saveDraft).not.toHaveBeenCalled()
  })

  it('says locked when the store refuses an edit after submit, and nothing when there is nothing to submit or withdraw', async () => {
    const { service } = setup(undefined, { saveDraft: vi.fn(async () => false), submit: vi.fn(async () => false), withdraw: vi.fn(async () => false) })
    expect(await service.save(EMPTY_EDIT)).toEqual({ ok: false, error: 'locked' })
    expect(await service.submit()).toEqual({ ok: false, error: 'nothing' })
    expect(await service.withdraw()).toEqual({ ok: false, error: 'nothing' })
  })

  it('submit and withdraw act on the session account', async () => {
    const { full, service } = setup()
    expect(await service.submit()).toEqual({ ok: true })
    expect(await service.withdraw()).toEqual({ ok: true })
    expect(full.submit).toHaveBeenCalledWith('u1')
    expect(full.withdraw).toHaveBeenCalledWith('u1')
  })
})
