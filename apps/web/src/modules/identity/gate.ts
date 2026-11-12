/**
 * Enrolment gate (Addendum C AUTH-01, FPR-01).
 *
 * A session with no second factor may reach only the enrolment screens and sign-out.
 * Pure functions: the caller supplies the session flag and the factor state, so the
 * decision can be tested without a database or the auth library.
 *
 * Default deny: any path not named here is class 'portal', which needs a session AND a
 * second factor. A new endpoint in a later library release is therefore closed until
 * someone classifies it on purpose.
 */

export const PORTAL_BASE = '/portal'
export const AUTH_BASE = '/portal-api/auth'

export type FactorState = {
  /** Registered passkeys (each used with user verification required, so one counts as two factors). */
  passkeys: number
  /** A TOTP secret that has been confirmed with a valid code. */
  totpVerified: boolean
  /** Recovery codes left. Informational: they never count as a second factor on their own. */
  recoveryCodesRemaining: number
}

export type RouteClass = 'public' | 'enrolment' | 'signout' | 'portal' | 'forbidden'

export function hasSecondFactor(f: FactorState): boolean {
  return f.passkeys > 0 || f.totpVerified
}

const PUBLIC = new Set<string>([
  `${PORTAL_BASE}/sign-in`,
  `${AUTH_BASE}/sign-in/email`,
  `${AUTH_BASE}/passkey/generate-authenticate-options`,
  `${AUTH_BASE}/passkey/verify-authentication`,
  // Mid sign-in, before a session exists. The library checks its own signed two-factor cookie.
  `${AUTH_BASE}/two-factor/verify-totp`,
])

const ENROLMENT = new Set<string>([
  `${PORTAL_BASE}/enrol`,
  `${AUTH_BASE}/passkey/generate-register-options`,
  `${AUTH_BASE}/passkey/verify-registration`,
  `${AUTH_BASE}/two-factor/enable`,
  `${AUTH_BASE}/get-session`,
])

const SIGNOUT = new Set<string>([`${AUTH_BASE}/sign-out`])

/** Never reachable: no email or SMS factor (Addendum C section 5.1), no self-registration (5.6). */
const FORBIDDEN = new Set<string>([
  `${AUTH_BASE}/two-factor/send-otp`,
  `${AUTH_BASE}/two-factor/verify-otp`,
  `${AUTH_BASE}/sign-up/email`,
  // The library's own backup codes are stored reversibly (spike S-2 finding F). Recovery codes are
  // issued and checked by ./recoveryCodes instead, so the library's endpoints are closed.
  `${AUTH_BASE}/two-factor/verify-backup-code`,
  `${AUTH_BASE}/two-factor/generate-backup-codes`,
])

/**
 * A plain path is already in the form the allow-lists use: absolute, no encoding, no traversal,
 * no doubled slash, no backslash, no control characters. Anything else is refused outright
 * (class 'forbidden'): whether the library would decode or normalise it is not something this
 * gate relies on.
 */
function isPlain(path: string): boolean {
  if (!path.startsWith('/')) return false
  if (path.includes('//') || path.includes('%') || path.includes('\\')) return false
  if (/[\u0000-\u001f\u007f]/.test(path)) return false
  return !path.split('/').some((seg) => seg === '.' || seg === '..')
}

export function classifyPath(pathname: string): RouteClass {
  if (!isPlain(pathname)) return 'forbidden'
  const p = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  // Closed endpoints are matched without regard to case, so no spelling of them gets through.
  if (FORBIDDEN.has(p.toLowerCase())) return 'forbidden'
  // Allow-list entries are matched exactly, case included: a differently cased spelling is not
  // widened into a public or enrolment path, it falls to 'portal' (session and second factor).
  if (PUBLIC.has(p)) return 'public'
  if (ENROLMENT.has(p)) return 'enrolment'
  if (SIGNOUT.has(p)) return 'signout'
  return 'portal'
}

export type GateInput = {
  hasSession: boolean
  /** null means the factor state could not be read: fail closed. */
  factors: FactorState | null
  pathname: string
}

export type GateDecision =
  | { allow: true }
  | { allow: false; status: 401 | 403 | 404; redirectTo?: string; reason: string }

export function decide({ hasSession, factors, pathname }: GateInput): GateDecision {
  const cls = classifyPath(pathname)
  if (cls === 'forbidden') return { allow: false, status: 404, reason: 'endpoint not offered' }
  if (cls === 'public') return { allow: true }
  if (!hasSession) {
    return { allow: false, status: 401, redirectTo: `${PORTAL_BASE}/sign-in`, reason: 'no session' }
  }
  if (cls === 'signout' || cls === 'enrolment') return { allow: true }
  if (factors && hasSecondFactor(factors)) return { allow: true }
  return {
    allow: false,
    status: 403,
    redirectTo: `${PORTAL_BASE}/enrol`,
    reason: factors ? 'second factor not enrolled' : 'factor state unavailable',
  }
}
