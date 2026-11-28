import { notFound } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import DelegationBanner from '@/modules/portal/delegation/Banner'
import { pageFor } from '@/modules/portal/delegation/wiring'
import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import PublicPagePanel from '@/modules/portal/bridge/PublicPagePanel'
import { readPublicPageStatus } from '@/modules/portal/bridge/wiring'
import { createSampleProfileStore } from '@/modules/portal/profile/sampleStore'
import { createPgPublicationStore } from '@/modules/portal/publications/pgStore'
import PublicationsView from '@/modules/portal/publications/PublicationsView'
import { resolveSource } from '@/modules/portal/publications/sources'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.publications.title }

export default async function PublicationsPage({ searchParams }: { searchParams: Promise<{ for?: string | string[] }> }) {
  const { userId, email } = await requirePortalPage('/portal/publications')
  const config = readPortalConfig(process.env)
  if (!config.enabled || !userId || !email) return null
  const { for: forParam } = await searchParams
  const delegated = forParam === undefined ? null : await pageFor('/portal/publications', 'publications', userId, forParam)
  if (forParam !== undefined && !delegated) notFound()
  const subject = delegated ? { id: delegated.subject.id, email: delegated.subject.email } : { id: userId, email }
  const pool = getIdentityPool(config.databaseUrl)
  const [lists, loaded, publicStatus] = await Promise.all([createPgPublicationStore(pool).list(subject.id), createSampleProfileStore(pool).load(subject), readPublicPageStatus(subject.id)])
  const sampleMode = resolveSource(process.env).sample || Object.values(lists).some((l) => l.some((w) => w.sample))
  return (
    <Shell email={email} wide>
      {delegated ? <DelegationBanner name={delegated.subject.name} expiresAt={delegated.expiresAt} backHref="/portal/delegation" /> : null}
      <h1>
        {COPY.publications.title}{' '}
        {sampleMode ? <span className="portal-sample">{COPY.publications.sampleBadge}</span> : null}
      </h1>
      <PublicPagePanel status={publicStatus} forId={delegated?.subject.id} />
      <PublicationsView lists={lists} hasOrcid={loaded.profile.orcid !== ''} sampleMode={sampleMode} forId={delegated?.subject.id} />
    </Shell>
  )
}
