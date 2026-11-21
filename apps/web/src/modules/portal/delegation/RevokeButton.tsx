'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { COPY } from '../copy'
import { revokeDelegation } from './actions'

const C = COPY.delegation

export default function RevokeButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  function send() {
    if (!window.confirm(`${name}: ${C.confirmRevoke}`)) return
    setError(null)
    start(async () => {
      try {
        const r = await revokeDelegation(id)
        if (r.ok) return router.refresh()
        setError(C.errors[r.error ?? 'generic'] ?? C.errors.generic)
      } catch {
        setError(C.errors.generic)
      }
    })
  }
  return (
    <div>
      <div className="portal-actions" style={{ marginTop: 0 }}>
        <button type="button" className="portal-btn secondary" disabled={pending} onClick={send} aria-label={C.revokeFor(name)} data-testid="revoke">{pending ? C.working : C.revoke}</button>
      </div>
      {error ? <div className="portal-error" role="alert" data-testid="revoke-error">{error}</div> : null}
    </div>
  )
}
