/**
 * Page-level gate for the portal's pages. The same rules as the API route (it calls the same
 * `decide` and reads the session through the same `readSessionState`), so a page and the API cannot
 * disagree about who may see what. Returns an instruction; the thin server wrapper turns it into
 * a render, a redirect or a 404.
 */
import { readPortalConfig } from '../identity/config'
import { PORTAL_BASE, classifyPath, decide } from '../identity/gate'
import { readSessionState, type SessionDeps } from '../identity/sessionState'

export type GuardDeps = SessionDeps & { env: Record<string, string | undefined> }

export type GuardResult =
  | { action: 'render'; email: string | null; strong: boolean }
  | { action: 'redirect'; to: string }
  | { action: 'notFound' }

const SIGN_IN = `${PORTAL_BASE}/sign-in`
const HOME = PORTAL_BASE

export async function guardPage(deps: GuardDeps, headers: Headers, pathname: string, now: number): Promise<GuardResult> {
  if (!readPortalConfig(deps.env).enabled) return { action: 'notFound' }
  const cls = classifyPath(pathname)
  if (cls === 'forbidden') return { action: 'notFound' }

  // Public pages (sign-in, recovery) are readable signed out. A visitor who is already fully signed in is sent home;
  // a password-only session is not, so it can sign in properly.
  if (cls === 'public') {
    const homeClass = classifyPath(HOME)
    const state = await readSessionState(deps, headers, homeClass, now)
    if (state.kind === 'active') {
      const d = decide({ hasSession: true, sessionStrong: state.sessionStrong, factors: state.factors, pathname: HOME })
      if (d.allow) return { action: 'redirect', to: HOME }
    }
    return { action: 'render', email: null, strong: false }
  }

  const state = await readSessionState(deps, headers, cls, now)
  if (state.kind === 'expired') return { action: 'redirect', to: `${SIGN_IN}?reason=expired` }

  const d = decide(
    state.kind === 'active'
      ? { hasSession: true, sessionStrong: state.sessionStrong, factors: state.factors, pathname }
      : { hasSession: false, sessionStrong: false, factors: null, pathname },
  )
  if (!d.allow) {
    if (!d.redirectTo) return { action: 'notFound' }
    // A session exists but was made with the password only, on an account that has a second factor: say why.
    const weak = state.kind === 'active' && !state.sessionStrong && d.redirectTo === SIGN_IN
    return { action: 'redirect', to: weak ? `${SIGN_IN}?reason=second-factor` : d.redirectTo }
  }
  return { action: 'render', email: state.kind === 'active' ? state.email : null, strong: state.kind === 'active' && state.sessionStrong }
}
