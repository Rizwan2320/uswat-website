export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const
export type Season = (typeof SEASONS)[number]

/** A course the person teaches. `source` tells hand entries from an imported record (an uploaded file, loaded by the import step). */
export type CourseInput = { code: string; title: string; season: Season; year: number; programme: string }
export type Course = CourseInput & { id: string; source: 'manual' | 'import' }

export type AddOutcome = 'added' | 'duplicate' | 'limit'

export interface CourseStore {
  /** Newest semester first, then code. Only this account's courses. */
  list(accountId: string): Promise<Course[]>
  add(accountId: string, input: CourseInput): Promise<AddOutcome>
  /** Removes one hand-entered course of this account. Returns false when nothing was removed. */
  remove(accountId: string, courseId: string): Promise<boolean>
}
