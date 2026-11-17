'use client'
import { useEffect, useRef, useState } from 'react'

import { authClient, go, postJson } from './client'
import { COPY } from './copy'
import { mapAuthError } from './errors'
import Field from './Field'

type Stage = 'choose' | 'codes'

/** Setup key from an otpauth:// link: the `secret` query value, grouped in fours for typing. */
export function setupKeyFrom(uri: string): string {
  try {
    const secret = new URL(uri).searchParams.get('secret') ?? ''
    return secret.replace(/(.{4})/g, '$1 ').trim()
  } catch {
    return ''
  }
}

export default function EnrolFlow() {
  const [stage, setStage] = useState<Stage>('choose')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passkeyDone, setPasskeyDone] = useState(false)
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [totpDone, setTotpDone] = useState(false)
  const [codes, setCodes] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (error) errorRef.current?.focus() }, [error])

  async function guard(fn: () => Promise<boolean>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(mapAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  const addPasskey = () =>
    guard(async () => {
      const res = await authClient().passkey.addPasskey({ name: 'My passkey' })
      if (res?.error) { setError(mapAuthError(res.error)); return false }
      setPasskeyDone(true)
      return true
    })

  const startTotp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const password = String(new FormData(e.currentTarget).get('password') ?? '')
    return guard(async () => {
      const res = await authClient().twoFactor.enable({ password })
      if (res?.error) { setError(mapAuthError(res.error)); return false }
      setTotpUri((res?.data as { totpURI?: string } | null)?.totpURI ?? null)
      return true
    })
  }

  const verifyTotp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const code = String(new FormData(e.currentTarget).get('code') ?? '').replace(/\s/g, '')
    return guard(async () => {
      const res = await authClient().twoFactor.verifyTotp({ code })
      if (res?.error) { setError(mapAuthError(res.error)); return false }
      setTotpDone(true)
      return true
    })
  }

  const getCodes = () =>
    guard(async () => {
      const res = await postJson('/recovery/issue', {})
      const list = res.body?.codes
      if (res.status !== 200 || !Array.isArray(list)) { setError(mapAuthError({ status: res.status })); return false }
      setCodes(list.map(String))
      setStage('codes')
      return true
    })

  const secondFactorReady = passkeyDone || totpDone

  if (stage === 'codes') {
    return (
      <section aria-labelledby="codes-h">
        <h2 id="codes-h">{COPY.enrol.codesTitle}</h2>
        <p>{COPY.enrol.codesHelp}</p>
        <p className="portal-notice">{COPY.enrol.codesWarning}</p>
        <ul className="portal-codes" aria-label={COPY.enrol.codesTitle}>
          {codes.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className="portal-check">
          <input id="saved" type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
          <label htmlFor="saved">{COPY.enrol.savedConfirm}</label>
        </div>
        <button type="button" className="portal-btn" disabled={!saved} onClick={() => go('/portal')}>
          {COPY.enrol.continueButton}
        </button>
      </section>
    )
  }

  return (
    <>
      {error ? <p ref={errorRef} tabIndex={-1} role="alert" className="portal-error">{error}</p> : null}

      <section className="portal-card" aria-labelledby="pk-h">
        <h2 id="pk-h">{COPY.enrol.passkeyTitle}</h2>
        <p>{COPY.enrol.passkeyHelp}</p>
        {passkeyDone ? <p className="portal-notice" role="status">{COPY.enrol.passkeyDone}</p> : (
          <button type="button" className="portal-btn" onClick={addPasskey} disabled={busy}>
            {busy ? COPY.enrol.working : COPY.enrol.passkeyButton}
          </button>
        )}
      </section>

      <section className="portal-card" aria-labelledby="totp-h">
        <h2 id="totp-h">{COPY.enrol.totpTitle}</h2>
        {totpDone ? <p className="portal-notice" role="status">{COPY.enrol.totpDone}</p> : totpUri ? (
          <form onSubmit={verifyTotp}>
            <p>{COPY.enrol.keyHelp}</p>
            <p id="setup-key-label"><strong>{COPY.enrol.keyLabel}</strong></p>
            <p className="portal-key" aria-labelledby="setup-key-label">{setupKeyFrom(totpUri)}</p>
            <p><a className="portal-link" href={totpUri}>{COPY.enrol.linkLabel}</a></p>
            <Field id="code" label={COPY.enrol.codeLabel} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required />
            <button type="submit" className="portal-btn" disabled={busy}>{busy ? COPY.enrol.working : COPY.enrol.verifyButton}</button>
          </form>
        ) : (
          <form onSubmit={startTotp}>
            <p>{COPY.enrol.totpHelp}</p>
            <Field id="password" label={COPY.enrol.passwordLabel} type="password" autoComplete="current-password" required />
            <button type="submit" className="portal-btn secondary" disabled={busy}>{busy ? COPY.enrol.working : COPY.enrol.totpStart}</button>
          </form>
        )}
      </section>

      {secondFactorReady ? (
        <section className="portal-card" aria-labelledby="rc-h">
          <h2 id="rc-h">{COPY.enrol.codesTitle}</h2>
          <p>{COPY.enrol.codesHelp}</p>
          <button type="button" className="portal-btn" onClick={getCodes} disabled={busy}>{COPY.enrol.getCodesButton}</button>
        </section>
      ) : null}
    </>
  )
}
