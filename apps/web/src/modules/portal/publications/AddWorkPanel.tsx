'use client'
import { useId, useRef, useState } from 'react'

import { COPY } from '../copy'
import { addWork, harvestWorks, importWorks, lookupDoi } from './actions'
import type { PubResult } from './service'
import { WORK_TYPES, type Candidate } from './types'

const C = COPY.publications
type Way = 'doi' | 'manual' | 'file' | 'orcid'
const EMPTY = { workType: 'article', title: '', authors: '', year: '', venue: '', doi: '', url: '' }
const MAX_FILE = 200_000

/** The four ways to add work. Each one ends in the same place: a work in "Your publications" or "To review". */
export default function AddWorkPanel({ hasOrcid, forId, busy, report, onDone }: { hasOrcid: boolean; forId?: string; busy: boolean; report: (m: { kind: 'ok' | 'error'; text: string } | null) => void; onDone: () => void }) {
  const uid = useId()
  const [way, setWay] = useState<Way>('doi')
  const [via, setVia] = useState<'manual' | 'doi'>('manual')
  const [doi, setDoi] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [working, setWorking] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const off = busy || working
  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const fail = (r: Extract<PubResult, { ok: false }> | { ok: false; error: string; field?: string; fields?: string[] }) => {
    setErrors(Object.fromEntries((r.fields ?? (r.field ? [r.field] : [])).map((k) => [k, k])))
    report({ kind: 'error', text: forId && r.error === 'session' ? COPY.delegation.ended : C.errors[r.error] ?? C.errors.generic })
  }
  async function guard(job: () => Promise<void>) {
    report(null)
    setErrors({})
    setWorking(true)
    try {
      await job()
    } catch {
      report({ kind: 'error', text: C.errors.generic })
    } finally {
      setWorking(false)
    }
  }

  const look = () =>
    guard(async () => {
      const r = await lookupDoi(doi, forId)
      if (!r.ok) return fail(r)
      const w: Candidate = r.work
      setForm({ workType: w.workType ?? 'article', title: w.title, authors: w.authors.join('; '), year: String(w.year), venue: w.venue, doi: w.doi, url: w.url ?? '' })
      setVia('doi')
      setWay('manual')
      report({ kind: 'ok', text: C.doiFound })
    })

  const submit = () =>
    guard(async () => {
      const r = await addWork(form, via, forId)
      if (!r.ok) return fail(r)
      setForm(EMPTY)
      setVia('manual')
      setDoi('')
      report({ kind: 'ok', text: C.done.added })
      onDone()
    })

  const send = () =>
    guard(async () => {
      const f = file.current?.files?.[0]
      if (!f) return report({ kind: 'error', text: C.fileNone })
      if (f.size > MAX_FILE) return report({ kind: 'error', text: C.errors.size })
      const r = await importWorks(await f.text(), f.name, forId)
      if (!r.ok) return fail(r)
      if (file.current) file.current.value = ''
      report({ kind: 'ok', text: C.imported(r.counts?.added ?? 0, r.counts?.alreadyKnown ?? 0, r.counts?.invalid ?? 0, r.truncated === true) })
      onDone()
    })

  const harvest = () =>
    guard(async () => {
      const r = await harvestWorks(forId)
      if (!r.ok) return fail(r)
      report({ kind: 'ok', text: C.harvested(r.counts?.added ?? 0, r.counts?.alreadyKnown ?? 0, r.counts?.invalid ?? 0) })
      onDone()
    })

  const err = (k: string) => (errors[k] ? C.fieldErrors[k] : null)
  const text = (k: 'title' | 'venue' | 'doi' | 'url' | 'year', label: string, hint?: string, extra: { inputMode?: 'numeric'; dir?: 'auto'; type?: string } = {}) => {
    const id = `${uid}-${k}`
    const e = err(k)
    return (
      <div className="portal-field">
        <label htmlFor={id}>{label}</label>
        <input id={id} name={k} type={extra.type ?? 'text'} inputMode={extra.inputMode} dir={extra.dir} value={form[k]} onChange={(ev) => set(k, ev.target.value)} aria-invalid={e ? true : undefined} aria-describedby={[hint ? `${id}-hint` : '', e ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined} autoComplete="off" />
        {hint ? <span id={`${id}-hint`} className="hint">{hint}</span> : null}
        {e ? <span id={`${id}-err`} className="field-error">{e}</span> : null}
      </div>
    )
  }

  return (
    <section className="portal-card pub-add" aria-labelledby={`${uid}-h`} data-testid="pub-add">
      <h2 id={`${uid}-h`} style={{ marginTop: 0 }}>{C.addTitle}</h2>
      <div className="pub-ways" role="group" aria-label={C.addTitle}>
        {(['doi', 'manual', 'file', 'orcid'] as const).map((w) => (
          <button key={w} type="button" className="pub-way" aria-pressed={way === w} onClick={() => { setWay(w); setErrors({}); report(null); if (w === 'manual' && via === 'doi' && form.title === '') setVia('manual') }} data-testid={`pub-way-${w}`}>{C.ways[w]}</button>
        ))}
      </div>

      {way === 'doi' ? (
        <form onSubmit={(e) => { e.preventDefault(); void look() }} noValidate>
          <div className="portal-field">
            <label htmlFor={`${uid}-doi`}>{C.doiLabel}</label>
            <input id={`${uid}-doi`} name="doi" type="text" value={doi} onChange={(e) => setDoi(e.target.value)} aria-invalid={err('doi') ? true : undefined} aria-describedby={`${uid}-doi-hint${err('doi') ? ` ${uid}-doi-err` : ''}`} autoComplete="off" spellCheck={false} />
            <span id={`${uid}-doi-hint`} className="hint">{C.doiHint}</span>
            {err('doi') ? <span id={`${uid}-doi-err`} className="field-error">{err('doi')}</span> : null}
          </div>
          <div className="portal-actions"><button type="submit" className="portal-btn" disabled={off || doi.trim() === ''}>{working ? C.doiLooking : C.doiLookup}</button></div>
        </form>
      ) : null}

      {way === 'manual' ? (
        <form onSubmit={(e) => { e.preventDefault(); void submit() }} noValidate>
          <div className="portal-field">
            <label htmlFor={`${uid}-type`}>{C.typeLabel}</label>
            <select id={`${uid}-type`} name="workType" value={form.workType} onChange={(e) => set('workType', e.target.value)} aria-invalid={err('type') ? true : undefined}>
              {WORK_TYPES.map((t) => <option key={t} value={t}>{C.types[t]}</option>)}
            </select>
            {err('type') ? <span className="field-error">{err('type')}</span> : null}
          </div>
          {text('title', C.titleLabel, undefined, { dir: 'auto' })}
          <div className="portal-field">
            <label htmlFor={`${uid}-authors`}>{C.authorsLabel}</label>
            <textarea id={`${uid}-authors`} name="authors" dir="auto" value={form.authors} onChange={(e) => set('authors', e.target.value)} aria-invalid={err('authors') ? true : undefined} aria-describedby={`${uid}-authors-hint${err('authors') ? ` ${uid}-authors-err` : ''}`} />
            <span id={`${uid}-authors-hint`} className="hint">{C.authorsHint}</span>
            {err('authors') ? <span id={`${uid}-authors-err`} className="field-error">{err('authors')}</span> : null}
          </div>
          <div className="pub-two">
            {text('year', C.yearLabel, undefined, { inputMode: 'numeric' })}
            {text('venue', C.venueLabel, C.venueHint, { dir: 'auto' })}
          </div>
          {text('doi', C.doiOptionalLabel, C.doiOptionalHint)}
          {text('url', C.urlLabel, C.urlHint, { type: 'url' })}
          <div className="portal-actions"><button type="submit" className="portal-btn" disabled={off}>{working ? C.adding : C.add}</button></div>
        </form>
      ) : null}

      {way === 'file' ? (
        <form onSubmit={(e) => { e.preventDefault(); void send() }} noValidate>
          <div className="portal-field">
            <label htmlFor={`${uid}-file`}>{C.fileLabel}</label>
            <input id={`${uid}-file`} ref={file} type="file" accept=".bib,.bibtex,.ris,.csv,.txt,text/plain,text/csv" aria-describedby={`${uid}-file-hint`} />
            <span id={`${uid}-file-hint`} className="hint">{C.fileHint}</span>
          </div>
          <div className="portal-actions"><button type="submit" className="portal-btn" disabled={off}>{working ? C.fileImporting : C.fileButton}</button></div>
        </form>
      ) : null}

      {way === 'orcid' ? (
        <div>
          <p>{C.orcidHint}</p>
          <div className="portal-actions"><button type="button" className="portal-btn" disabled={off || !hasOrcid} onClick={() => void harvest()}>{working ? C.harvesting : C.harvest}</button></div>
        </div>
      ) : null}
    </section>
  )
}
