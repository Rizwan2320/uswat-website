/** Builds the bridge from the environment and the session's pool. Nothing here reads a request value. */
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { createPgPublicationStore } from '../publications/pgStore'
import { createPgBridgeStore } from './pgStore'
import { readBridgeConfig } from './sender'
import { syncPublicPage, type SyncOutcome } from './service'

function deps() {
  const config = readPortalConfig(process.env)
  if (!config.enabled) return null
  const pool = getIdentityPool(config.databaseUrl)
  return { store: createPgBridgeStore(pool), publications: createPgPublicationStore(pool), config: readBridgeConfig(process.env) }
}

export async function sendPublicPage(accountId: string, force = false): Promise<SyncOutcome> {
  const d = deps()
  return d ? syncPublicPage(d, accountId, { force }) : { status: 'off' }
}

/** After an approval: never throws and never blocks the approval, whatever happens. */
export async function sendAfterApproval(accountId: string): Promise<void> {
  try {
    await sendPublicPage(accountId, true)
  } catch {
    /* stored as "waiting" when the failure was a send; any other failure is left for the person's button */
  }
}

export type PublicPageStatus = { configured: boolean; linked: boolean; lastOkAt: number | null; lastAttemptAt: number | null; failed: boolean; slug: string | null; siteOrigin: string | null }

export async function readPublicPageStatus(accountId: string): Promise<PublicPageStatus> {
  const d = deps()
  if (!d) return { configured: false, linked: false, lastOkAt: null, lastAttemptAt: null, failed: false, slug: null, siteOrigin: null }
  const [src, st] = await Promise.all([d.store.source(accountId), d.store.state(accountId)])
  return {
    configured: d.config !== null,
    linked: src.recordRef !== null,
    slug: src.recordRef,
    siteOrigin: d.config?.siteUrl ?? null,
    lastOkAt: st?.lastOkAt?.getTime() ?? null,
    lastAttemptAt: st?.lastAttemptAt.getTime() ?? null,
    failed: !!st && st.lastError !== null,
  }
}
