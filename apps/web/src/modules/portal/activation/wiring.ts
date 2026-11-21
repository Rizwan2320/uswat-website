import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { strongReviewer } from '../server'
import { createPgActivationStore } from './pgStore'
import { createActivationService } from './service'

export function activationService(path: string) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createActivationService({ store: createPgActivationStore(getIdentityPool(config.databaseUrl)), getHead: () => strongReviewer(path) })
}

export async function isHeadAccount(userId: string): Promise<boolean> {
  const config = readPortalConfig(process.env)
  if (!config.enabled) return false
  return createPgActivationStore(getIdentityPool(config.databaseUrl)).isHead(userId).catch(() => false)
}
