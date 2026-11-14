/** The browser's auth client, built on first use (never during server rendering). */
import { passkeyClient } from '@better-auth/passkey/client'
import { createAuthClient } from 'better-auth/client'
import { twoFactorClient } from 'better-auth/client/plugins'

import { AUTH_BASE } from '../identity/gate'
import { SHARED_COOKIE, SHARED_COOKIE_MAX_AGE_S, SHARED_COOKIE_VALUE } from '../identity/sharedComputer'

function build() {
  return createAuthClient({
    baseURL: window.location.origin,
    basePath: AUTH_BASE,
    plugins: [passkeyClient(), twoFactorClient()],
  })
}
let client: ReturnType<typeof build> | null = null
export function authClient() {
  client ??= build()
  return client
}

/** A plain JSON request to one of our own endpoints (recovery). Returns the status and the parsed body. */
export async function postJson(path: string, body: unknown): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  let parsed: Record<string, unknown> | null = null
  try {
    parsed = (await res.json()) as Record<string, unknown>
  } catch {
    parsed = null
  }
  return { status: res.status, body: parsed }
}

/**
 * Full page load to a portal page. Deliberate: after sign-in or sign-out the server must re-read the
 * session cookie and run the page guard, which a client-side transition could serve from cache.
 */
export function go(path: string): void {
  window.location.assign(path)
}

/**
 * "Shared computer" (SES-04): a short-lived cookie the server reads when it makes the session. It can only ask
 * for the stricter 15-minute idle limit. Call it before every sign-in attempt, so it matches the box as ticked.
 */
export function setSharedComputer(on: boolean): void {
  // `Secure` is required for a __Host- cookie; browsers accept it on localhost as well as on https.
  document.cookie = on
    ? `${SHARED_COOKIE}=${SHARED_COOKIE_VALUE}; Path=/; Secure; SameSite=Lax; Max-Age=${SHARED_COOKIE_MAX_AGE_S}`
    : `${SHARED_COOKIE}=; Path=/; Secure; SameSite=Lax; Max-Age=0`
}
