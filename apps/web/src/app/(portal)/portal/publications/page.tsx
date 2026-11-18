import { COPY } from '@/modules/portal/copy'
import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import { createSampleProfileStore } from '@/modules/portal/profile/sampleStore'
import { createPgPublicationStore } from '@/modules/portal/publications/pgStore'
import PublicationsView from '@/modules/portal/publications/PublicationsView'
import { sampleSource } from '@/modules/portal/publications/sampleSource'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.publications.title }

export default async function PublicationsPage() {
  const { userId, email } = await requirePortalPage('/portal/publications')
  const config = readPortalConfig(process.env)
  if (!config.enabled || !userId || !email) return null
  const pool = getIdentityPool(config.databaseUrl)
  const [lists, loaded] = await Promise.all([createPgPublicationStore(pool).list(userId), createSampleProfileStore(pool).load({ id: userId, email })])
  const sampleMode = sampleSource.sample || Object.values(lists).some((l) => l.some((w) => w.sample))
  return (
    <Shell email={email} wide>
      <h1>
        {COPY.publications.title}{' '}
        {sampleMode ? <span className="portal-sample">{COPY.publications.sampleBadge}</span> : null}
      </h1>
      <PublicationsView lists={lists} hasOrcid={loaded.profile.orcid !== ''} sampleMode={sampleMode} />
    </Shell>
  )
}
