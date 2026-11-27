'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'

import { COPY } from '../copy'
import { saveFixedFields } from './actions'
import { NAME_MAX, SOURCE_MAX } from './rules'
import type { FixedValues } from './types'

const C = COPY.registrar

/** Collects the four values and the source note. The server decides everything; this only shows the answer. */
export default function RegistrarForm({ subjectId, initial, fresh, holdsRole }: { subjectId: string; initial: FixedValues; fresh: boolean; holdsRole: boolean }) {
  const uid = useId()
  const router = useRouter()
  const [v, setV] = useState({ designationEn: initial.designationEn, designationUr: initial.designationUr ?? '', nameUr: initial.nameUr ?? '', department: initial.department, source: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, start] = useTransition()
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => { setDone(false); setV({ ...v, [k]: e.target.value }) }

  function submit() {
    setError(null)
    setErrors({})
    setDone(false)
    start(async () => {
      try {
        const r = await saveFixedFields({ subjectId, ...v })
        if (r.ok) {
          setV({ ...v, source: '' })
          setDone(true)
          return router.refresh()
        }
        if (r.error === 'invalid' && r.errors) setErrors(r.errors as Record<string, string>)
        setError(C.errors[r.error] ?? C.errors.generic)
      } catch {
        setError(C.errors.generic)
      }
    })
  }

  const field = (k: 'designationEn' | 'designationUr' | 'nameUr' | 'department' | 'source', label: string, extra?: { hint?: string; rtl?: boolean; area?: boolean; max: number; disabled?: boolean }) => {
    const id = `${uid}-${k}`
    const err = errors[k]
    const common = { id, name: k, value: v[k], onChange: set(k), maxLength: extra?.max, disabled: extra?.disabled, 'aria-invalid': err ? true : undefined, 'aria-describedby': `${extra?.hint ? `${id}-hint ` : ''}${err ? `${id}-err` : ''}`.trim() || undefined, dir: extra?.rtl ? ('rtl' as const) : undefined, lang: extra?.rtl ? 'ur' : undefined }
    return (
      <div className="portal-field">
        <label htmlFor={id}>{label}</label>
        {extra?.area ? <textarea rows={3} {...common} /> : <input type="text" {...common} />}
        {extra?.hint ? <span id={`${id}-hint`} className="hint">{extra.hint}</span> : null}
        {err ? <span id={`${id}-err`} className="field-error" data-testid={`${k}-error`}>{C.fieldErrors[err] ?? C.fieldErrors.invalid}</span> : null}
      </div>
    )
  }

  return (
    <form className="portal-card" onSubmit={(e) => { e.preventDefault(); submit() }} noValidate data-testid="registrar-form">
      {fresh ? null : (
        <div className="portal-notice" role="note" data-testid="needs-fresh">
          {C.needFresh} <Link className="portal-link" href="/portal/security">{C.needFreshLink}</Link>
        </div>
      )}
      {holdsRole ? <div className="portal-notice" role="note" data-testid="holds-role">{C.holdsRole}</div> : null}
      {error ? <div className="portal-error" role="alert" data-testid="registrar-error">{error}</div> : null}
      {done ? <div className="portal-notice" role="status" data-testid="registrar-saved">{C.saved}</div> : null}
      <div className="portal-form-grid">
        {field('designationEn', C.designationEn, { max: NAME_MAX })}
        {field('designationUr', C.designationUr, { max: NAME_MAX, rtl: true })}
        {field('nameUr', C.nameUr, { max: NAME_MAX, rtl: true })}
        {field('department', C.department, { max: 80, disabled: holdsRole })}
      </div>
      {field('source', C.source, { hint: C.sourceHint, max: SOURCE_MAX, area: true })}
      <div className="portal-actions">
        <button type="submit" className="portal-btn" disabled={!fresh || pending} data-testid="registrar-save">{pending ? C.working : C.save}</button>
      </div>
    </form>
  )
}
