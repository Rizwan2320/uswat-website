import { describe, expect, it } from 'vitest'

import { validateLeave } from '@/modules/portal/registrar/rules'

const ok = { subjectId: 'abcdefgh1234', outcome: 'former', source: 'Retirement order 45 of 20 Nov 2026', confirmed: true }

describe('the "Mark as left" input (FP-22)', () => {
  it('accepts the two outcomes and tidies the source note', () => {
    expect(validateLeave(ok)).toEqual({ ok: true, value: { subjectId: 'abcdefgh1234', outcome: 'former', source: 'Retirement order 45 of 20 Nov 2026' } })
    expect(validateLeave({ ...ok, outcome: 'emeritus', source: '  Order   7  ' })).toMatchObject({ ok: true, value: { outcome: 'emeritus', source: 'Order 7' } })
  })
  it('names the field that is wrong', () => {
    expect(validateLeave({ ...ok, outcome: '' })).toEqual({ ok: false, errors: { outcome: 'required' } })
    expect(validateLeave({ ...ok, outcome: 'fired' })).toEqual({ ok: false, errors: { outcome: 'invalid' } })
    expect(validateLeave({ ...ok, confirmed: 'true' })).toEqual({ ok: false, errors: { confirm: 'required' } })
    expect(validateLeave({ ...ok, source: 'abc' })).toEqual({ ok: false, errors: { source: 'tooShort' } })
    expect(validateLeave({ ...ok, source: '' })).toEqual({ ok: false, errors: { source: 'required' } })
    expect(validateLeave({ ...ok, source: 'bad‮text here' })).toEqual({ ok: false, errors: { source: 'invalid' } })
    expect(validateLeave({ ...ok, subjectId: '../x' })).toEqual({ ok: false, errors: { subject: 'invalid' } })
    expect(validateLeave(null)).toMatchObject({ ok: false })
  })
})
