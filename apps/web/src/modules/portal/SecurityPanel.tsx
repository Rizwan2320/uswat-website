'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

import { authClient, go, postJson } from './client'
import { COPY } from './copy'
import { mapAuthError } from './errors'
import Field from './Field'
import { canDeletePasskey, describeDevice, describeEvent, formatWhen, networkLabel, sessionNetwork, type EventView } from './securityRules'

type Passkey = { id: string; name?: string | null; createdAt?: string | Date | null; deviceType?: string | null; backedUp?: boolean | null }
type SessionRow = { token: string; userAgent?: string | null; ipAddress?: string | null; createdAt?: string | Date | null }
const C = COPY.security

/** Step-up (AUTH-09): prove the second factor again. A passkey makes a new session; a code proves it in place. */
function ConfirmCard({ hasPasskey, hasTotp }: { hasPasskey: boolean; hasTotp: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (error) errorRef.current?.focus() }, [error])

  async function run(fn: () => Promise<{ error?: unknown } | undefined>) {
    setBusy(true); setError(null)
    try {
      const res = await fn()
      if (res?.error) { setError(mapAuthError(res.error)); return }
      go('/portal/security')
    } catch (e) {
      setError(mapAuthError(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="portal-card" aria-labelledby="cf-h">
      <h2 id="cf-h">{C.confirmTitle}</h2>
      <p>{C.confirmHelp}</p>
      {error ? <p ref={errorRef} tabIndex={-1} role="alert" className="portal-error">{error}</p> : null}
      {hasPasskey ? (
        <button type="button" className="portal-btn" disabled={busy} onClick={() => void run(() => authClient().signIn.passkey())}>
          {busy ? C.working : C.confirmPasskey}
        </button>
      ) : null}
      {hasTotp ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const code = String(new FormData(e.currentTarget).get('code') ?? '').replace(/\s/g, '')
            void run(() => authClient().twoFactor.verifyTotp({ code }))
          }}
        >
          <Field id="confirm-code" label={C.confirmTotpLabel} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required name="code" />
          <button type="submit" className="portal-btn secondary" disabled={busy}>{busy ? C.working : C.confirmTotpButton}</button>
        </form>
      ) : null}
    </section>
  )
}

export default function SecurityPanel({
  totpVerified,
  hasPasskey,
  fresh,
  recoveryCodesRemaining,
  events,
}: {
  totpVerified: boolean
  hasPasskey: boolean
  fresh: boolean
  recoveryCodesRemaining: number
  events: EventView[]
}) {
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
      if (res && 'error' in res && res.error) {
        // The proof ran out while the page was open: ask again instead of showing a vague failure.
        if ((res.error as { status?: number }).status === 403) { setError(C.confirmNeeded); setTimeout(() => go('/portal/security'), 1500); return }
        setError(mapAuthError(res.error)); return
      }
      setStatus(label)
      await load()
    } catch (e) {
      setError(mapAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  /** Sign out everywhere / This wasn't me. On success every session is gone, so go to sign-in with a notice. */
  async function protect(path: string, reason: 'signed-out-everywhere' | 'not-me') {
    setBusy(true); setError(null); setStatus(null)
    try {
      const res = await postJson(path, {})
      if (res.status !== 200) { setError(C.actionFailed); setBusy(false); return }
      go(`/portal/sign-in?reason=${reason === 'not-me' && res.body?.alerted === false ? 'not-me-no-alert' : reason}`)
    } catch {
      setError(C.actionFailed)
      setBusy(false)
    }
  }

  const keepsFactor = canDeletePasskey({ passkeys: passkeys?.length ?? 0, totpVerified })
  const others = (sessions ?? []).filter((s) => s.token !== currentToken)

  return (
    <>
      {error ? <p ref={errorRef} tabIndex={-1} role="alert" className="portal-error">{error}</p> : null}
      <p role="status" className="portal-notice" hidden={!status}>{status}</p>

      {fresh ? null : <ConfirmCard hasPasskey={hasPasskey} hasTotp={totpVerified} />}

      <section className="portal-card" aria-labelledby="pk-h">
        <h2 id="pk-h">{C.passkeysTitle}</h2>
        {passkeys === null ? <p>{C.loading}</p> : passkeys.length === 0 ? <p>{C.passkeysNone}</p> : (
          <ul>
            {passkeys.map((p, i) => (
              <li key={p.id}>
                {p.name || `Passkey ${i + 1}`}{p.createdAt ? <> · {C.passkeyAdded} {formatWhen(p.createdAt)}</> : null} · {p.deviceType === 'multiDevice' || p.backedUp ? C.passkeySynced : C.passkeyDeviceOnly}{' '}
                {keepsFactor && fresh ? (
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
        {fresh ? <button type="button" className="portal-btn" disabled={busy} onClick={() => void act(C.done, () => authClient().passkey.addPasskey({ name: `Passkey ${(passkeys?.length ?? 0) + 1}` }))}>
          {busy ? C.working : C.addPasskey}
        </button> : null}
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
            {fresh ? <button
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
            </button> : null}
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
                {describeDevice(s.userAgent)} · {C.network} {sessionNetwork(s.ipAddress)}{s.createdAt ? <> · {C.startedAt} {formatWhen(s.createdAt)}</> : null}{' '}
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
        <p className="hint">{C.networkNote}</p>
      </section>

      <section className="portal-card" aria-labelledby="ev-h" data-testid="security-events">
        <h2 id="ev-h">{C.eventsTitle}</h2>
        <p>{C.eventsIntro}</p>
        {events.length === 0 ? <p>{C.eventsNone}</p> : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <caption className="portal-visually-hidden">{C.eventsCaption}</caption>
              <thead>
                <tr><th scope="col">{C.colWhen}</th><th scope="col">{C.colWhat}</th><th scope="col">{C.colNetwork}</th><th scope="col">{C.colResult}</th></tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const d = describeEvent(e.type, e.outcome)
                  return (
                    <tr key={e.id}>
                      <td>{formatWhen(e.at)}</td>
                      <td>{d.text}</td>
                      <td>{networkLabel(e.ipPrefix)}</td>
                      <td>{d.failed ? C.resultFailed : C.resultOk}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {events.length >= 50 ? <p className="hint">{C.eventsLimit(50)}</p> : null}
      </section>

      <section className="portal-card" aria-labelledby="wr-h">
        <h2 id="wr-h">{C.wrongTitle}</h2>
        <p>{C.everywhereHelp}</p>
        <button
          type="button"
          className="portal-btn secondary"
          disabled={busy}
          onClick={() => { if (window.confirm(C.everywhereConfirm)) void protect('/security/sign-out-everywhere', 'signed-out-everywhere') }}
        >
          {busy ? C.working : C.everywhere}
        </button>
        <p>{C.notMeHelp}</p>
        <button
          type="button"
          className="portal-btn danger"
          disabled={busy}
          onClick={() => { if (window.confirm(C.notMeConfirm)) void protect('/security/not-me', 'not-me') }}
        >
          {busy ? C.working : C.notMe}
        </button>
        <p className="hint">{C.notMeNote}</p>
      </section>
    </>
  )
}
