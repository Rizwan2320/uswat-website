'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useId, useState, useTransition } from 'react'

import { COPY } from '../copy'
import AddWorkPanel from './AddWorkPanel'
import { claimWork, duplicateWork, exportWorks, rejectWork } from './actions'
import type { PubResult } from './service'
import { MAX_FEATURED, type StoredWork, type WorkLists } from './types'
import { ClaimedCard, WorkLine } from './WorkCards'
import { EXPORT_FORMATS, type ExportFormat } from './exporters'

const C = COPY.publications

function Pending({ w, claimed, busy, run, forId }: { forId?: string; w: StoredWork; claimed: StoredWork[]; busy: boolean; run: (job: () => Promise<PubResult>, ok: string, onResult?: (r: PubResult) => void) => void }) {
  const id = useId()
  const [target, setTarget] = useState('')
  return (
    <li className="pub-item" data-testid="pub-pending">
      <WorkLine w={w} showOrigin />
      <div className="pub-actions">
        <button type="button" className="portal-btn" disabled={busy} onClick={() => run(() => claimWork(w.id, forId), C.done.claimed)}>{C.claim}</button>
        <button type="button" className="portal-btn secondary" disabled={busy} onClick={() => run(() => rejectWork(w.id, forId), C.done.rejected)}>{C.reject}</button>
      </div>
      {claimed.length > 0 ? (
        <div className="pub-dup">
          <label htmlFor={id}>{C.duplicateOf}</label>
          <select id={id} value={target} onChange={(e) => setTarget(e.target.value)} disabled={busy}>
            <option value="">{C.duplicateChoose}</option>
            {claimed.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.year})</option>)}
          </select>
          <button type="button" className="portal-btn secondary" disabled={busy || target === ''} onClick={() => run(() => duplicateWork(w.id, target, forId), C.done.duplicate)}>{C.markDuplicate}</button>
        </div>
      ) : null}
    </li>
  )
}

function download(f: { filename: string; mime: string; text: string }) {
  const url = URL.createObjectURL(new Blob([f.text], { type: `${f.mime};charset=utf-8` }))
  const a = document.createElement('a')
  a.href = url
  a.download = f.filename
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function PublicationsView({ lists, hasOrcid, sampleMode, forId }: { lists: WorkLists; hasOrcid: boolean; sampleMode: boolean; forId?: string }) {
  const router = useRouter()
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pending, start] = useTransition()

  function run(job: () => Promise<PubResult>, okText: string, onResult?: (r: PubResult) => void) {
    setMessage(null)
    start(async () => {
      try {
        const r = await job()
        onResult?.(r)
        if (!r.ok) {
          setMessage({ kind: 'error', text: forId && r.error === 'session' ? COPY.delegation.ended : C.errors[r.error] ?? C.errors.generic })
          return
        }
        setMessage({ kind: 'ok', text: okText })
        router.refresh()
      } catch {
        setMessage({ kind: 'error', text: C.errors.generic })
      }
    })
  }

  function exportAs(format: ExportFormat) {
    setMessage(null)
    start(async () => {
      try {
        const r = await exportWorks(format, forId)
        if (!r.ok) {
          setMessage({ kind: 'error', text: forId && r.error === 'session' ? COPY.delegation.ended : C.errors[r.error] ?? C.errors.generic })
          return
        }
        download(r)
        setMessage({ kind: 'ok', text: C.exported(r.filename) })
      } catch {
        setMessage({ kind: 'error', text: C.errors.generic })
      }
    })
  }

  const section = (title: string, empty: string, works: StoredWork[], render: (w: StoredWork) => React.ReactNode, testid: string, extra?: React.ReactNode) => (
    <section aria-labelledby={`${testid}-h`} className="portal-card" data-testid={testid}>
      <h2 id={`${testid}-h`} style={{ marginTop: 0 }}>{title}</h2>
      {extra}
      {works.length === 0 ? <p>{empty}</p> : <ul className="pub-list">{works.map(render)}</ul>}
    </section>
  )

  const byId = new Map([...lists.claimed].map((w) => [w.id, w]))
  const featured = lists.claimed.filter((w) => w.featured).length

  return (
    <>
      <p>{C.intro}</p>
      {sampleMode ? <div className="portal-notice" role="note">{C.sampleNote}</div> : null}
      {!hasOrcid ? (
        <div className="portal-notice" role="note">
          {C.needOrcid} <Link className="portal-link" href={forId ? `/portal/profile?for=${forId}` : '/portal/profile'}>{C.profileLink}</Link>
        </div>
      ) : null}
      <AddWorkPanel hasOrcid={hasOrcid} forId={forId} busy={pending} report={setMessage} onDone={() => router.refresh()} />
      {message ? <div className={message.kind === 'ok' ? 'portal-notice' : 'portal-error'} role={message.kind === 'ok' ? 'status' : 'alert'} data-testid="pub-message">{message.text}</div> : null}

      {section(C.pendingTitle(lists.pending.length), C.emptyPending, lists.pending, (w) => <Pending key={w.id} w={w} claimed={lists.claimed} busy={pending} run={run} forId={forId} />, 'pub-section-pending')}
      {section(
        C.claimedTitle(lists.claimed.length),
        C.emptyClaimed,
        lists.claimed,
        (w) => <ClaimedCard key={w.id} w={w} busy={pending} run={run} forId={forId} />,
        'pub-section-claimed',
        <>
          <p className="pub-summary" data-testid="pub-featured-count">{C.featuredCount(featured, MAX_FEATURED)}. {C.featureHelp}</p>
          <p className="pub-summary">{C.publicNote}</p>
          {lists.claimed.length > 0 ? (
            <div className="pub-export" role="group" aria-label={C.exportTitle}>
              <span>{C.exportTitle}:</span>
              {EXPORT_FORMATS.map((f) => <button key={f} type="button" className="portal-btn secondary" disabled={pending} onClick={() => exportAs(f)} data-testid={`pub-export-${f}`}>{C.exportFormats[f]}</button>)}
            </div>
          ) : null}
        </>,
      )}
      {section(C.duplicateTitle(lists.duplicate.length), C.emptyDuplicate, lists.duplicate, (w) => (
        <li key={w.id} className="pub-item">
          <WorkLine w={w} />
          {w.duplicateOf && byId.get(w.duplicateOf) ? <span className="pub-meta">{C.repeats}: {byId.get(w.duplicateOf)!.title}</span> : null}
        </li>
      ), 'pub-section-duplicate')}
      {section(C.rejectedTitle(lists.rejected.length), C.emptyRejected, lists.rejected, (w) => <li key={w.id} className="pub-item"><WorkLine w={w} /></li>, 'pub-section-rejected')}
    </>
  )
}
