import { COPY } from '@/modules/portal/copy'
import RecoverForm from '@/modules/portal/RecoverForm'
import { requirePortalPage } from '@/modules/portal/server'
import AuthShell from '@/modules/portal/AuthShell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.recover.title }

export default async function RecoverPage() {
  await requirePortalPage('/portal/recover')
  return (
    <AuthShell>
      <h1>{COPY.recover.title}</h1>
      <p>{COPY.recover.intro}</p>
      <RecoverForm />
    </AuthShell>
  )
}
