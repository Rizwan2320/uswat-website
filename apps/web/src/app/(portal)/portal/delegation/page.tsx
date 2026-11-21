import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { COPY } from '@/modules/portal/copy'
import DelegationForm from '@/modules/portal/delegation/DelegationForm'
import RevokeButton from '@/modules/portal/delegation/RevokeButton'
import { delegationService } from '@/modules/portal/delegation/wiring'
import { requirePortalPage } from '@/modules/portal/server'
import Shell from '@/modules/portal/Shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: COPY.delegation.title }

const C = COPY.delegation
const SECTION_PATH = { profile: 'profile', publications: 'publications', courses: 'courses' } as const

export default async function DelegationPage() {
  const { email, fresh } = await requirePortalPage('/portal/delegation')
  const r = await delegationService('/portal/delegation').overview()
  if (!r.ok) {
    if (r.error === 'session') redirect('/portal/sign-in?reason=expired')
    notFound()
  }
  const { given, received, audit } = r.value
  const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
  const list = (sections: readonly (keyof typeof SECTION_PATH)[]) => sections.map((s) => C.sections[s]).join(', ')
  return (
    <Shell email={email} wide>
      <h1>{C.title} <span className="portal-sample">{C.sampleBadge}</span></h1>
      <p>{C.intro}</p>
      <DelegationForm fresh={fresh} />

      <h2>{C.givenTitle}</h2>
      {given.length === 0 ? (
        <p data-testid="given-empty">{C.givenEmpty}</p>
      ) : (
        <ul className="portal-rows" data-testid="given-list">
          {given.map((g) => (
            <li key={g.id} data-state={g.state}>
              <p className="portal-row-name">{g.delegateName}</p>
              <dl className="portal-row-meta">
                <dt>{C.colEmail}</dt><dd>{g.delegateEmail}</dd>
                <dt>{C.sectionsLegend}</dt><dd>{list(g.sections)}</dd>
                <dt>{C.until}</dt><dd><time dateTime={new Date(g.expiresAt).toISOString()}>{when.format(new Date(g.expiresAt))} UTC</time></dd>
                <dt>{C.colStatus}</dt><dd data-testid="grant-state">{C.states[g.state]}</dd>
              </dl>
              {g.state === 'active' ? <RevokeButton id={g.id} name={g.delegateName} /> : null}
            </li>
          ))}
        </ul>
      )}

      <h2>{C.receivedTitle}</h2>
      {received.length === 0 ? (
        <p data-testid="received-empty">{C.receivedEmpty}</p>
      ) : (
        <ul className="portal-rows" data-testid="received-list">
          {received.map((g) => (
            <li key={g.id}>
              <p className="portal-row-name">{g.grantorName}</p>
              <dl className="portal-row-meta">
                <dt>{C.until}</dt><dd><time dateTime={new Date(g.expiresAt).toISOString()}>{when.format(new Date(g.expiresAt))} UTC</time></dd>
              </dl>
              <ul className="portal-links">
                {g.sections.map((s) => (
                  <li key={s}><Link className="portal-link" href={`/portal/${SECTION_PATH[s]}?for=${g.grantorId}`}>{C.edit(g.grantorName, C.sections[s])}</Link></li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <h2>{C.activityTitle}</h2>
      {audit.length === 0 ? (
        <p data-testid="activity-empty">{C.activityEmpty}</p>
      ) : (
        <ul className="portal-rows" data-testid="activity-list">
          {audit.map((a, i) => (
            <li key={i}>
              <p className="portal-row-name">{C.activityLine(a.actorName ?? C.unknownActor, C.sections[a.section], a.action)}</p>
              <p className="portal-row-meta"><time dateTime={new Date(a.at).toISOString()}>{when.format(new Date(a.at))} UTC</time></p>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  )
}
