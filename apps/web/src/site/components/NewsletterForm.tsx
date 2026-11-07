'use client'

import { useId, useRef, useState, type FormEvent } from 'react'

import { useI18n } from './I18n'
import { ArrowRightIcon } from './icons'
import styles from './NewsletterForm.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Status = { kind: 'idle' } | { kind: 'error' | 'ok'; message: string }

/* noValidate form with inline messages in an aria-live region, disabled while sending, no double submit, no alert().
   Posts JSON to /api/newsletter. The route answers 503 until a provider is configured, and this form shows that
   honestly instead of claiming success. */
export default function NewsletterForm() {
  const { t } = useI18n()
  const inputId = useId()
  const sending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending.current) return
    const form = e.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const company = String(data.get('company') ?? '') // honeypot
    if (!EMAIL_RE.test(email)) {
      setStatus({ kind: 'error', message: 'Please enter a valid email address.' })
      return
    }
    sending.current = true
    setBusy(true)
    setStatus({ kind: 'idle' })
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, company }),
      })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string }
      if (res.ok && body.ok) {
        setStatus({ kind: 'ok', message: body.message ?? 'Thank you for subscribing.' })
        form.reset()
      } else {
        setStatus({ kind: 'error', message: body.message ?? 'Could not subscribe. Please try again.' })
      }
    } catch {
      setStatus({ kind: 'error', message: 'Network error. Please try again.' })
    } finally {
      sending.current = false
      setBusy(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label htmlFor={inputId} className="visually-hidden">Your email address</label>
      <div className={styles.field}>
        <input id={inputId} name="email" type="email" inputMode="email" autoComplete="email" placeholder="Your Email Address" className={styles.input} aria-describedby={`${inputId}-msg`} />
        <button type="submit" className={styles.go} disabled={busy} aria-label={t('Subscribe')}>
          <ArrowRightIcon className="flip" />
        </button>
      </div>
      {/* Honeypot: hidden from people, visible to naive bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <p id={`${inputId}-msg`} className={styles.msg} role="status" aria-live="polite" data-kind={status.kind}>
        {status.kind === 'idle' ? '' : status.message}
      </p>
    </form>
  )
}
