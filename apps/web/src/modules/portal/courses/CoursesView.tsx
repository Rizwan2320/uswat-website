'use client'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { COPY } from '../copy'
import { addCourse, removeCourse } from './actions'
import type { CourseErrors } from './rules'
import type { CourseResult } from './service'
import { SEASONS, type Course } from './types'

const C = COPY.courses

export default function CoursesView({ courses, sampleMode, defaultYear }: { courses: Course[]; sampleMode: boolean; defaultYear: number }) {
  const uid = useId()
  const router = useRouter()
  const [form, setForm] = useState({ code: '', title: '', season: 'Fall', year: String(defaultYear), programme: '' })
  const [errors, setErrors] = useState<CourseErrors>({})
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pending, start] = useTransition()
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  function run(job: () => Promise<CourseResult>, okText: string, onOk?: () => void) {
    setMessage(null)
    start(async () => {
      try {
        const r = await job()
        if (!r.ok) {
          setErrors(r.errors ?? {})
          setMessage({ kind: 'error', text: C.errors[r.error] ?? C.errors.generic })
          return
        }
        setErrors({})
        onOk?.()
        setMessage({ kind: 'ok', text: okText })
        router.refresh()
      } catch {
        setMessage({ kind: 'error', text: C.errors.generic })
      }
    })
  }

  const yearNum = /^\d{4}$/.test(form.year.trim()) ? Number(form.year.trim()) : NaN
  const submit = () => run(() => addCourse({ code: form.code, title: form.title, season: form.season, year: yearNum, programme: form.programme }), C.added, () => setForm((f) => ({ ...f, code: '', title: '', programme: '' })))

  const errText = (k: keyof CourseErrors) => (errors[k] ? C.fieldErrors[errors[k]!] ?? C.fieldErrors.invalid : null)
  const field = (key: 'code' | 'title' | 'programme', label: string, hint?: string) => {
    const id = `${uid}-${key}`
    const e = errText(key)
    return (
      <div className="portal-field">
        <label htmlFor={id}>{label}</label>
        <input id={id} name={key} type="text" value={form[key]} onChange={(ev) => set(key, ev.target.value)} aria-invalid={e ? true : undefined} aria-describedby={[hint ? `${id}-hint` : '', e ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined} dir={key === 'title' || key === 'programme' ? 'auto' : undefined} />
        {hint ? <span id={`${id}-hint`} className="hint">{hint}</span> : null}
        {e ? <span id={`${id}-err`} className="field-error">{e}</span> : null}
      </div>
    )
  }
  const semErr = errText('semester')
  const errorKeys = Object.keys(errors).filter((k) => k !== 'form')

  return (
    <>
      <p>{C.intro}</p>
      {sampleMode ? <div className="portal-notice" role="note">{C.sampleNote}</div> : null}
      {message ? <div className={message.kind === 'ok' ? 'portal-notice' : 'portal-error'} role={message.kind === 'ok' ? 'status' : 'alert'} data-testid="course-message">{message.text}</div> : null}
      {errorKeys.length > 0 ? (
        <div className="portal-error" role="alert">
          <p style={{ margin: 0 }}>{C.errorSummary}</p>
          <ul>{errorKeys.map((k) => <li key={k}>{C.fieldNames[k] ?? k}: {C.fieldErrors[errors[k as keyof CourseErrors]!] ?? C.fieldErrors.invalid}</li>)}</ul>
        </div>
      ) : null}

      <form className="portal-card" onSubmit={(e) => { e.preventDefault(); submit() }} noValidate aria-labelledby={`${uid}-add`}>
        <h2 id={`${uid}-add`} style={{ marginTop: 0 }}>{C.addTitle}</h2>
        {field('code', C.codeLabel, C.codeHint)}
        {field('title', C.titleLabel)}
        <div className="course-semester">
          <div className="portal-field">
            <label htmlFor={`${uid}-season`}>{C.seasonLabel}</label>
            <select id={`${uid}-season`} value={form.season} onChange={(e) => set('season', e.target.value)} aria-invalid={semErr ? true : undefined} aria-describedby={semErr ? `${uid}-sem-err` : undefined}>
              {SEASONS.map((s) => <option key={s} value={s}>{C.seasons[s]}</option>)}
            </select>
          </div>
          <div className="portal-field">
            <label htmlFor={`${uid}-year`}>{C.yearLabel}</label>
            <input id={`${uid}-year`} type="text" inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value)} aria-invalid={semErr ? true : undefined} aria-describedby={semErr ? `${uid}-sem-err` : undefined} />
          </div>
        </div>
        {semErr ? <span id={`${uid}-sem-err`} className="field-error">{semErr}</span> : null}
        {field('programme', C.programmeLabel)}
        <div className="portal-actions">
          <button type="submit" className="portal-btn" disabled={pending}>{pending ? C.adding : C.add}</button>
        </div>
      </form>

      <section className="portal-card" aria-labelledby={`${uid}-list`} data-testid="course-list">
        <h2 id={`${uid}-list`} style={{ marginTop: 0 }}>{C.listTitle(courses.length)}</h2>
        {courses.length === 0 ? <p>{C.empty}</p> : (
          <ul className="pub-list">
            {courses.map((c) => (
              <li key={c.id} className="pub-item" data-testid="course-item">
                <strong dir="auto">{c.code} · {c.title}</strong>
                <span className="pub-meta">{C.semester(C.seasons[c.season] ?? c.season, c.year)}{c.programme ? ` · ${c.programme}` : ''}</span>
                {c.source === 'manual' ? (
                  <div className="pub-actions">
                    <button type="button" className="portal-btn secondary" disabled={pending} aria-label={C.removeFor(c.code, c.season, c.year)} onClick={() => run(() => removeCourse(c.id), C.removed)}>{C.remove}</button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
