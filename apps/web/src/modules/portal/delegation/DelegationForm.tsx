'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { COPY } from '../copy'
import { grantDelegation } from './actions'
import { MAX_DAYS, SECTIONS, type Section } from './types'

const C = COPY.delegation
const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })

export default function DelegationForm({ fresh }: { fresh: boolean }) {
  const uid = useId()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [chosen, setChosen] = useState<Section[]>([])
  const [days, setDays] = useState('30')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [ok, setOk] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const toggle = (s: Section) => setChosen((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))
  function send() {
    setError(null)
    setOk(null)
    setFieldErrors({})
    const n = /^\d{1,3}$/.test(days.trim()) ? Number(days.trim()) : NaN
    start(async () => {
      try {
        const r = await grantDelegation({ delegateEmail: email, sections: SECTIONS.filter((s) => chosen.includes(s)), days: n })
        if (!r.ok) {
          setFieldErrors(r.errors ?? {})
          setError(C.errors[r.error] ?? C.errors.generic)
          return
        }
        setOk(C.given(`${when.format(new Date(r.expiresAt))} UTC`))
        setEmail('')
        setChosen([])
        router.refresh()
      } catch {
        setError(C.errors.generic)
      }
    })
  }
  const emailId = `${uid}-email`
  const daysId = `${uid}-days`
  return (
    <form onSubmit={(e) => { e.preventDefault(); send() }} noValidate data-testid="grant-form">
      <h2>{C.giveTitle}</h2>
      {fresh ? null : (
        <div className="portal-notice" role="note" data-testid="needs-fresh">{C.needFresh} <Link className="portal-link" href="/portal/security">{C.needFreshLink}</Link></div>
      )}
      <div className="portal-field">
        <label htmlFor={emailId}>{C.emailLabel}</label>
        <input id={emailId} name="delegateEmail" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={`${emailId}-hint`} aria-invalid={fieldErrors.delegateEmail ? true : undefined} />
        <span id={`${emailId}-hint`} className="hint">{C.emailHint}</span>
      </div>
      <fieldset className="portal-fieldset" aria-invalid={fieldErrors.sections ? true : undefined}>
        <legend>{C.sectionsLegend}</legend>
        <div className="portal-check-list">
          {SECTIONS.map((s) => (
            <label key={s} className="portal-check">
              <input type="checkbox" checked={chosen.includes(s)} onChange={() => toggle(s)} data-testid={`section-${s}`} />
              <span>{C.sections[s]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="portal-field">
        <label htmlFor={daysId}>{C.daysLabel}</label>
        <input id={daysId} name="days" type="text" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} aria-describedby={`${daysId}-hint`} aria-invalid={fieldErrors.days ? true : undefined} />
        <span id={`${daysId}-hint`} className="hint">{C.daysHint.replace('90', String(MAX_DAYS))}</span>
      </div>
      <div className="portal-actions">
        <button type="submit" className="portal-btn" disabled={!fresh || pending} data-testid="grant">{pending ? C.working : C.give}</button>
      </div>
      {error ? <div className="portal-error" role="alert" data-testid="grant-error">{error}</div> : null}
      {ok ? <div className="portal-notice" role="status" data-testid="grant-ok">{ok}</div> : null}
    </form>
  )
}
