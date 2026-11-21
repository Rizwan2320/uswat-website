/** Builds the reviewer service for pages and actions from the session. Nothing here reads a request value. */
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { strongReviewer } from '../server'
import { createPgReviewStore } from './pgStore'
import { createReviewService } from './service'

export function reviewService(path: string) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createReviewService({ store: createPgReviewStore(getIdentityPool(config.databaseUrl)), getReviewer: () => strongReviewer(path) })
}

/** True when the signed-in account may use the queue; used to show the link on the home page. */
export async function isReviewerAccount(userId: string): Promise<boolean> {
  const config = readPortalConfig(process.env)
  if (!config.enabled) return false
  return createPgReviewStore(getIdentityPool(config.databaseUrl)).isReviewer(userId).catch(() => false)
}
