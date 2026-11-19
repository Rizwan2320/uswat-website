/** What the courses actions do, free of Next and PostgreSQL. The account comes from `getAccount` (the session) only. */
import { isCourseId, validateCourse, type CourseErrors } from './rules'
import type { CourseStore } from './types'

export type CourseResult =
  | { ok: true }
  | { ok: false; error: 'session' | 'invalid' | 'duplicate' | 'limit' | 'nothing'; errors?: CourseErrors }

export function createCourseService(deps: { store: CourseStore; getAccount: () => Promise<{ id: string; email: string } | null>; now?: () => number }) {
  const now = deps.now ?? Date.now
  return {
    async add(input: unknown): Promise<CourseResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      const v = validateCourse(input, now())
      if (!v.ok) return { ok: false, error: 'invalid', errors: v.errors }
      const outcome = await deps.store.add(account.id, v.course)
      return outcome === 'added' ? { ok: true } : { ok: false, error: outcome }
    },
    async remove(courseId: unknown): Promise<CourseResult> {
      const account = await deps.getAccount()
      if (!account) return { ok: false, error: 'session' }
      if (!isCourseId(courseId)) return { ok: false, error: 'invalid' }
      return (await deps.store.remove(account.id, courseId)) ? { ok: true } : { ok: false, error: 'nothing' }
    },
  }
}
