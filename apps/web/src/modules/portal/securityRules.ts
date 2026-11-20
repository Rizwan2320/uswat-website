/** Small pure rules for the security page, kept out of the component so they can be tested. */
import { ipPrefix } from '../identity/clientAddress'
import type { FactorState } from '../identity/gate'
import { isEventType, type EventType } from '../identity/securityEvents'
import { COPY } from './copy'

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

/** What the page needs from one logged event. `at` is an ISO string so it can cross from server to browser. */
export type EventView = { id: string; type: string; outcome: string; ipPrefix: string | null; at: string }

/** Plain words for an event. A type this build does not know (a later release added one) gets a neutral line, never a crash. */
export function describeEvent(type: string, outcome: string): { text: string; failed: boolean } {
  const text = isEventType(type) ? COPY.security.eventText[type satisfies EventType] : COPY.security.eventUnknown
  return { text, failed: outcome === 'failure' }
}

/** "203.0.113.x" for an IPv4 prefix, the prefix itself for IPv6, and a plain word when there is none. */
export function networkLabel(prefix: string | null | undefined): string {
  if (!prefix) return COPY.security.networkUnknown
  const v4 = /^(\d+\.\d+\.\d+)\.0\/24$/.exec(prefix)
  return v4 ? `${v4[1]}.x` : prefix
}

/** The label for a session's network, from the address the library stored (shown as a prefix only, never in full). */
export function sessionNetwork(address: string | null | undefined): string {
  return networkLabel(ipPrefix(address))
}
