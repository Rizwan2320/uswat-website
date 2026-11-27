import { describe, expect, it, vi } from 'vitest'

import { validateActivation } from '@/modules/portal/activation/rules'
import { createActivationService } from '@/modules/portal/activation/service'
import type { ActivationOutcome, ActivationStore } from '@/modules/portal/activation/types'

const store = (outcome: ActivationOutcome = 'ok', head = true) => ({
  isHead: vi.fn(async () => head),
  listPending: vi.fn(async () => []),
  decide: vi.fn(async () => outcome),
}) satisfies ActivationStore
const svc = (s: ActivationStore, session: { id: string; fresh: boolean } | null = { id: 'head1', fresh: true }) => createActivationService({ store: s, getHead: async () => session, now: () => 7 })
const input = { subjectId: 'p1', decision: 'activated' }

describe('validateActivation', () => {
  it('accepts exactly a subject and a decision', () => {
    expect(validateActivation(input)).toEqual({ ok: true, value: input })
    expect(validateActivation({ subjectId: 'p1', decision: 'declined' }).ok).toBe(true)
  })
  it('refuses extra keys such as a head id, department or status, and bad values', () => {
    for (const k of ['reviewerId', 'headId', 'department', 'status', 'userId']) expect(validateActivation({ ...input, [k]: 'x' }).ok, k).toBe(false)
    for (const bad of [{ subjectId: '../x' }, { subjectId: '' }, { subjectId: 5 }, { decision: 'approved' }, { decision: 'ACTIVATED' }, { decision: undefined }]) expect(validateActivation({ ...input, ...bad }).ok).toBe(false)
    for (const v of [null, undefined, 'x', 3, [], [input]]) expect(validateActivation(v).ok).toBe(false)
  })
})

describe('activation service', () => {
  it('needs a session for everything and never reaches the store without one', async () => {
    const s = store()
    expect(await svc(s, null).list()).toEqual({ ok: false, error: 'session' })
    expect(await svc(s, null).decide(input)).toEqual({ ok: false, error: 'session' })
    expect(s.listPending).not.toHaveBeenCalled()
    expect(s.decide).not.toHaveBeenCalled()
  })
  it('answers a non-head with unavailable and does not list', async () => {
    const s = store('ok', false)
    expect(await svc(s).list()).toEqual({ ok: false, error: 'unavailable' })
    expect(s.listPending).not.toHaveBeenCalled()
  })
  it('validates, then asks for a fresh second factor, before writing anything', async () => {
    const s = store()
    expect(await svc(s).decide({ ...input, headId: 'x' })).toEqual({ ok: false, error: 'invalid' })
    expect(await svc(s, { id: 'head1', fresh: false }).decide(input)).toEqual({ ok: false, error: 'fresh' })
    expect(s.decide).not.toHaveBeenCalled()
  })
  it('passes the session head, never a request value, and maps the outcomes', async () => {
    const s = store()
    expect(await svc(s).decide(input)).toEqual({ ok: true, decision: 'activated' })
    expect(s.decide).toHaveBeenCalledWith('head1', input, 7)
    expect(await svc(store('forbidden')).decide(input)).toEqual({ ok: false, error: 'unavailable' })
    expect(await svc(store('stale')).decide(input)).toEqual({ ok: false, error: 'stale' })
  })
})
