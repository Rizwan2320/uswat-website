'use server'
/**
 * Server actions for the profile screen. Each one re-runs the full page guard (strong session, lifetime, second factor)
 * before doing anything, and takes the account from that session only. Next checks the request's Origin against the host
 * for server actions, which is the CSRF defence here; the identity API's own origin check is not involved.
 */
import { getIdentityPool } from '../../identity/db'
import { readPortalConfig } from '../../identity/config'
import { strongAccount } from '../server'
import { createProfileService, type ActionResult } from './service'
import { createSampleProfileStore } from './sampleStore'

const PATH = '/portal/profile'

function service() {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createProfileService({ store: createSampleProfileStore(getIdentityPool(config.databaseUrl)), getAccount: () => strongAccount(PATH) })
}

export async function saveProfile(input: unknown): Promise<ActionResult> {
  return service().save(input)
}
export async function submitProfile(): Promise<ActionResult> {
  return service().submit()
}
export async function withdrawProfile(): Promise<ActionResult> {
  return service().withdraw()
}
