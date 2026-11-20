import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import { createPgEventStore } from '@/modules/identity/securityEvents'
import { COPY } from '@/modules/portal/copy'
import { requirePortalPage } from '@/modules/portal/server'
import SecurityPanel from '@/modules/portal/SecurityPanel'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.security.title }

export default async function SecurityPage() {
  const { email, factors, fresh, userId } = await requirePortalPage('/portal/security')
  const config = readPortalConfig(process.env)
  // Newest first, this account only, at most 50 (FP-51). A read failure leaves the list empty rather than breaking the page.
  const events =
    config.enabled && userId
      ? await createPgEventStore(getIdentityPool(config.databaseUrl)).recent(userId).catch(() => [])
      : []
  return (
    <Shell email={email}>
      <h1>{COPY.security.title}</h1>
      <p>{COPY.security.intro}</p>
      <SecurityPanel hasPasskey={(factors?.passkeys ?? 0) > 0} fresh={fresh} totpVerified={factors?.totpVerified ?? false} recoveryCodesRemaining={factors?.recoveryCodesRemaining ?? 0} events={events.map((e) => ({ id: e.id, type: e.type, outcome: e.outcome, ipPrefix: e.ipPrefix, at: e.at.toISOString() }))} />
    </Shell>
  )
}
