import type { InputHTMLAttributes } from 'react'

/** A labelled input. The label is always visible and linked; hints are linked with aria-describedby. */
export default function Field({ id, label, hint, ...input }: { id: string; label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="portal-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} aria-describedby={hint ? `${id}-hint` : undefined} {...input} />
      {hint ? <span id={`${id}-hint`} className="hint">{hint}</span> : null}
    </div>
  )
}
