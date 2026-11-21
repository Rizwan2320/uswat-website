'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { COPY } from '../copy'
import { saveCadence } from './actions'
import { CADENCES, type Cadence } from './kinds'

const C = COPY.notifications

export default function CadenceForm({ initial }: { initial: Cadence }) {
  const router = useRouter()
  const [value, setValue] = useState<Cadence>(initial)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pending, start] = useTransition()
  function save() {
    setMsg(null)
    start(async () => {
      try {
        const r = await saveCadence({ cadence: value })
        if (r.ok) {
          setMsg({ kind: 'ok', text: C.saved })
          return router.refresh()
        }
        setMsg({ kind: 'error', text: C.errors[r.error] ?? C.errors.generic })
      } catch {
        setMsg({ kind: 'error', text: C.errors.generic })
      }
    })
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); save() }} data-testid="cadence-form">
      <fieldset className="portal-fieldset">
        <legend>{C.cadenceLegend}</legend>
        <div className="portal-check-list">
          {CADENCES.map((c) => (
            <label key={c} className="portal-check">
              <input type="radio" name="cadence" value={c} checked={value === c} onChange={() => setValue(c)} data-testid={`cadence-${c}`} />
              <span>{C.cadences[c]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="portal-actions">
        <button type="submit" className="portal-btn" disabled={pending} data-testid="cadence-save">{pending ? C.working : C.save}</button>
      </div>
      {msg ? <div className={msg.kind === 'ok' ? 'portal-notice' : 'portal-error'} role={msg.kind === 'ok' ? 'status' : 'alert'} data-testid="cadence-message">{msg.text}</div> : null}
    </form>
  )
}
