'use server'
import type { ClaimResult } from '../../identity/claimService'
import { claimService } from './wiring'

/** Public on purpose (the person has no account yet); the 256-bit link is what authorises it. Answers only ok, password, or unavailable. */
export async function claimAccount(token: unknown, password: unknown): Promise<ClaimResult> {
  try {
    return await claimService().claim(token, password)
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
