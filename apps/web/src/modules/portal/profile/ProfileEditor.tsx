'use client'
import { useId, useMemo, useState, useTransition } from 'react'

import { COPY } from '../copy'
import { saveProfile, submitProfile, withdrawProfile } from './actions'
import PublicPreview from './PublicPreview'
import { LIMITS, buildPreview, type FieldErrors } from './rules'
import type { LoadedProfile, Visibility } from './types'
import { VISIBILITIES } from './types'

const C = COPY.profile

type Form = {
  bioEn: string
  bioUr: string
  interests: string
  officeLocation: string
  officeHours: string
  orcid: string
  scholarUrl: string
  cvLink: string
  emailVis: Visibility
  photoVis: Visibility
}

function toForm(l: LoadedProfile): Form {
  const p = l.profile
  return {
    bioEn: p.bio.en,
    bioUr: p.bio.ur,
    interests: p.researchInterests.join(', '),
    officeLocation: p.officeLocation,
    officeHours: p.officeHours,
    orcid: p.orcid,
    scholarUrl: p.scholarUrl,
    cvLink: p.cvLink,
    emailVis: p.visibility.email,
    photoVis: p.visibility.photo,
  }
}

const splitInterests = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

function toEdit(f: Form) {
  return {
    bio: { en: f.bioEn, ur: f.bioUr },
    researchInterests: splitInterests(f.interests),
    officeLocation: f.officeLocation,
    officeHours: f.officeHours,
    orcid: f.orcid,
    scholarUrl: f.scholarUrl,
    cvLink: f.cvLink,
    visibility: { email: f.emailVis, photo: f.photoVis },
  }
}

