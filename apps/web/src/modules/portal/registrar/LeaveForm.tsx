'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { COPY } from '../copy'
import { markAsLeft, resendDeparture } from './actions'
import { SOURCE_MAX } from './rules'
import { DEPARTURE_OUTCOMES } from './types'

const C = COPY.registrar
const L = C.leave

/** Collects the outcome, the source document and the ticked confirmation. The server decides everything; this only shows the answer. */
export function LeaveForm({ subjectId, fresh, holdsRole }: { subjectId: string; fresh: boolean; holdsRole: boolean }) {
  const uid = useId()
  const router = useRouter()
  const [outcome, setOutcome] = useState('')
  const [source, setSource] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function submit() {
    setError(null)
    setErrors({})
    start(async () => {
      try {
        const r = await markAsLeft({ subjectId, outcome, source, confirmed })
        if (r.ok) return router.refresh()
        if (r.error === 'invalid' && r.errors) setErrors(r.errors as Record<string, string>)
        setError(L.errors[r.error] ?? L.errors.generic)
      } catch {
        setError(L.errors.generic)
      }
    })
  }

  const err = (k: string) => (errors[k] ? <span className="field-error" data-testid={`leave-${k}-error`}>{L.fieldErrors[errors[k]] ?? L.fieldErrors.invalid}</span> : null)

  return (
    <form className="portal-card" onSubmit={(e) => { e.preventDefault(); submit() }} noValidate data-testid="leave-form">
      <h2>{L.title}</h2>
      <p>{L.intro}</p>
      {fresh ? null : (
        <div className="portal-notice" role="note" data-testid="leave-needs-fresh">
          {C.needFresh} <Link className="portal-link" href="/portal/security">{C.needFreshLink}</Link>
        </div>
      )}
      {holdsRole ? <div className="portal-notice" role="note" data-testid="leave-holds-role">{L.holdsRole}</div> : null}
      {error ? <div className="portal-error" role="alert" data-testid="leave-error">{error}</div> : null}
      <fieldset className="portal-field">
        <legend>{L.outcome}</legend>
        {DEPARTURE_OUTCOMES.map((o) => (
          <label key={o} className="portal-check">
            <input type="radio" name={`${uid}-outcome`} value={o} checked={outcome === o} onChange={() => setOutcome(o)} data-testid={`leave-outcome-${o}`} /> {L.outcomes[o]}
          </label>
        ))}
        {err('outcome')}
      </fieldset>
      <div className="portal-field">
        <label htmlFor={`${uid}-source`}>{L.source}</label>
        <textarea id={`${uid}-source`} rows={3} maxLength={SOURCE_MAX} value={source} onChange={(e) => setSource(e.target.value)} aria-describedby={`${uid}-source-hint`} data-testid="leave-source" />
        <span id={`${uid}-source-hint`} className="hint">{L.sourceHint}</span>
        {err('source')}
      </div>
      <div className="portal-field">
        <label className="portal-check">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} data-testid="leave-confirm" /> {L.confirm}
        </label>
        {err('confirm')}
      </div>
      <div className="portal-actions">
        <button type="submit" className="portal-btn" disabled={!fresh || pending} data-testid="leave-submit">{pending ? L.working : L.button}</button>
      </div>
    </form>
  )
}

/** After a failed send: asks the site again. The account has already ended either way. */
export function ResendButton({ subjectId }: { subjectId: string }) {
  const router = useRouter()
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <>
      <button type="button" className="portal-btn" disabled={pending} data-testid="leave-resend" onClick={() => start(async () => {
        setMsg(null)
        try {
          const r = await resendDeparture(subjectId)
          setMsg(r.ok ? L.resent : L.resendFailed)
          if (r.ok) router.refresh()
        } catch {
          setMsg(L.resendFailed)
        }
      })}>{pending ? L.resending : L.resend}</button>
      {msg ? <span role="status" className="hint" data-testid="leave-resend-msg"> {msg}</span> : null}
    </>
  )
}
