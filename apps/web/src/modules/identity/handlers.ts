/**
 * Route handlers for the portal's auth API: the switch, then the enrolment gate, then the library.
 *
 * `getAuth` and `loadFactors` are injected and called lazily, so importing this file opens no
 * connection and, with the portal off, no auth object is ever built.
 */
import { readPortalConfig } from './config'
import { decide, classifyPath, type FactorState } from './gate'

export type AuthLike = {
  handler: (req: Request) => Promise<Response>
  api: { getSession: (opts: { headers: Headers }) => Promise<{ user: { id: string }; session: { id: string } } | null> }
}

export type HandlerDeps = {
  env: Record<string, string | undefined>
  getAuth: () => AuthLike
  loadFactors: (userId: string) => Promise<FactorState>
  /** Whether this session was made with a second factor. Throwing counts as not strong. */
  isStrongSession: (sessionId: string) => Promise<boolean>
}

function refusal(status: number, error: string, redirectTo?: string): Response {
  return new Response(JSON.stringify({ error, ...(redirectTo ? { redirectTo } : {}) }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export function createAuthHandlers(deps: HandlerDeps) {
  async function handle(req: Request): Promise<Response> {
    const config = readPortalConfig(deps.env)
    if (!config.enabled) return refusal(404, 'not found')

    const pathname = new URL(req.url).pathname
    const cls = classifyPath(pathname)

    let userId: string | null = null
    let sessionId: string | null = null
    if (cls !== 'public' && cls !== 'forbidden') {
      try {
        const session = await deps.getAuth().api.getSession({ headers: req.headers })
        userId = session?.user.id ?? null
        sessionId = session?.session.id ?? null
      } catch {
        userId = null
        sessionId = null
      }
    }

    let factors: FactorState | null = null
    let sessionStrong = false
    if (userId && sessionId && (cls === 'portal' || cls === 'enrolment')) {
      try {
        factors = await deps.loadFactors(userId)
      } catch {
        factors = null
      }
      try {
        sessionStrong = await deps.isStrongSession(sessionId)
      } catch {
        sessionStrong = false
      }
    }

    const d = decide({ hasSession: userId !== null, sessionStrong, factors, pathname })
    if (!d.allow) return refusal(d.status, d.status === 404 ? 'not found' : d.reason, d.redirectTo)
    return deps.getAuth().handler(req)
  }

  return { GET: handle, POST: handle }
}
