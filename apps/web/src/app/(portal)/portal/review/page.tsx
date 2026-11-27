import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import { reviewService } from '@/modules/portal/review/wiring'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.review.title }

const C = COPY.review

export default async function ReviewQueuePage({ searchParams }: { searchParams: Promise<{ decided?: string }> }) {
  const { email } = await requirePortalPage('/portal/review')
  const { decided } = await searchParams
  const r = await reviewService('/portal/review').list()
  if (!r.ok) {
    // Not a reviewer looks the same as a page that does not exist.
    if (r.error === 'session') redirect('/portal/sign-in?reason=expired')
    notFound()
  }
  const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
  return (
    <Shell email={email} wide>
      <h1>{C.title} <span className="portal-sample">{C.sampleBadge}</span></h1>
      <p>{C.intro}</p>
      {decided === 'approved' || decided === 'changes' ? (
        <div className="portal-notice" role="status" data-testid="decided-notice">{decided === 'approved' ? C.decidedApproved : C.decidedChanges}</div>
      ) : null}
      {r.items.length === 0 ? (
        <p data-testid="queue-empty">{C.empty}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table" data-testid="queue">
            <thead>
              <tr><th scope="col">{C.colPerson}</th><th scope="col">{C.colSent}</th><th scope="col">{C.colChanges}</th><th scope="col"><span className="portal-sr-only">{C.open}</span></th></tr>
            </thead>
            <tbody>
              {r.items.map((i) => (
                <tr key={i.subjectId}>
                  <th scope="row">{i.name}</th>
                  <td><time dateTime={new Date(i.submittedAt).toISOString()}>{when.format(new Date(i.submittedAt))} UTC</time></td>
                  <td>{i.firstPublication ? C.firstTime : C.changesCount(i.changes)}</td>
                  <td><Link className="portal-link" href={`/portal/review/${i.subjectId}`} aria-label={`${C.open}: ${i.name}`}>{C.open}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  )
}
