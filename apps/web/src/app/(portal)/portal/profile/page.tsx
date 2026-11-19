import { COPY } from '@/modules/portal/copy'
import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import ProfileEditor from '@/modules/portal/profile/ProfileEditor'
import { createSampleProfileStore } from '@/modules/portal/profile/sampleStore'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.profile.title }

export default async function ProfilePage() {
  const { userId, email } = await requirePortalPage('/portal/profile')
  const config = readPortalConfig(process.env)
  // The guard has already answered 404 for a dark portal and redirected anyone without a strong session.
  if (!config.enabled || !userId || !email) return null
  const loaded = await createSampleProfileStore(getIdentityPool(config.databaseUrl)).load({ id: userId, email })
  return (
    <Shell email={email} wide>
      <h1>
        {COPY.profile.title}{' '}
        {loaded.profile.sample ? <span className="portal-sample">{COPY.profile.sampleBadge}</span> : null}
      </h1>
      <ProfileEditor initial={loaded} />
    </Shell>
  )
}
