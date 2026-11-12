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

/**
 * 'session' is the user's own session (read it, end it): any session may do that.
 * 'enrolment' adds or changes a factor.
 */
export type RouteClass = 'public' | 'enrolment' | 'session' | 'portal' | 'forbidden'

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
  // Lost device: password and recovery code in one call; it checks both itself (./recoveryPlugin).
  `${AUTH_BASE}/recovery/sign-in`,
])

const ENROLMENT = new Set<string>([
  `${PORTAL_BASE}/enrol`,
  `${AUTH_BASE}/passkey/generate-register-options`,
  `${AUTH_BASE}/passkey/verify-registration`,
  `${AUTH_BASE}/two-factor/enable`,
])

const OWN_SESSION = new Set<string>([`${AUTH_BASE}/get-session`, `${AUTH_BASE}/sign-out`])

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
  if (OWN_SESSION.has(p)) return 'session'
  return 'portal'
}

export type GateInput = {
  hasSession: boolean
  /**
   * Whether the session was made with a second factor (a passkey sign-in, or a completed
   * TOTP or recovery step) or upgraded by enrolling the first factor. A password-only
   * session is not strong, however many factors the account has registered: the password
   * alone must never be enough (AUTH-01). Unknown means not strong.
   */
  sessionStrong: boolean
  /** null means the factor state could not be read: fail closed. */
  factors: FactorState | null
  pathname: string
}

export type GateDecision =
  | { allow: true }
  | { allow: false; status: 401 | 403 | 404; redirectTo?: string; reason: string }

export function decide({ hasSession, sessionStrong, factors, pathname }: GateInput): GateDecision {
  const cls = classifyPath(pathname)
  if (cls === 'forbidden') return { allow: false, status: 404, reason: 'endpoint not offered' }
  if (cls === 'public') return { allow: true }
  if (!hasSession) {
    return { allow: false, status: 401, redirectTo: `${PORTAL_BASE}/sign-in`, reason: 'no session' }
  }
  if (cls === 'session') return { allow: true }

  const registered = factors !== null && hasSecondFactor(factors)
  const signInAgain: GateDecision = {
    allow: false,
    status: 403,
    redirectTo: `${PORTAL_BASE}/sign-in`,
    reason: 'this session was not made with a second factor',
  }

  if (cls === 'enrolment') {
    if (sessionStrong) return { allow: true }
    // A password-only session may enrol the FIRST factor and nothing more: adding a factor to an
    // account that already has one needs a session made with it (Addendum C 5.6).
    if (factors !== null && !registered) return { allow: true }
    return signInAgain
  }

  // cls === 'portal'
  if (registered && sessionStrong) return { allow: true }
  if (factors !== null && !registered) {
    return { allow: false, status: 403, redirectTo: `${PORTAL_BASE}/enrol`, reason: 'second factor not enrolled' }
  }
  if (factors === null) {
    return { allow: false, status: 403, redirectTo: `${PORTAL_BASE}/enrol`, reason: 'factor state unavailable' }
  }
  return signInAgain
}
