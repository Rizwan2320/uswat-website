'use server'
/**
 * The Registrar actions. Each re-runs the full page guard (strong session, lifetime, second factor, freshness, a registered passkey)
 * and takes the Verifier from the session only; the request carries the subject, the values and the source note.
 */
import { after } from 'next/server'

import { sendAfterApproval, sendPublicPage } from '../bridge/wiring'
import { registrarService } from './wiring'
import type { LeaveResult, SaveResult } from './service'

export async function saveFixedFields(input: unknown): Promise<SaveResult> {
  return registrarService('/portal/registrar').save(input)
}

/** Ends the account, then (after the answer has gone back) tells the public site. A failed send never undoes the departure. */
export async function markAsLeft(input: unknown): Promise<LeaveResult> {
  const r = await registrarService('/portal/registrar').leave(input)
  if (r.ok) after(() => sendAfterApproval(r.subjectId))
  return r
}

export type ResendResult = { ok: true } | { ok: false; error: 'session' | 'unavailable' | 'failed' }

/** The "Send again" button after a failed send. Only for a person already marked as left, and only for a Registrar. */
export async function resendDeparture(subjectId: unknown): Promise<ResendResult> {
  const opened = await registrarService('/portal/registrar').open(subjectId)
  if (!opened.ok) return opened
  if (opened.detail.state !== 'left') return { ok: false, error: 'unavailable' }
  try {
    const out = await sendPublicPage(opened.detail.subjectId, true)
    return out.status === 'sent' || out.status === 'unchanged' ? { ok: true } : { ok: false, error: 'failed' }
  } catch {
    return { ok: false, error: 'failed' }
  }
}
