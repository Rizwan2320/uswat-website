/**
 * Request signing for the portal-to-site message (ADR-0029). HMAC-SHA256 with a shared secret over `timestamp.sha256(body)`.
 * A request is accepted only when the secret is configured, both headers are present, the timestamp is within five minutes,
 * and the signature matches (compared in constant time). The caller answers 404 for every other case so the route does not
 * reveal that it exists.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const HEADER_TIME = 'x-uswat-timestamp'
export const HEADER_SIG = 'x-uswat-signature'
export const MAX_AGE_MS = 5 * 60 * 1000
export const MIN_SECRET_LENGTH = 32

const bodyHash = (body: string) => createHash('sha256').update(body).digest('hex')
const mac = (secret: string, timestamp: string, body: string) => createHmac('sha256', secret).update(`${timestamp}.${bodyHash(body)}`).digest('hex')

export function signRequest(secret: string, body: string, now: number = Date.now()): Record<string, string> {
  const timestamp = String(now)
  return { [HEADER_TIME]: timestamp, [HEADER_SIG]: mac(secret, timestamp, body) }
}

export function verifyRequest(secret: string | undefined, body: string, headers: { get(name: string): string | null }, now: number = Date.now()): boolean {
  if (!secret || secret.length < MIN_SECRET_LENGTH) return false
  const timestamp = headers.get(HEADER_TIME)
  const sig = headers.get(HEADER_SIG)
  if (!timestamp || !sig || !/^\d{10,16}$/.test(timestamp) || !/^[0-9a-f]{64}$/.test(sig)) return false
  if (Math.abs(now - Number(timestamp)) > MAX_AGE_MS) return false
  const a = Buffer.from(mac(secret, timestamp, body), 'hex')
  const b = Buffer.from(sig, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
