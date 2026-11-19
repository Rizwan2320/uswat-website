import { COPY } from '@/modules/portal/copy'
import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import { createPgCourseStore } from '@/modules/portal/courses/pgStore'
import CoursesView from '@/modules/portal/courses/CoursesView'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.courses.title }

export default async function CoursesPage() {
  const { userId, email } = await requirePortalPage('/portal/courses')
  const config = readPortalConfig(process.env)
  if (!config.enabled || !userId || !email) return null
  const courses = await createPgCourseStore(getIdentityPool(config.databaseUrl)).list(userId)
  return (
    <Shell email={email} wide>
      <h1>
        {COPY.courses.title}{' '}
        <span className="portal-sample">{COPY.courses.sampleBadge}</span>
      </h1>
      <CoursesView courses={courses} sampleMode defaultYear={new Date().getUTCFullYear()} />
    </Shell>
  )
}
