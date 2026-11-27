'use client'
import { useId, useState } from 'react'

import { COPY } from '../copy'
import { removeWork, setWorkFeatured, setWorkPublic, updateWorkDetails } from './actions'
import type { PubResult } from './service'
import { WORK_TYPES, type StoredWork, type WorkType } from './types'

const C = COPY.publications
type Run = (job: () => Promise<PubResult>, ok: string) => void

/** Title, kind, year, venue, DOI and authors of a work. All text is rendered as plain text; the link only if it is http(s). */
export function WorkLine({ w, showOrigin }: { w: StoredWork; showOrigin?: boolean }) {
  return (
    <>
      <strong dir="auto">{w.title}</strong>
      <span className="pub-meta">
        <span className="pub-type">{C.types[w.workType]}</span> {w.year} · {w.venue || '—'} · {w.doi ? `DOI ${w.doi}` : C.noDoi}
      </span>
      <span className="pub-meta" dir="auto">{C.byAuthors}: {w.authors.join(', ')}</span>
      {w.url && /^https?:\/\//i.test(w.url) ? (
        <span className="pub-meta"><a className="portal-link" href={w.url} target="_blank" rel="noopener noreferrer nofollow">{C.fullText}</a></span>
      ) : null}
      {showOrigin ? <span className="pub-meta pub-origin">{C.origin[w.origin]}</span> : null}
    </>
  )
}

/** A claimed work: feature it, choose who sees it, change its kind or link, delete it if it was not found by a harvest. */
export function ClaimedCard({ w, busy, run, forId }: { w: StoredWork; busy: boolean; run: Run; forId?: string }) {
  const uid = useId()
  const [kind, setKind] = useState<WorkType>(w.workType)
  const [url, setUrl] = useState(w.url)
  return (
    <li className="pub-item" data-testid="pub-claimed" data-featured={w.featured ? 'yes' : 'no'}>
      <WorkLine w={w} showOrigin />
      <div className="pub-actions">
        <button type="button" className="pub-toggle" aria-pressed={w.featured} disabled={busy} aria-label={w.featured ? C.unfeatureFor(w.title) : C.featureFor(w.title)} onClick={() => run(() => setWorkFeatured(w.id, !w.featured, forId), w.featured ? C.done.unfeatured : C.done.featured)}>
          <span aria-hidden="true">{w.featured ? '★ ' : '☆ '}</span>{w.featured ? C.unfeature : C.feature}
        </button>
        <label className="pub-vis">
          <span className="pub-vis-label">{C.visibilityLabel}</span>
          <select value={w.isPublic ? 'public' : 'private'} disabled={busy} aria-label={C.visibilityFor(w.title)} onChange={(e) => run(() => setWorkPublic(w.id, e.target.value === 'public', forId), e.target.value === 'public' ? C.done.public : C.done.private)}>
            <option value="public">{C.visibility.public}</option>
            <option value="private">{C.visibility.private}</option>
          </select>
        </label>
        {w.origin !== 'harvest' ? (
          <button type="button" className="portal-btn secondary" disabled={busy} aria-label={C.removeFor(w.title)} onClick={() => { if (window.confirm(C.confirmRemove)) run(() => removeWork(w.id, forId), C.done.removed) }}>{C.remove}</button>
        ) : null}
      </div>
      <details className="pub-edit">
        <summary>{C.edit}</summary>
        <div className="portal-field">
          <label htmlFor={`${uid}-k`}>{C.typeLabel}</label>
          <select id={`${uid}-k`} value={kind} onChange={(e) => setKind(e.target.value as WorkType)} disabled={busy}>
            {WORK_TYPES.map((t) => <option key={t} value={t}>{C.types[t]}</option>)}
          </select>
        </div>
        <div className="portal-field">
          <label htmlFor={`${uid}-u`}>{C.urlLabel}</label>
          <input id={`${uid}-u`} type="url" value={url} onChange={(e) => setUrl(e.target.value)} disabled={busy} autoComplete="off" />
          <span className="hint">{C.urlHint}</span>
        </div>
        <div className="portal-actions"><button type="button" className="portal-btn secondary" disabled={busy} onClick={() => run(() => updateWorkDetails(w.id, { workType: kind, url }, forId), C.done.updated)}>{C.saveDetails}</button></div>
      </details>
    </li>
  )
}
