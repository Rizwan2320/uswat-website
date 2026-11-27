'use server'
/**
 * Server actions for the profile screen. Each one re-runs the full page guard (strong session, lifetime, second factor)
 * before doing anything, and takes the account from that session only. Next checks the request's Origin against the host
 * for server actions, which is the CSRF defence here; the identity API's own origin check is not involved.
 */
import { getIdentityPool } from '../../identity/db'
import { readPortalConfig } from '../../identity/config'
import { accountFor } from '../delegation/wiring'
import { strongAccount } from '../server'
import { createProfileService, type ActionResult } from './service'
import { createSampleProfileStore } from './sampleStore'

const PATH = '/portal/profile'

function service(forId?: unknown) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createProfileService({ store: createSampleProfileStore(getIdentityPool(config.databaseUrl)), getAccount: () => (forId === undefined ? strongAccount(PATH) : accountFor(PATH, 'profile', 'saveProfile', forId)) })
}

/** `forId`: save the draft of a person who granted you the `profile` section. Submit and withdraw are sign-offs and never delegated. */
export async function saveProfile(input: unknown, forId?: unknown): Promise<ActionResult> {
  return service(forId).save(input)
}
export async function submitProfile(): Promise<ActionResult> {
  return service().submit()
}
/** For a head of department or the Registrar only (the store refuses anyone else): saves nothing itself, publishes the saved draft. */
export async function publishProfile(): Promise<ActionResult> {
  return service().publish()
}
export async function withdrawProfile(): Promise<ActionResult> {
  return service().withdraw()
}
