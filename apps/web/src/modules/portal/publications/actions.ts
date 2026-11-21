'use server'
/**
 * Server actions for the publications screen. Each re-runs the full page guard and takes the account from the session only.
 * The sample source is used today; the real one (OpenAlex by ORCID iD) replaces it here, in one line.
 */
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { createSampleProfileStore } from '../profile/sampleStore'
import { accountFor } from '../delegation/wiring'
import { createPgPublicationStore } from './pgStore'
import { sampleSource } from './sampleSource'
import { createPublicationService, type PubResult } from './service'

const PATH = '/portal/publications'

function service(action: string, forId?: unknown) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  const pool = getIdentityPool(config.databaseUrl)
  return createPublicationService({ store: createPgPublicationStore(pool), profiles: createSampleProfileStore(pool), source: sampleSource, getAccount: () => accountFor(PATH, 'publications', action, forId) })
}

export async function harvestWorks(forId?: unknown): Promise<PubResult> {
  return service('harvestWorks', forId).harvest()
}
export async function claimWork(workId: unknown, forId?: unknown): Promise<PubResult> {
  return service('claimWork', forId).claim(workId)
}
export async function rejectWork(workId: unknown, forId?: unknown): Promise<PubResult> {
  return service('rejectWork', forId).reject(workId)
}
export async function duplicateWork(workId: unknown, ofId: unknown, forId?: unknown): Promise<PubResult> {
  return service('duplicateWork', forId).markDuplicate(workId, ofId)
}
