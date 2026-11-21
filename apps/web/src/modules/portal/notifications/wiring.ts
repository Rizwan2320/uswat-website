import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { strongAccount } from '../server'
import { createPgNotificationStore } from './pgStore'
import { createNotificationService } from './service'

export function notificationService(path: string) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createNotificationService({ store: createPgNotificationStore(getIdentityPool(config.databaseUrl)), getAccount: () => strongAccount(path) })
}
