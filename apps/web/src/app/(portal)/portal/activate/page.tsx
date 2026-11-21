import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import ActivateButtons from '@/modules/portal/activation/ActivateButtons'
import { activationService } from '@/modules/portal/activation/wiring'
import { COPY } from '@/modules/portal/copy'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.activate.title }

const C = COPY.activate

export default async function ActivatePage({ searchParams }: { searchParams: Promise<{ decided?: string }> }) {
  const { email, fresh } = await requirePortalPage('/portal/activate')
  const { decided } = await searchParams
  const r = await activationService('/portal/activate').list()
  if (!r.ok) {
    if (r.error === 'session') redirect('/portal/sign-in?reason=expired')
    notFound()
  }
  const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
  return (
    <Shell email={email} wide>
      <h1>{C.title} <span className="portal-sample">{C.sampleBadge}</span></h1>
      <p>{C.intro}</p>
      {decided === 'activated' || decided === 'declined' ? <div className="portal-notice" role="status" data-testid="activate-notice">{decided === 'activated' ? C.activated : C.declined}</div> : null}
      {fresh ? null : (
        <div className="portal-notice" role="note" data-testid="needs-fresh">{C.needFresh} <Link className="portal-link" href="/portal/security">{C.needFreshLink}</Link></div>
      )}
      {r.items.length === 0 ? (
        <p data-testid="activate-empty">{C.empty}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table" data-testid="pending-list">
            <thead><tr><th scope="col">{C.colPerson}</th><th scope="col">{C.colEmail}</th><th scope="col">{C.colWhen}</th><th scope="col"><span className="portal-sr-only">Decision</span></th></tr></thead>
            <tbody>
              {r.items.map((i) => (
                <tr key={i.subjectId}>
                  <th scope="row">{i.name}</th>
                  <td>{i.email}</td>
                  <td><time dateTime={new Date(i.claimedAt).toISOString()}>{when.format(new Date(i.claimedAt))} UTC</time></td>
                  <td><ActivateButtons subjectId={i.subjectId} name={i.name} fresh={fresh} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}
