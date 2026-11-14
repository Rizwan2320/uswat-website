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

/** A labelled checkbox with a hint, in the portal's style. */
export function CheckField({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="portal-check">
      <input id={id} type="checkbox" checked={checked} aria-describedby={`${id}-hint`} onChange={(e) => onChange(e.target.checked)} />
      <div>
        <label htmlFor={id}>{label}</label>
        <div id={`${id}-hint`} className="hint">{hint}</div>
      </div>
    </div>
  )
}
