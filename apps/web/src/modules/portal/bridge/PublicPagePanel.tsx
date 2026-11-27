'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { COPY } from '../copy'
import { updatePublicPage } from '../publications/actions'
import type { PublicPageStatus } from './wiring'

const C = COPY.publications.publicPage

export default function PublicPagePanel({ status, forId }: { status: PublicPageStatus; forId?: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ text: string; bad: boolean } | null>(null)
  const when = status.lastOkAt ? new Date(status.lastOkAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : null
  const press = () =>
    start(async () => {
      const r = await updatePublicPage(forId)
      if (r.ok) setMessage({ text: r.status === 'sent' ? C.sent : C.unchanged, bad: false })
      else setMessage({ text: r.error === 'off' ? C.off : r.error === 'not-linked' ? C.notLinked : C.failed, bad: true })
      router.refresh()
    })
  const resting = !status.configured ? C.off : !status.linked ? C.notLinked : status.failed ? C.waiting : when ? null : C.never
  return (
    <section className="pub-public" aria-labelledby="pub-public-h" data-testid="pub-public-page">
      <h2 id="pub-public-h">{C.title}</h2>
      <p>{C.intro}</p>
      <p role="status" data-testid="pub-public-status" className={message?.bad || (!message && status.failed) ? 'portal-error' : undefined}>
        {message ? message.text : resting}
        {!message && !resting && when ? `${C.sentAt}: ${when}.` : null}
      </p>
      <div className="pub-actions">
        <button type="button" className="portal-btn" disabled={pending || !status.configured || !status.linked} onClick={press}>{pending ? C.working : C.button}</button>
        {status.slug && status.siteOrigin ? <a className="portal-btn secondary" href={`${status.siteOrigin}/people/${status.slug}`} rel="noopener noreferrer">{C.view}</a> : null}
      </div>
    </section>
  )
}
