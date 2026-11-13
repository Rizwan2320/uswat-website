'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { authClient, go } from './client'
import { COPY } from './copy'
import { mapAuthError } from './errors'
import Field from './Field'

type Step = 'start' | 'totp'

export default function SignInForm() {
  const [step, setStep] = useState<Step>('start')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => { if (error) errorRef.current?.focus() }, [error])
  useEffect(() => { if (step === 'totp') document.getElementById('code')?.focus() }, [step])

  const done = () => go('/portal')

  async function run(fn: () => Promise<{ error?: unknown; data?: unknown } | undefined>, onData?: (data: unknown) => boolean) {
    setBusy(true)
    setError(null)
    try {
      const res = await fn()
      if (res?.error) { setError(mapAuthError(res.error)); return }
      if (onData && onData(res?.data)) return
      done()
    } catch (e) {
      setError(mapAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  const onPasskey = () => run(() => authClient().signIn.passkey())

  const onPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    return run(
      () => authClient().signIn.email({ email: String(form.get('email') ?? ''), password: String(form.get('password') ?? '') }),
      (data) => {
        if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) { setStep('totp'); return true }
        return false
      },
    )
  }

  const onTotp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    return run(() => authClient().twoFactor.verifyTotp({ code: String(form.get('code') ?? '').replace(/\s/g, '') }))
  }

  return (
    <>
      {error ? <p ref={errorRef} tabIndex={-1} role="alert" className="portal-error">{error}</p> : null}
      {step === 'start' ? (
        <>
          <button type="button" className="portal-btn" onClick={onPasskey} disabled={busy}>
            {busy ? COPY.signIn.working : COPY.signIn.passkeyButton}
          </button>
          <p className="portal-divider">{COPY.signIn.orDivider}</p>
          <form onSubmit={onPassword} noValidate={false}>
            <Field id="email" label={COPY.signIn.emailLabel} type="email" autoComplete="username webauthn" required />
            <Field id="password" label={COPY.signIn.passwordLabel} type="password" autoComplete="current-password" required />
            <button type="submit" className="portal-btn secondary" disabled={busy}>
              {busy ? COPY.signIn.working : COPY.signIn.passwordButton}
            </button>
          </form>
          <p><Link className="portal-link" href="/portal/recover">{COPY.signIn.recoverLink}</Link></p>
        </>
      ) : (
        <form onSubmit={onTotp}>
          <h2>{COPY.signIn.totpTitle}</h2>
          <p>{COPY.signIn.totpIntro}</p>
          <Field id="code" label={COPY.signIn.totpLabel} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required />
          <button type="submit" className="portal-btn" disabled={busy}>{busy ? COPY.signIn.working : COPY.signIn.totpButton}</button>{' '}
          <button type="button" className="portal-btn secondary" onClick={() => { setStep('start'); setError(null) }}>{COPY.signIn.totpBack}</button>
        </form>
      )}
    </>
  )
}
