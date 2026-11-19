import { describe, expect, it, vi } from 'vitest'

import { LIMITS, isCourseId, validateCourse } from '../../../src/modules/portal/courses/rules'
import { createCourseService } from '../../../src/modules/portal/courses/service'
import type { CourseStore } from '../../../src/modules/portal/courses/types'

const NOW = Date.UTC(2026, 10, 19)
const good = (over: Record<string, unknown> = {}) => ({ code: 'sam 101', title: 'Sample Course', season: 'Fall', year: 2026, programme: 'Sample Programme', ...over })

describe('validateCourse', () => {
  it('accepts a good course, upper-cases the code and tidies spaces', () => {
    expect(validateCourse(good({ code: ' sam  101 ', title: '  Sample   Course ' }), NOW)).toEqual({ ok: true, course: { code: 'SAM 101', title: 'Sample Course', season: 'Fall', year: 2026, programme: 'Sample Programme' } })
  })
  it('keeps an Urdu title intact and counts characters, not bytes', () => {
    const r = validateCourse(good({ title: 'نمونہ کورس' }), NOW)
    expect(r.ok && r.course.title).toBe('نمونہ کورس')
    expect(validateCourse(good({ title: '𐴀'.repeat(LIMITS.title) }), NOW).ok).toBe(true)
    expect(validateCourse(good({ title: '𐴀'.repeat(LIMITS.title + 1) }), NOW)).toEqual({ ok: false, errors: { title: 'too-long' } })
  })
  it('allows an empty programme but not an empty title', () => {
    expect(validateCourse(good({ programme: '' }), NOW).ok).toBe(true)
    expect(validateCourse(good({ title: '  ' }), NOW)).toEqual({ ok: false, errors: { title: 'invalid' } })
  })
  it('checks the course code: length, characters, first character', () => {
    for (const bad of ['', 'A', 'x'.repeat(LIMITS.code + 1), '-AB', 'AB;DROP', 'AB<1>', 5, null]) expect(validateCourse(good({ code: bad }), NOW), String(bad)).toEqual({ ok: false, errors: { code: 'invalid' } })
    expect(validateCourse(good({ code: 'AB' }), NOW).ok).toBe(true)
    expect(validateCourse(good({ code: 'x'.repeat(LIMITS.code) }), NOW).ok).toBe(true)
    expect(validateCourse(good({ code: 'CS-101 A' }), NOW).ok).toBe(true)
  })
  it('checks the semester: a listed season and a whole year in range', () => {
    expect(validateCourse(good({ season: 'Autumn' }), NOW)).toEqual({ ok: false, errors: { semester: 'invalid' } })
    expect(validateCourse(good({ year: 1999 }), NOW).ok).toBe(false)
    expect(validateCourse(good({ year: 2028 }), NOW).ok).toBe(true)
    expect(validateCourse(good({ year: 2029 }), NOW).ok).toBe(false)
    expect(validateCourse(good({ year: 2026.5 }), NOW).ok).toBe(false)
    expect(validateCourse(good({ year: '2026' }), NOW).ok).toBe(false)
  })
  it('refuses other keys and non-objects', () => {
    expect(validateCourse(good({ userId: 'u2' }), NOW)).toEqual({ ok: false, errors: { form: 'unknown' } })
    expect(validateCourse(good({ source: 'odoo' }), NOW)).toEqual({ ok: false, errors: { form: 'unknown' } })
    for (const v of [null, 'x', 3, [], undefined]) expect(validateCourse(v, NOW).ok).toBe(false)
  })
  it('strips control and direction-override characters', () => {
    const r = validateCourse(good({ title: 'A\u0000B‮C' }), NOW)
    expect(r.ok && r.course.title).toBe('A B C')
  })
})

describe('isCourseId', () => {
  it('accepts a uuid only', () => {
    expect(isCourseId('0b5e2b0e-6c47-4b0e-9a54-1f3a7c0c2d11')).toBe(true)
    for (const bad of ['', 'x', null, 5, "0b5e2b0e-6c47-4b0e-9a54-1f3a7c0c2d1'; drop"]) expect(isCourseId(bad)).toBe(false)
  })
})

describe('course service', () => {
  const ID = '0b5e2b0e-6c47-4b0e-9a54-1f3a7c0c2d11'
  const setup = (account: { id: string; email: string } | null = { id: 'u1', email: 'a@example.invalid' }, store: Partial<CourseStore> = {}) => {
    const s: CourseStore = { list: vi.fn(), add: vi.fn(async () => 'added' as const), remove: vi.fn(async () => true), ...store }
    return { s, service: createCourseService({ store: s, getAccount: async () => account, now: () => NOW }) }
  }
  it('no session: nothing reaches the store, even for invalid input', async () => {
    const { s, service } = setup(null)
    expect(await service.add(good())).toEqual({ ok: false, error: 'session' })
    expect(await service.add({ junk: 1 })).toEqual({ ok: false, error: 'session' })
    expect(await service.remove(ID)).toEqual({ ok: false, error: 'session' })
    expect(s.add).not.toHaveBeenCalled()
    expect(s.remove).not.toHaveBeenCalled()
  })
  it('adds under the session account; invalid input never reaches the store', async () => {
    const { s, service } = setup()
    expect(await service.add(good())).toEqual({ ok: true })
    expect(s.add).toHaveBeenCalledWith('u1', expect.objectContaining({ code: 'SAM 101' }))
    expect(await service.add(good({ userId: 'u2' }))).toEqual({ ok: false, error: 'invalid', errors: { form: 'unknown' } })
    expect(s.add).toHaveBeenCalledTimes(1)
  })
  it('passes on the duplicate and limit answers', async () => {
    expect(await setup(undefined, { add: vi.fn(async () => 'duplicate' as const) }).service.add(good())).toEqual({ ok: false, error: 'duplicate' })
    expect(await setup(undefined, { add: vi.fn(async () => 'limit' as const) }).service.add(good())).toEqual({ ok: false, error: 'limit' })
  })
  it('remove checks the id shape first and uses the session account', async () => {
    const { s, service } = setup()
    expect(await service.remove("x'; drop")).toEqual({ ok: false, error: 'invalid' })
    expect(s.remove).not.toHaveBeenCalled()
    expect(await service.remove(ID)).toEqual({ ok: true })
    expect(s.remove).toHaveBeenCalledWith('u1', ID)
    expect(await setup(undefined, { remove: vi.fn(async () => false) }).service.remove(ID)).toEqual({ ok: false, error: 'nothing' })
  })
})
