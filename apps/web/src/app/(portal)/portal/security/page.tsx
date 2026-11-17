import { COPY } from '@/modules/portal/copy'
import { requirePortalPage } from '@/modules/portal/server'
import SecurityPanel from '@/modules/portal/SecurityPanel'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.security.title }

export default async function SecurityPage() {
  const { email, factors } = await requirePortalPage('/portal/security')
  return (
    <Shell email={email}>
      <h1>{COPY.security.title}</h1>
      <p>{COPY.security.intro}</p>
      <SecurityPanel totpVerified={factors?.totpVerified ?? false} recoveryCodesRemaining={factors?.recoveryCodesRemaining ?? 0} />
    </Shell>
  )
}
