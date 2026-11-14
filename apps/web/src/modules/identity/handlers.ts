/**
 * Route handlers for the portal's auth API: the switch, then the enrolment gate, then the library.
 *
 * `getAuth` and `loadFactors` are injected and called lazily, so importing this file opens no
 * connection and, with the portal off, no auth object is ever built.
 */
import { readPortalConfig } from './config'
import { AUTH_BASE, decide, classifyPath, type FactorState } from './gate'
import { readSessionState, type SessionLookup } from './sessionState'
import type { SignInThrottle } from './signInThrottle'

export type AuthLike = {
  handler: (req: Request) => Promise<Response>
  api: {
    getSession: (opts: { headers: Headers; query?: { disableRefresh?: boolean } }) => Promise<SessionLookup | null>
  }
}

export type HandlerDeps = {
  env: Record<string, string | undefined>
  getAuth: () => AuthLike
  loadFactors: (userId: string) => Promise<FactorState>
  /** Whether this session was made with a second factor. Throwing counts as not strong. */
  isStrongSession: (sessionId: string) => Promise<boolean>
  /** Epoch ms of this session's last second-factor proof (step-up). Absent or throwing means not fresh. */
  lastVerifiedAt?: (sessionId: string) => Promise<number | null>
  /** Deletes the session row (idle timeout or absolute lifetime reached). */
  endSession: (sessionId: string) => Promise<void>
  /** Records activity; the store writes at most once a minute. Errors are ignored by the caller. */
  touchSession: (sessionId: string, now: number) => Promise<void>
  /** Progressive delay on password sign-in (ABU-01). */
  signInThrottle: SignInThrottle
}

const SIGN_IN = `${AUTH_BASE}/sign-in/email`
/** Also takes a password, so it is also a channel for guessing one. Counted on its own counters (see signInThrottle). */
const RECOVERY_SIGN_IN = `${AUTH_BASE}/recovery/sign-in`

/** Client address as Vercel passes it. Only a counter key: a wrong value weakens the per-address delay, nothing else. */
function clientAddress(req: Request): string {
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  const fwd = req.headers.get('x-forwarded-for')
  return fwd ? (fwd.split(',')[0] ?? '').trim() || 'unknown' : 'unknown'
}

/** The email in a sign-in body, read from a clone so the library still gets the body. '' if unreadable. */
async function signInEmail(req: Request): Promise<string> {
  try {
    const text = (await req.clone().text()).slice(0, 4_096)
    const email = (JSON.parse(text) as { email?: unknown }).email
    return typeof email === 'string' ? email : ''
  } catch {
    return ''
  }
}

function refusal(status: number, error: string, redirectTo?: string): Response {
  return new Response(JSON.stringify({ error, ...(redirectTo ? { redirectTo } : {}) }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export function createAuthHandlers(deps: HandlerDeps) {
  /** Password sign-in, and recovery sign-in (which also checks a password), with the progressive delay around them (ABU-01). Status alone tells failure from success. */
  async function throttledSignIn(req: Request): Promise<Response> {
    const channel = new URL(req.url).pathname === RECOVERY_SIGN_IN ? ('recovery' as const) : ('password' as const)
    const target = { email: await signInEmail(req), address: clientAddress(req), channel }
    try {
      const verdict = await deps.signInThrottle.check(target, Date.now())
      if (!verdict.allowed) {
        const res = refusal(429, 'too many attempts, wait and try again')
        res.headers.set('retry-after', String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))))
        return res
      }
    } catch {
      return refusal(503, 'try again shortly')
    }
    const res = await deps.getAuth().handler(req)
    // 401 is a wrong password or unknown email; 200 means the password was right (a session, or the second-factor step).
    // Anything else (the library's own 429, a 400, a 500) says nothing about the password.
    if (res.status === 401) await deps.signInThrottle.failed(target, Date.now()).catch(() => {})
    else if (res.status === 200 && target.email) await deps.signInThrottle.succeeded(target).catch(() => {})
    return res
  }

  async function handle(req: Request): Promise<Response> {
    const config = readPortalConfig(deps.env)
    if (!config.enabled) return refusal(404, 'not found')

    const pathname = new URL(req.url).pathname
    const cls = classifyPath(pathname)

    if (req.method === 'POST' && (pathname === SIGN_IN || pathname === RECOVERY_SIGN_IN)) return throttledSignIn(req)

    const now = Date.now()
    const state = await readSessionState(deps, req.headers, cls, now)
    if (state.kind === 'expired') return refusal(401, 'session expired', '/portal/sign-in')

    const d = decide(
      state.kind === 'active'
        ? { hasSession: true, sessionStrong: state.sessionStrong, factors: state.factors, pathname, verifiedAt: state.verifiedAt, now }
        : { hasSession: false, sessionStrong: false, factors: null, pathname },
    )
    if (!d.allow) return refusal(d.status, d.status === 404 ? 'not found' : d.reason, d.redirectTo)
    return deps.getAuth().handler(req)
  }

  return { GET: handle, POST: handle }
}
