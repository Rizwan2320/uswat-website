'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useId, useState, useTransition } from 'react'

import { COPY } from '../copy'
import { claimWork, duplicateWork, harvestWorks, rejectWork } from './actions'
import type { PubResult } from './service'
import type { StoredWork, WorkLists } from './types'

const C = COPY.publications

function WorkLine({ w }: { w: StoredWork }) {
  return (
    <>
      <strong dir="auto">{w.title}</strong>
      <span className="pub-meta">
        {w.year} · {w.venue || '—'} · {w.doi ? `DOI ${w.doi}` : C.noDoi}
      </span>
      <span className="pub-meta" dir="auto">{C.byAuthors}: {w.authors.join(', ')}</span>
    </>
  )
}

function Pending({ w, claimed, busy, run }: { w: StoredWork; claimed: StoredWork[]; busy: boolean; run: (job: () => Promise<PubResult>, ok: string) => void }) {
  const id = useId()
  const [target, setTarget] = useState('')
  return (
    <li className="pub-item" data-testid="pub-pending">
      <WorkLine w={w} />
      <div className="pub-actions">
        <button type="button" className="portal-btn" disabled={busy} onClick={() => run(() => claimWork(w.id), C.done.claimed)}>{C.claim}</button>
        <button type="button" className="portal-btn secondary" disabled={busy} onClick={() => run(() => rejectWork(w.id), C.done.rejected)}>{C.reject}</button>
      </div>
      {claimed.length > 0 ? (
        <div className="pub-dup">
          <label htmlFor={id}>{C.duplicateOf}</label>
          <select id={id} value={target} onChange={(e) => setTarget(e.target.value)} disabled={busy}>
            <option value="">{C.duplicateChoose}</option>
            {claimed.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.year})</option>)}
          </select>
          <button type="button" className="portal-btn secondary" disabled={busy || target === ''} onClick={() => run(() => duplicateWork(w.id, target), C.done.duplicate)}>{C.markDuplicate}</button>
        </div>
      ) : null}
    </li>
  )
}

export default function PublicationsView({ lists, hasOrcid, sampleMode }: { lists: WorkLists; hasOrcid: boolean; sampleMode: boolean }) {
  const router = useRouter()
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pending, start] = useTransition()

  function run(job: () => Promise<PubResult>, okText: string) {
    setMessage(null)
    start(async () => {
      try {
        const r = await job()
        if (!r.ok) {
          setMessage({ kind: 'error', text: C.errors[r.error] ?? C.errors.generic })
          return
        }
        setMessage({ kind: 'ok', text: r.counts ? C.harvested(r.counts.added, r.counts.alreadyKnown, r.counts.invalid) : okText })
        router.refresh()
      } catch {
        setMessage({ kind: 'error', text: C.errors.generic })
      }
    })
  }

  const section = (title: string, empty: string, works: StoredWork[], render: (w: StoredWork) => React.ReactNode, testid: string) => (
    <section aria-labelledby={`${testid}-h`} className="portal-card" data-testid={testid}>
      <h2 id={`${testid}-h`} style={{ marginTop: 0 }}>{title}</h2>
      {works.length === 0 ? <p>{empty}</p> : <ul className="pub-list">{works.map(render)}</ul>}
    </section>
  )

  const byId = new Map([...lists.claimed].map((w) => [w.id, w]))

  return (
    <>
      <p>{C.intro}</p>
      {sampleMode ? <div className="portal-notice" role="note">{C.sampleNote}</div> : null}
      {!hasOrcid ? (
        <div className="portal-notice" role="note">
          {C.needOrcid} <Link className="portal-link" href="/portal/profile">{C.profileLink}</Link>
        </div>
      ) : null}
      <div className="portal-actions">
        <button type="button" className="portal-btn" disabled={pending || !hasOrcid} onClick={() => run(harvestWorks, '')}>{pending ? C.harvesting : C.harvest}</button>
      </div>
      {message ? <div className={message.kind === 'ok' ? 'portal-notice' : 'portal-error'} role={message.kind === 'ok' ? 'status' : 'alert'} data-testid="pub-message">{message.text}</div> : null}

      {section(C.pendingTitle(lists.pending.length), C.emptyPending, lists.pending, (w) => <Pending key={w.id} w={w} claimed={lists.claimed} busy={pending} run={run} />, 'pub-section-pending')}
      {section(C.claimedTitle(lists.claimed.length), C.emptyClaimed, lists.claimed, (w) => <li key={w.id} className="pub-item"><WorkLine w={w} /></li>, 'pub-section-claimed')}
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
