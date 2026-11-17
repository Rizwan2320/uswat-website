'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

import { authClient, postJson } from './client'
import { COPY } from './copy'
import { mapAuthError } from './errors'
import { canDeletePasskey, describeDevice, formatWhen } from './securityRules'

type Passkey = { id: string; name?: string | null; createdAt?: string | Date | null }
type SessionRow = { token: string; userAgent?: string | null; createdAt?: string | Date | null }
const C = COPY.security

export default function SecurityPanel({ totpVerified, recoveryCodesRemaining }: { totpVerified: boolean; recoveryCodesRemaining: number }) {
  const [passkeys, setPasskeys] = useState<Passkey[] | null>(null)
  const [sessions, setSessions] = useState<SessionRow[] | null>(null)
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  const [codes, setCodes] = useState<string[] | null>(null)
  const [codesLeft, setCodesLeft] = useState(recoveryCodesRemaining)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (error) errorRef.current?.focus() }, [error])

  const load = useCallback(async () => {
    try {
      const c = authClient()
      const [pk, ss, me] = await Promise.all([c.passkey.listUserPasskeys(), c.listSessions(), c.getSession()])
      setPasskeys(((pk?.data as Passkey[] | null) ?? []).slice())
      setSessions(((ss?.data as SessionRow[] | null) ?? []).slice())
      setCurrentToken((me?.data as { session?: { token?: string } } | null)?.session?.token ?? null)
    } catch {
      setError(C.loadFailed)
    }
  }, [])
  useEffect(() => { void load() }, [load])

  async function act(label: string, fn: () => Promise<{ error?: unknown } | undefined | void>) {
    setBusy(true); setError(null); setStatus(null)
    try {
      const res = await fn()
      if (res && 'error' in res && res.error) { setError(mapAuthError(res.error)); return }
      setStatus(label)
      await load()
    } catch (e) {
      setError(mapAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  const keepsFactor = canDeletePasskey({ passkeys: passkeys?.length ?? 0, totpVerified })
  const others = (sessions ?? []).filter((s) => s.token !== currentToken)

  return (
    <>
      {error ? <p ref={errorRef} tabIndex={-1} role="alert" className="portal-error">{error}</p> : null}
      <p role="status" className="portal-notice" hidden={!status}>{status}</p>

      <section className="portal-card" aria-labelledby="pk-h">
        <h2 id="pk-h">{C.passkeysTitle}</h2>
        {passkeys === null ? <p>{C.loading}</p> : passkeys.length === 0 ? <p>{C.passkeysNone}</p> : (
          <ul>
            {passkeys.map((p, i) => (
              <li key={p.id}>
                {p.name || `Passkey ${i + 1}`}{p.createdAt ? <> · {C.passkeyAdded} {formatWhen(p.createdAt)}</> : null}{' '}
                {keepsFactor ? (
                  <button
                    type="button"
                    className="portal-btn secondary"
                    disabled={busy}
                    aria-label={`${C.deletePasskey} ${p.name || `passkey ${i + 1}`}`}
                    onClick={() => { if (window.confirm(C.deleteConfirm)) void act(C.done, () => authClient().passkey.deletePasskey({ id: p.id })) }}
                  >
                    {C.deletePasskey}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {passkeys && passkeys.length > 0 && !keepsFactor ? <p className="portal-notice">{C.lastFactor}</p> : null}
        <button type="button" className="portal-btn" disabled={busy} onClick={() => void act(C.done, () => authClient().passkey.addPasskey({ name: `Passkey ${(passkeys?.length ?? 0) + 1}` }))}>
          {busy ? C.working : C.addPasskey}
        </button>
      </section>

      <section className="portal-card" aria-labelledby="rc-h">
        <h2 id="rc-h">{C.codesTitle}</h2>
        <p>{C.codesLeft(codesLeft)}</p>
        {codes ? (
          <>
            <p>{COPY.enrol.codesHelp}</p>
            <ul className="portal-codes" aria-label={C.codesTitle}>{codes.map((c) => <li key={c}>{c}</li>)}</ul>
          </>
        ) : (
          <>
            <p>{C.codesRegenerateHelp}</p>
            <button
              type="button"
              className="portal-btn secondary"
              disabled={busy}
              onClick={() => void act(C.done, async () => {
                const res = await postJson('/recovery/issue', {})
                const list = res.body?.codes
                if (res.status !== 200 || !Array.isArray(list)) return { error: { status: res.status } }
                setCodes(list.map(String)); setCodesLeft(list.length)
              })}
            >
              {C.codesRegenerate}
            </button>
          </>
        )}
      </section>

      <section className="portal-card" aria-labelledby="ss-h">
        <h2 id="ss-h">{C.sessionsTitle}</h2>
        {sessions === null ? <p>{C.loading}</p> : (
          <ul>
            <li>{C.thisDevice}</li>
            {others.map((s) => (
              <li key={s.token}>
                {describeDevice(s.userAgent)}{s.createdAt ? <> · {C.startedAt} {formatWhen(s.createdAt)}</> : null}{' '}
                <button type="button" className="portal-btn secondary" disabled={busy} aria-label={`${C.revoke}: ${describeDevice(s.userAgent)}`} onClick={() => void act(C.done, () => authClient().revokeSession({ token: s.token }))}>
                  {C.revoke}
                </button>
              </li>
            ))}
          </ul>
        )}
        {sessions && others.length === 0 ? <p>{C.sessionsNone}</p> : null}
        {others.length > 0 ? (
          <button type="button" className="portal-btn" disabled={busy} onClick={() => void act(C.done, () => authClient().revokeOtherSessions())}>{C.revokeOthers}</button>
        ) : null}
      </section>
    </>
  )
}
