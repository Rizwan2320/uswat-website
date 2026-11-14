'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { go, postJson, setSharedComputer } from './client'
import { COPY } from './copy'
import { mapAuthError } from './errors'
import Field, { CheckField } from './Field'

export default function RecoverForm() {
  const [busy, setBusy] = useState(false)
  const [shared, setShared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (error) errorRef.current?.focus() }, [error])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    setSharedComputer(shared)
    try {
      const res = await postJson('/recovery/sign-in', {
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
        code: String(form.get('code') ?? ''),
      })
      if (res.status >= 200 && res.status < 300) {
        // The session made with a recovery code is strong, but the person has lost a device: send them to add a new one.
        go('/portal/enrol')
        return
      }
      // 401 is the one shared answer for every failure (AUTH-10); 429 means wait.
      setError(res.status === 401 ? COPY.errors.badRecovery : mapAuthError({ status: res.status }))
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {error ? <p ref={errorRef} tabIndex={-1} role="alert" className="portal-error">{error}</p> : null}
      <form onSubmit={onSubmit}>
        <Field id="email" label={COPY.recover.emailLabel} type="email" autoComplete="username" required />
        <Field id="password" label={COPY.recover.passwordLabel} type="password" autoComplete="current-password" required />
        <Field id="code" label={COPY.recover.codeLabel} hint={COPY.recover.codeHelp} autoComplete="off" autoCapitalize="characters" spellCheck={false} required />
        <CheckField id="shared" label={COPY.recover.sharedLabel} hint={COPY.recover.sharedHint} checked={shared} onChange={setShared} />
        <button type="submit" className="portal-btn" disabled={busy}>{busy ? COPY.recover.working : COPY.recover.button}</button>
      </form>
      <p><Link className="portal-link" href="/portal/sign-in">{COPY.recover.backLink}</Link></p>
      <p>{COPY.recover.afterwards}</p>
    </>
  )
}
