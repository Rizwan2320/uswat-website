import Link from 'next/link'

import { COPY } from '@/modules/portal/copy'
import { isHeadAccount } from '@/modules/portal/activation/wiring'
import { isReviewerAccount } from '@/modules/portal/review/wiring'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.home.title }

export default async function PortalHome() {
  const { email, userId } = await requirePortalPage('/portal')
  const reviewer = userId ? await isReviewerAccount(userId) : false
  const head = userId ? await isHeadAccount(userId) : false
  return (
    <Shell email={email}>
      <h1>{COPY.home.title}</h1>
      <p>{COPY.home.intro}</p>
      <p>{COPY.home.signedInAs} <strong>{email}</strong>.</p>
      <p><Link className="portal-link" href="/portal/profile">{COPY.home.profileLink}</Link></p>
      <p><Link className="portal-link" href="/portal/publications">{COPY.home.publicationsLink}</Link></p>
      <p><Link className="portal-link" href="/portal/courses">{COPY.home.coursesLink}</Link></p>
      <p><Link className="portal-link" href="/portal/cv">{COPY.home.cvLink}</Link></p>
      <p><Link className="portal-link" href="/portal/delegation">{COPY.home.delegationLink}</Link></p>
      {head ? <p><Link className="portal-link" href="/portal/activate">{COPY.home.activateLink}</Link></p> : null}
      {reviewer ? <p><Link className="portal-link" href="/portal/review">{COPY.home.reviewLink}</Link></p> : null}
      <p><Link className="portal-link" href="/portal/security">{COPY.home.securityLink}</Link></p>
    </Shell>
  )
}
