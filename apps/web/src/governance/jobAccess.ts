import { createHash, timingSafeEqual } from 'node:crypto'

import { actorFromRequest } from './roles'

interface JobRequest {
  user?: unknown
  headers: Headers
}

/** Constant-time comparison of two strings (hashing first, so length does not leak either). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

/**
 * Who may run the job queue (`jobs.access.run`). The sweep acts as the system, so a person who can
 * trigger it needs real authority: platform admin or site manager. The scheduler has no user and
 * sends `Authorization: Bearer $CRON_SECRET`; with no secret configured nothing else gets in.
 */
export function canRunJobs(req: JobRequest, secret: string | undefined): boolean {
  if (req.user) {
    const actor = actorFromRequest(req as Parameters<typeof actorFromRequest>[0])
    return actor.kind === 'user' && (actor.role === 'platformAdmin' || actor.role === 'siteManager')
  }
  if (!secret) return false
  const header = req.headers.get('authorization') ?? ''
  return safeEqual(header, `Bearer ${secret}`)
}
