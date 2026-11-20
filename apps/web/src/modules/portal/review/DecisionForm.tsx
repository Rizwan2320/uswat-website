'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { COPY } from '../copy'
import { decideProfile } from './actions'
import { NOTE_MAX } from './rules'

const C = COPY.review

/** Approve, or ask for changes with a note. The server decides everything; this only collects the choice and shows the answer. */
export default function DecisionForm({ subjectId, rev, fresh }: { subjectId: string; rev: number; fresh: boolean }) {
  const uid = useId()
  const router = useRouter()
  const [note, setNote] = useState('')
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const [pending, start] = useTransition()

  function send(decision: 'approved' | 'changes-requested') {
    setError(null)
    setNoteError(null)
    start(async () => {
      try {
        const r = await decideProfile(decision === 'approved' ? { subjectId, rev, decision } : { subjectId, rev, decision, note })
        if (r.ok) return router.push(`/portal/review?decided=${decision === 'approved' ? 'approved' : 'changes'}`)
        if (r.error === 'invalid' && r.errors?.note) setNoteError(C.noteErrors[r.errors.note] ?? C.noteErrors.invalid)
        else setError(C.errors[r.error] ?? C.errors.generic)
        if (r.error === 'stale' || r.error === 'unavailable') setStale(true)
      } catch {
        setError(C.errors.generic)
      }
    })
  }

  return (
    <section className="portal-card" aria-labelledby={`${uid}-h`}>
      <h2 id={`${uid}-h`} style={{ marginTop: 0 }}>{C.decideTitle}</h2>
      {fresh ? null : (
        <div className="portal-notice" role="note" data-testid="needs-fresh">
          {C.needFresh} <Link className="portal-link" href="/portal/security">{C.needFreshLink}</Link>
        </div>
      )}
      {error ? <div className="portal-error" role="alert" data-testid="decision-error">{error}{stale ? <> <Link className="portal-link" href="/portal/review">{C.reload}</Link></> : null}</div> : null}
      <div className="portal-actions">
        <button type="button" className="portal-btn" disabled={!fresh || pending || stale} onClick={() => send('approved')} data-testid="approve">{pending ? C.working : C.approve}</button>
        <button type="button" className="portal-btn secondary" disabled={!fresh || pending || stale} aria-expanded={asking} onClick={() => setAsking((v) => !v)} data-testid="ask-changes">{C.askChanges}</button>
      </div>
      {asking ? (
        <form className="portal-field" onSubmit={(e) => { e.preventDefault(); send('changes-requested') }} noValidate style={{ marginTop: 16 }}>
          <label htmlFor={`${uid}-note`}>{C.noteLabel}</label>
          <textarea id={`${uid}-note`} name="note" rows={4} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} aria-describedby={`${uid}-hint${noteError ? ` ${uid}-err` : ''}`} aria-invalid={noteError ? true : undefined} />
          <span id={`${uid}-hint`} className="hint">{C.noteHint}</span>
          {noteError ? <span id={`${uid}-err`} className="field-error" data-testid="note-error">{noteError}</span> : null}
          <div className="portal-actions">
            <button type="submit" className="portal-btn danger" disabled={!fresh || pending || stale} data-testid="send-changes">{pending ? C.working : C.askChanges}</button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
