import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import RegistrarForm from '@/modules/portal/registrar/RegistrarForm'
import { registrarService } from '@/modules/portal/registrar/wiring'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.registrar.title }

const C = COPY.registrar

export default async function RegistrarPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { email, fresh } = await requirePortalPage('/portal/registrar')
  const r = await registrarService('/portal/registrar').open(id)
  if (!r.ok) {
    if (r.error === 'session') redirect('/portal/sign-in?reason=expired')
    notFound()
  }
  const d = r.detail
  const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
  return (
    <Shell email={email} wide>
      <p><Link className="portal-link" href="/portal/registrar">{C.back}</Link></p>
      <h1>{d.name} <span className="portal-sample">{C.sampleBadge}</span></h1>
      <p>{C.detailIntro}</p>
      <p className="hint">{d.email}</p>
      <RegistrarForm subjectId={d.subjectId} fresh={fresh} holdsRole={d.holdsRole} initial={d.current ?? { designationEn: '', designationUr: null, nameUr: null, department: '' }} />
      <section aria-labelledby="history-title">
        <h2 id="history-title">{C.historyTitle}</h2>
        {d.history.length === 0 ? (
          <p data-testid="history-none">{C.historyNone}</p>
        ) : (
          <ul className="portal-rows" data-testid="history">
            {d.history.map((h) => (
              <li key={h.at}>
                <time dateTime={new Date(h.at).toISOString()}>{when.format(new Date(h.at))} UTC</time>: {h.fields.map((f) => C.fieldNames[f] ?? f).join(', ')}. <span className="hint">{h.source}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  )
}
