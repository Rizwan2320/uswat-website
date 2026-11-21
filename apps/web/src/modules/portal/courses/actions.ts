'use server'
/** Server actions for the courses screen: the full page guard runs inside each, and the account comes from the session only. */
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { accountFor } from '../delegation/wiring'
import { createPgCourseStore } from './pgStore'
import { createCourseService, type CourseResult } from './service'

const PATH = '/portal/courses'

function service(action: string, forId?: unknown) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createCourseService({ store: createPgCourseStore(getIdentityPool(config.databaseUrl)), getAccount: () => accountFor(PATH, 'courses', action, forId) })
}

export async function addCourse(input: unknown, forId?: unknown): Promise<CourseResult> {
  return service('addCourse', forId).add(input)
}
export async function removeCourse(courseId: unknown, forId?: unknown): Promise<CourseResult> {
  return service('removeCourse', forId).remove(courseId)
}
