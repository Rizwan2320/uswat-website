import { notFound } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import DelegationBanner from '@/modules/portal/delegation/Banner'
import { pageFor } from '@/modules/portal/delegation/wiring'
import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import { createPgCourseStore } from '@/modules/portal/courses/pgStore'
import CoursesView from '@/modules/portal/courses/CoursesView'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.courses.title }

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ for?: string | string[] }> }) {
  const { userId, email } = await requirePortalPage('/portal/courses')
  const config = readPortalConfig(process.env)
  if (!config.enabled || !userId || !email) return null
  const { for: forParam } = await searchParams
  const delegated = forParam === undefined ? null : await pageFor('/portal/courses', 'courses', userId, forParam)
  if (forParam !== undefined && !delegated) notFound()
  const courses = await createPgCourseStore(getIdentityPool(config.databaseUrl)).list(delegated ? delegated.subject.id : userId)
  return (
    <Shell email={email} wide>
      {delegated ? <DelegationBanner name={delegated.subject.name} expiresAt={delegated.expiresAt} backHref="/portal/delegation" /> : null}
      <h1>
        {COPY.courses.title}{' '}
        <span className="portal-sample">{COPY.courses.sampleBadge}</span>
      </h1>
      <CoursesView courses={courses} sampleMode defaultYear={new Date().getUTCFullYear()} forId={delegated?.subject.id} />
    </Shell>
  )
}
