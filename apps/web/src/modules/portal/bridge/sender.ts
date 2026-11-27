/**
 * Sends one signed message to the public site (ADR-0029). Called only after a commit, from a server action or the approval
 * step, never from a page render (FF-07). The address comes from the environment, never from a request. Plain http is
 * accepted for localhost only, so a mistaken setting cannot send a signed message over an open network.
 */
import { BRIDGE_PATH, type BridgeMessage } from './contract'
import { signRequest } from './signing'

export type BridgeConfig = { siteUrl: string; secret: string }
export type SendResult = { ok: true } | { ok: false; reason: 'config' | 'network' | 'rejected' | 'server' }

export const SEND_TIMEOUT_MS = 8000

/** Both settings must be present and the address must be an https origin (or http on localhost). Otherwise the bridge is off. */
export function readBridgeConfig(env: Record<string, string | undefined>): BridgeConfig | null {
  const siteUrl = env.PORTAL_BRIDGE_SITE_URL?.trim()
  const secret = env.PORTAL_BRIDGE_SECRET
  if (!siteUrl || !secret || secret.length < 32) return null
  let u: URL
  try {
    u = new URL(siteUrl)
  } catch {
    return null
  }
  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
  if (!(u.protocol === 'https:' || (local && u.protocol === 'http:')) || u.username || u.password) return null
  return { siteUrl: u.origin, secret }
}

export async function sendMessage(config: BridgeConfig, message: BridgeMessage, fetchImpl: typeof fetch = fetch, now: number = Date.now()): Promise<SendResult> {
  const body = JSON.stringify(message)
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), SEND_TIMEOUT_MS)
  try {
    const res = await fetchImpl(`${config.siteUrl}${BRIDGE_PATH}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...signRequest(config.secret, body, now) },
      body,
      signal: ctl.signal,
      redirect: 'error',
    })
    if (res.ok) return { ok: true }
    // The site answers 404 for a bad signature, an unknown person or a refused message; the body is never read or stored.
    return { ok: false, reason: res.status >= 500 ? 'server' : 'rejected' }
  } catch {
    return { ok: false, reason: 'network' }
  } finally {
    clearTimeout(timer)
  }
}
