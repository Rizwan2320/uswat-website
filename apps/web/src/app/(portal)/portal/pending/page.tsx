import { redirect } from 'next/navigation'

import { createPgStatusStore } from '@/modules/identity/accountStatus'
import { readPortalConfig } from '@/modules/identity/config'
import { getIdentityPool } from '@/modules/identity/db'
import { COPY } from '@/modules/portal/copy'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.pending.title }

export default async function PendingPage() {
  const { userId, email } = await requirePortalPage('/portal/pending')
  const config = readPortalConfig(process.env)
  if (config.enabled && userId && (await createPgStatusStore(getIdentityPool(config.databaseUrl)).get(userId)) === 'active') redirect('/portal')
  return (
    <Shell email={email} pending>
      <h1>{COPY.pending.title}</h1>
      <p data-testid="pending-body">{COPY.pending.body}</p>
      <p>{COPY.pending.later}</p>
    </Shell>
  )
}