export default function ProfileEditor({ initial }: { initial: LoadedProfile }) {
  const uid = useId()
  const [form, setForm] = useState<Form>(() => toForm(initial))
  const [status, setStatus] = useState(initial.status)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pending, start] = useTransition()
  const locked = status === 'submitted'
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))

  const preview = useMemo(() => buildPreview({ ...initial.profile, ...toEdit(form) }), [initial.profile, form])

  function fail(kind: string, errs?: FieldErrors) {
    setErrors(errs ?? {})
    setMessage({ kind: 'error', text: C.actionErrors[kind] ?? C.actionErrors.generic })
  }

  function run(job: () => Promise<void>) {
    setMessage(null)
    start(async () => {
      try {
        await job()
      } catch {
        fail('generic')
      }
    })
  }

  const save = () =>
    run(async () => {
      const r = await saveProfile(toEdit(form))
      if (!r.ok) return fail(r.error, r.errors)
      setErrors({})
      setStatus('draft')
      setMessage({ kind: 'ok', text: C.saved })
    })

  const submit = () =>
    run(async () => {
      const saved = await saveProfile(toEdit(form))
      if (!saved.ok) return fail(saved.error, saved.errors)
      const r = await submitProfile()
      if (!r.ok) return fail(r.error)
      setErrors({})
      setStatus('submitted')
      setMessage({ kind: 'ok', text: C.submitted })
    })

  const withdraw = () =>
    run(async () => {
      const r = await withdrawProfile()
      if (!r.ok) return fail(r.error)
      setStatus('draft')
      setMessage({ kind: 'ok', text: C.withdrawn })
    })

  const errorKeys = Object.keys(errors)
  const errText = (k: string) => (errors[k] ? C.errors[errors[k]!] ?? C.errors.invalid : null)

  const text = (key: keyof Form, errKey: string, label: string, hint?: string, opts: { area?: boolean; lang?: string; dir?: 'rtl' | 'ltr' } = {}) => {
    const id = `${uid}-${key}`
    const e = errText(errKey)
    const describedBy = [hint ? `${id}-hint` : '', e ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined
    const common = {
      id,
      name: key,
      value: form[key] as string,
      onChange: (ev: { target: { value: string } }) => set(key, ev.target.value as never),
      'aria-describedby': describedBy,
      'aria-invalid': e ? true : undefined,
      lang: opts.lang,
      dir: opts.dir,
    }
    return (
      <div className="portal-field">
        <label htmlFor={id}>{label}</label>
        {opts.area ? <textarea {...common} rows={5} /> : <input {...common} type="text" />}
        {hint ? <span id={`${id}-hint`} className="hint">{hint}</span> : null}
        {e ? <span id={`${id}-err`} className="field-error">{e}</span> : null}
      </div>
    )
  }

  const select = (key: 'emailVis' | 'photoVis', label: string) => {
    const id = `${uid}-${key}`
    return (
      <div className="portal-field">
        <label htmlFor={id}>{label}</label>
        <select id={id} name={key} value={form[key]} onChange={(e) => set(key, e.target.value as Visibility)}>
          {VISIBILITIES.map((v) => <option key={v} value={v}>{C.visibility[v]}</option>)}
        </select>
      </div>
    )
  }

  const p = initial.profile
  const statusText = status === 'submitted' ? C.statusSubmitted : status === 'draft' ? C.statusDraft : C.statusNone

  return (
    <div className="portal-profile">
      <div>
        <p>{C.intro}</p>
        {p.sample ? <div className="portal-notice" role="note">{C.sampleNote}</div> : null}
        <p data-testid="profile-status"><strong>{statusText}</strong></p>

        <section className="portal-card" aria-labelledby={`${uid}-fixed`}>
          <h2 id={`${uid}-fixed`} style={{ marginTop: 0 }}>{C.fixedTitle}</h2>
          <p className="hint">{C.fixedHelp}</p>
          <dl className="portal-fixed">
            <dt>{C.nameLabel}</dt><dd>{p.name.en}</dd>
            <dt>{C.designationLabel}</dt><dd>{p.designation.en}</dd>
            <dt>{C.departmentLabel}</dt><dd>{p.department}</dd>
            <dt>{C.statusLabel}</dt><dd>{C.status[p.facultyStatus]}</dd>
            <dt>{C.emailLabel}</dt><dd>{p.email}</dd>
          </dl>
        </section>

        {message ? (
          <div className={message.kind === 'ok' ? 'portal-notice' : 'portal-error'} role={message.kind === 'ok' ? 'status' : 'alert'} data-testid="profile-message">{message.text}</div>
        ) : null}
        {errorKeys.length > 0 ? (
          <div className="portal-error" role="alert">
            <p style={{ margin: 0 }}>{C.errorSummary}</p>
            <ul>{errorKeys.map((k) => <li key={k}>{k}: {C.errors[errors[k]!] ?? C.errors.invalid}</li>)}</ul>
          </div>
        ) : null}

        <form onSubmit={(e) => { e.preventDefault(); save() }} noValidate>
          <fieldset className="portal-fieldset" disabled={locked || pending}>
            <legend>{C.aboutTitle}</legend>
            {text('bioEn', 'bio', C.bioEn, C.bioHint(LIMITS.bio), { area: true, lang: 'en', dir: 'ltr' })}
            {text('bioUr', 'bio', C.bioUr, C.bioHint(LIMITS.bio), { area: true, lang: 'ur', dir: 'rtl' })}
            {text('interests', 'researchInterests', C.interestsLabel, C.interestsHint)}
            {text('officeLocation', 'officeLocation', C.officeLocationLabel)}
            {text('officeHours', 'officeHours', C.officeHoursLabel)}
          </fieldset>
          <fieldset className="portal-fieldset" disabled={locked || pending}>
            <legend>{C.linksTitle}</legend>
            {text('orcid', 'orcid', C.orcidLabel, C.orcidHint)}
            {text('scholarUrl', 'scholarUrl', C.scholarLabel, C.scholarHint)}
            {text('cvLink', 'cvLink', C.cvLabel, C.cvHint)}
          </fieldset>
          <fieldset className="portal-fieldset" disabled={locked || pending}>
            <legend>{C.privacyTitle}</legend>
            <p className="hint">{C.privacyHelp}</p>
            {select('emailVis', C.emailVisibility)}
            {select('photoVis', C.photoVisibility)}
          </fieldset>
          <div className="portal-actions">
            {locked ? (
              <button type="button" className="portal-btn secondary" onClick={withdraw} disabled={pending}>{C.withdraw}</button>
            ) : (
              <>
                <button type="submit" className="portal-btn secondary" disabled={pending}>{pending ? C.saving : C.save}</button>
                <button type="button" className="portal-btn" onClick={submit} disabled={pending}>{C.submit}</button>
              </>
            )}
          </div>
        </form>
      </div>
      <PublicPreview preview={preview} />
    </div>
  )
}
