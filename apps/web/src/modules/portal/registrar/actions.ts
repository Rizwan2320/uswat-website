'use server'
/**
 * The one Registrar action. It re-runs the full page guard (strong session, lifetime, second factor, freshness, a registered passkey)
 * and takes the Verifier from the session only; the request carries the subject, the four values and the source note.
 */
import { registrarService } from './wiring'
import type { SaveResult } from './service'

export async function saveFixedFields(input: unknown): Promise<SaveResult> {
  return registrarService('/portal/registrar').save(input)
}
