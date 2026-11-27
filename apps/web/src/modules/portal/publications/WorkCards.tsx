'use client'
import { useId, useState } from 'react'

import { COPY } from '../copy'
import { removeWork, setWorkFeatured, setWorkPublic, updateWorkDetails } from './actions'
import type { PubResult } from './service'
import { WORK_TYPES, type StoredWork } from './types'

const C = COPY.publications
type Run = (job: () => Promise<PubResult>, ok: string, onResult?: (r: PubResult) => void) => void

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
  const initial = () => ({ workType: w.workType as string, title: w.title, authors: w.authors.join('; '), year: String(w.year), venue: w.venue, doi: w.doi, url: w.url })
  const [f, setF] = useState(initial)
  const [bad, setBad] = useState<string[]>([])
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const set = (k: keyof ReturnType<typeof initial>, v: string) => setF((x) => ({ ...x, [k]: v }))
  const field = (k: keyof ReturnType<typeof initial>, label: string, extra: { hint?: string; dir?: 'auto'; type?: string; inputMode?: 'numeric' } = {}) => {
    const id = `${uid}-${k}`
    const e = bad.includes(k)
    return (
      <div className="portal-field">
        <label htmlFor={id}>{label}</label>
        <input id={id} type={extra.type ?? 'text'} inputMode={extra.inputMode} dir={extra.dir} value={f[k]} onChange={(ev) => set(k, ev.target.value)} disabled={busy} autoComplete="off" aria-invalid={e ? true : undefined} aria-describedby={e ? `${id}-err` : undefined} />
        {extra.hint ? <span className="hint">{extra.hint}</span> : null}
        {e ? <span id={`${id}-err`} className="field-error">{C.fieldErrors[k]}</span> : null}
      </div>
    )
  }
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
          <label htmlFor={`${uid}-workType`}>{C.typeLabel}</label>
          <select id={`${uid}-workType`} value={f.workType} onChange={(e) => set('workType', e.target.value)} disabled={busy}>
            {WORK_TYPES.map((t) => <option key={t} value={t}>{C.types[t]}</option>)}
          </select>
        </div>
        {field('title', C.titleLabel, { dir: 'auto' })}
        <div className="portal-field">
          <label htmlFor={`${uid}-authors`}>{C.authorsLabel}</label>
          <textarea id={`${uid}-authors`} dir="auto" value={f.authors} onChange={(e) => set('authors', e.target.value)} disabled={busy} aria-invalid={bad.includes('authors') ? true : undefined} />
          <span className="hint">{C.authorsHint}</span>
          {bad.includes('authors') ? <span className="field-error">{C.fieldErrors.authors}</span> : null}
        </div>
        <div className="pub-two">
          {field('year', C.yearLabel, { inputMode: 'numeric' })}
          {field('venue', C.venueLabel, { dir: 'auto' })}
        </div>
        {field('doi', C.doiOptionalLabel)}
        {field('url', C.urlLabel, { type: 'url', hint: C.urlHint })}
        <div className="portal-actions">
          <button type="button" className="portal-btn secondary" disabled={busy} onClick={() => { setBad([]); setNote(null); run(() => updateWorkDetails(w.id, f, forId), C.done.updated, (r) => { if (r.ok) setNote({ ok: true, text: C.done.updated }); else { setBad(r.fields ?? (r.field ? [r.field] : [])); setNote({ ok: false, text: C.errors[r.error] ?? C.errors.generic }) } }) }}>{C.saveDetails}</button>
          <button type="button" className="portal-btn secondary" disabled={busy} onClick={() => { setF(initial()); setBad([]); setNote(null) }}>{C.resetDetails}</button>
        </div>
        {note ? <div className={note.ok ? 'portal-notice' : 'portal-error'} role={note.ok ? 'status' : 'alert'} data-testid="pub-edit-note">{note.text}</div> : null}
      </details>
    </li>
  )
}
