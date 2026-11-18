import { COPY } from '@/modules/portal/copy'
import { requirePortalPage } from '@/modules/portal/server'
import SecurityPanel from '@/modules/portal/SecurityPanel'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.security.title }

export default async function SecurityPage() {
  const { email, factors, fresh } = await requirePortalPage('/portal/security')
  return (
    <Shell email={email}>
      <h1>{COPY.security.title}</h1>
      <p>{COPY.security.intro}</p>
      <SecurityPanel hasPasskey={(factors?.passkeys ?? 0) > 0} fresh={fresh} totpVerified={factors?.totpVerified ?? false} recoveryCodesRemaining={factors?.recoveryCodesRemaining ?? 0} />
    </Shell>
  )
}
