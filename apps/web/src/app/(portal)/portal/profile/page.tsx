import { notFound } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import DelegationBanner from '@/modules/portal/delegation/Banner'
import { pageFor } from '@/modules/portal/delegation/wiring'
import ProfileEditor from '@/modules/portal/profile/ProfileEditor'
import { createSampleProfileStore } from '@/modules/portal/profile/sampleStore'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.profile.title }

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ for?: string | string[] }> }) {
  const { userId, email } = await requirePortalPage('/portal/profile')
  const config = readPortalConfig(process.env)
  // The guard has already answered 404 for a dark portal and redirected anyone without a strong session.
  if (!config.enabled || !userId || !email) return null
  const { for: forParam } = await searchParams
  // `?for=` is a delegate editing the grantor's draft. A bad, expired, revoked or out-of-scope grant is a 404, never an explanation.
  const delegated = forParam === undefined ? null : await pageFor('/portal/profile', 'profile', userId, forParam)
  if (forParam !== undefined && !delegated) notFound()
  const subject = delegated ? { id: delegated.subject.id, email: delegated.subject.email } : { id: userId, email }
  const loaded = await createSampleProfileStore(getIdentityPool(config.databaseUrl)).load(subject)
  return (
    <Shell email={email} wide>
      {delegated ? <DelegationBanner name={delegated.subject.name} expiresAt={delegated.expiresAt} backHref="/portal/delegation" /> : null}
      <h1>
        {COPY.profile.title}{' '}
        {loaded.profile.sample ? <span className="portal-sample">{COPY.profile.sampleBadge}</span> : null}
      </h1>
      <ProfileEditor initial={loaded} forId={delegated?.subject.id} />
    </Shell>
  )
}
