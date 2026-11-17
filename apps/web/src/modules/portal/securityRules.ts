/** Small pure rules for the security page, kept out of the component so they can be tested. */
import type { FactorState } from '../identity/gate'

/**
 * A passkey may be removed only if the account keeps a second factor afterwards: another passkey or a confirmed
 * authenticator app. (The server does not enforce this on a direct call: the library's delete endpoint is not ours.
 * Step-up, AUTH-09, is the proper fix; until then this is a guard against a slip, not against an attacker.)
 */
export function canDeletePasskey(factors: Pick<FactorState, 'passkeys' | 'totpVerified'>): boolean {
  return factors.passkeys > 1 || factors.totpVerified
}

/** "Chrome on Windows" from a user-agent string. Plain words, no library; unknown parts are left out. */
export function describeDevice(userAgent: string | null | undefined): string {
  const ua = userAgent ?? ''
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : ''
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iOS/.test(ua) ? 'iOS' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : ''
  if (browser && os) return `${browser} on ${os}`
  return browser || os || 'Unknown device'
}

/** A date and time in plain English, in the viewer's own zone. */
export function formatWhen(value: string | number | Date): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
