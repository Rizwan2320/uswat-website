'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { COPY } from '../copy'
import { decideActivation } from './actions'

const C = COPY.activate

export default function ActivateButtons({ subjectId, name, fresh }: { subjectId: string; name: string; fresh: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  function send(decision: 'activated' | 'declined') {
    if (decision === 'declined' && !window.confirm(`${name}: ${C.confirmDecline}`)) return
    setError(null)
    start(async () => {
      try {
        const r = await decideActivation({ subjectId, decision })
        if (r.ok) return router.push(`/portal/activate?decided=${decision}`)
        setError(C.errors[r.error] ?? C.errors.generic)
      } catch {
        setError(C.errors.generic)
      }
    })
  }
  return (
    <div>
      <div className="portal-actions" style={{ marginTop: 0 }}>
        <button type="button" className="portal-btn" disabled={!fresh || pending} onClick={() => send('activated')} data-testid="activate" aria-label={`${C.activate}: ${name}`}>{pending ? C.working : C.activate}</button>
        <button type="button" className="portal-btn secondary" disabled={!fresh || pending} onClick={() => send('declined')} data-testid="decline" aria-label={`${C.decline}: ${name}`}>{C.decline}</button>
      </div>
      {error ? <div className="portal-error" role="alert" data-testid="activate-error">{error}</div> : null}
    </div>
  )
}
