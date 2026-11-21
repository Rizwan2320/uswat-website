import { notFound, redirect } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import CadenceForm from '@/modules/portal/notifications/CadenceForm'
import { notificationService } from '@/modules/portal/notifications/wiring'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.notifications.title }

const C = COPY.notifications

export default async function NotificationsPage() {
  const { email } = await requirePortalPage('/portal/notifications')
  const r = await notificationService('/portal/notifications').overview()
  if (!r.ok) {
    if (r.error === 'session') redirect('/portal/sign-in?reason=expired')
    notFound()
  }
  const { cadence, waiting, log } = r.value
  const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
  return (
    <Shell email={email} wide>
      <h1>{C.title} <span className="portal-sample">{C.sampleBadge}</span></h1>
      <p>{C.intro}</p>
      <div className="portal-notice" role="note" data-testid="no-mail">{C.noMail}</div>
      <CadenceForm initial={cadence} />

      <h2>{C.waitingTitle}</h2>
      {waiting.length === 0 ? (
        <p data-testid="waiting-empty">{C.waitingNone}</p>
      ) : (
        <ul className="portal-rows" data-testid="waiting-list">
          {waiting.map((w) => <li key={w.kind}><p className="portal-row-name">{C.lineLabel(w.kind, w.count)}</p></li>)}
        </ul>
      )}

      <h2>{C.logTitle}</h2>
      {log.length === 0 ? (
        <p data-testid="log-empty">{C.logEmpty}</p>
      ) : (
        <ul className="portal-rows" data-testid="log-list">
          {log.map((e) => (
            <li key={e.id} data-class={e.class}>
              <p className="portal-row-name">{C.classes[e.class]}{e.cadence ? ` (${C.cadenceWord[e.cadence]})` : ''}</p>
              <p className="portal-row-meta"><time dateTime={new Date(e.at).toISOString()}>{when.format(new Date(e.at))} UTC</time></p>
              <ul className="portal-links">
                {e.lines.map((l, i) => <li key={i}>{C.lineLabel(l.kind, l.count)}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  )
}
