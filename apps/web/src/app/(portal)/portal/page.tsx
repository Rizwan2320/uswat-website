import Link from 'next/link'

import { COPY } from '@/modules/portal/copy'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.home.title }

export default async function PortalHome() {
  const { email } = await requirePortalPage('/portal')
  return (
    <Shell email={email}>
      <h1>{COPY.home.title}</h1>
      <p>{COPY.home.intro}</p>
      <p>{COPY.home.signedInAs} <strong>{email}</strong>.</p>
      <p><Link className="portal-link" href="/portal/security">{COPY.home.securityLink}</Link></p>
    </Shell>
  )
}
