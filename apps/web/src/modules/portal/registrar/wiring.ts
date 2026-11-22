/** Builds the Registrar service for pages and actions from the session. Nothing here reads a request value. */
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { strongVerifier } from '../server'
import { createPgRegistrarStore } from './pgStore'
import { createRegistrarService } from './service'

export function registrarService(path: string) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createRegistrarService({ store: createPgRegistrarStore(getIdentityPool(config.databaseUrl)), getVerifier: () => strongVerifier(path) })
}

/** True when the signed-in account may use the Registrar screen; used to show the link. Needs a registered passkey. */
export async function isVerifierAccount(userId: string): Promise<boolean> {
  const config = readPortalConfig(process.env)
  if (!config.enabled) return false
  return createPgRegistrarStore(getIdentityPool(config.databaseUrl)).isVerifier(userId).catch(() => false)
}
