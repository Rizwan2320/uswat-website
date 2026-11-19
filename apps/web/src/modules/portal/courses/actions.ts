'use server'
/** Server actions for the courses screen: the full page guard runs inside each, and the account comes from the session only. */
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { strongAccount } from '../server'
import { createPgCourseStore } from './pgStore'
import { createCourseService, type CourseResult } from './service'

const PATH = '/portal/courses'

function service() {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createCourseService({ store: createPgCourseStore(getIdentityPool(config.databaseUrl)), getAccount: () => strongAccount(PATH) })
}

export async function addCourse(input: unknown): Promise<CourseResult> {
  return service().add(input)
}
export async function removeCourse(courseId: unknown): Promise<CourseResult> {
  return service().remove(courseId)
}
