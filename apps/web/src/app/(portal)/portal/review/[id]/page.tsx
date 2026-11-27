import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import DecisionForm from '@/modules/portal/review/DecisionForm'
import { compareEdits } from '@/modules/portal/review/rules'
import { reviewService } from '@/modules/portal/review/wiring'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.review.title }

const C = COPY.review
const VIS = COPY.profile.visibility as Record<string, string>

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { email, fresh } = await requirePortalPage('/portal/review')
  const r = await reviewService('/portal/review').open(id)
  if (!r.ok) {
    if (r.error === 'session') redirect('/portal/sign-in?reason=expired')
    notFound()
  }
  const d = r.detail
  const changes = compareEdits(d.before, d.after)
  const show = (field: string, v: string) => (field === 'emailVisibility' || field === 'photoVisibility' ? VIS[v] ?? v : v === '' ? null : v)
  return (
    <Shell email={email} wide>
      <h1>{d.name} {d.sample ? <span className="portal-sample">{C.sampleBadge}</span> : null}</h1>
      <p>{C.detailIntro}</p>
      <dl className="portal-fixed">
        <dt>{C.departmentLabel}</dt><dd>{d.department}</dd>
        <dt>{C.sentLabel}</dt><dd>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(d.submittedAt))} UTC</dd>
      </dl>
      <section aria-labelledby="compare-title">
        <h2 id="compare-title">{C.compareTitle}</h2>
        {d.before === null ? <p className="hint">{C.firstPublication}</p> : null}
        {changes.length === 0 ? (
          <p data-testid="no-changes">{C.noChanges}</p>
        ) : (
          <div className="portal-table-wrap">
            <table className="portal-table portal-compare" data-testid="compare">
              <thead><tr><th scope="col">{C.colField}</th><th scope="col">{C.colBefore}</th><th scope="col">{C.colAfter}</th></tr></thead>
              <tbody>
                {changes.map((c) => {
                  const ur = c.field === 'bioUr'
                  const cell = (v: string, none: string) => {
                    const t = show(c.field, v)
                    return t === null ? <span className="hint">{none}</span> : <span lang={ur ? 'ur' : undefined} dir={ur ? 'rtl' : undefined} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{t}</span>
                  }
                  return (
                    <tr key={c.field} data-field={c.field}>
                      <th scope="row">{C.fields[c.field] ?? c.field}</th>
                      <td data-col="before">{cell(c.before, d.before === null ? C.nothingPublished : C.emptyValue)}</td>
                      <td data-col="after">{cell(c.after, C.emptyValue)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <DecisionForm subjectId={d.subjectId} rev={d.rev} fresh={fresh} />
      <p><Link className="portal-link" href="/portal/review">{C.back}</Link></p>
    </Shell>
  )
}
