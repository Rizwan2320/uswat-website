/**
 * Portal configuration, read from the environment and off by default.
 *
 * The existing Vercel project serves the public site and the CMS. The portal must never
 * answer there (ADR-0020: separate origin), so every part of it stays dark unless the owner
 * sets all four variables on the portal's own project. Nothing here opens a connection.
 */

export type PortalConfig =
  | { enabled: false; reason: string }
  | { enabled: true; origin: string; rpID: string; databaseUrl: string; secret: string }

type Env = Record<string, string | undefined>

const MIN_SECRET_LENGTH = 32
// Addendum C ADR 0014: a passkey bound to the bare domain could be asked for by any subdomain.
const FORBIDDEN_RP_IDS = new Set(['uswat.edu.pk', 'www.uswat.edu.pk'])

export function readPortalConfig(env: Env): PortalConfig {
  if (env.PORTAL_ENABLED !== 'true') return { enabled: false, reason: 'PORTAL_ENABLED is not "true"' }

  const { PORTAL_ORIGIN: rawOrigin, PORTAL_DATABASE_URL: databaseUrl, PORTAL_AUTH_SECRET: secret } = env
  if (!rawOrigin) return { enabled: false, reason: 'PORTAL_ORIGIN is not set' }
  if (!databaseUrl) return { enabled: false, reason: 'PORTAL_DATABASE_URL is not set' }
  if (!secret) return { enabled: false, reason: 'PORTAL_AUTH_SECRET is not set' }
  if (secret.length < MIN_SECRET_LENGTH) {
    return { enabled: false, reason: `PORTAL_AUTH_SECRET is shorter than ${MIN_SECRET_LENGTH} characters` }
  }

  let url: URL
  try {
    url = new URL(rawOrigin)
  } catch {
    return { enabled: false, reason: 'PORTAL_ORIGIN is not a URL' }
  }
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) {
    return { enabled: false, reason: 'PORTAL_ORIGIN must be https (http only on localhost)' }
  }
  if (url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) {
    return { enabled: false, reason: 'PORTAL_ORIGIN must be an origin only (no path, query or credentials)' }
  }
  if (FORBIDDEN_RP_IDS.has(url.hostname)) {
    return { enabled: false, reason: 'PORTAL_ORIGIN host may not be the bare university domain' }
  }
  return { enabled: true, origin: url.origin, rpID: url.hostname, databaseUrl, secret }
}
