'use client'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { COPY } from '../copy'
import { claimAccount } from './actions'

const C = COPY.claim

export default function ClaimForm({ token }: { token: string }) {
  const uid = useId()
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [again, setAgain] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dead, setDead] = useState(false)
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if ([...pw].length < 15) return setError(C.short)
    if (pw.length > 128) return setError(C.long)
    if (pw !== again) return setError(C.mismatch)
    start(async () => {
      const r = await claimAccount(token, pw)
      if (r.ok) return router.push('/portal/sign-in?reason=claimed')
      if (r.error === 'password') return setError(C.short)
      setDead(true)
      setError(C.unavailable)
    })
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="portal-field">
        <label htmlFor={`${uid}-pw`}>{C.passwordLabel}</label>
        <input id={`${uid}-pw`} name="password" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-describedby={`${uid}-hint`} />
        <span id={`${uid}-hint`} className="hint">{C.passwordHint}</span>
      </div>
      <div className="portal-field">
        <label htmlFor={`${uid}-again`}>{C.confirmLabel}</label>
        <input id={`${uid}-again`} name="confirm" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
      </div>
      {error ? <div className="portal-error" role="alert" data-testid="claim-error">{error}</div> : null}
      <div className="portal-actions">
        <button type="submit" className="portal-btn" disabled={pending || dead} data-testid="claim-submit">{pending ? C.working : C.submit}</button>
      </div>
    </form>
  )
}
