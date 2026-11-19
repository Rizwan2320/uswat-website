'use server'
/**
 * Server actions for the publications screen. Each re-runs the full page guard and takes the account from the session only.
 * The sample source is used today; the real one (OpenAlex by ORCID iD) replaces it here, in one line.
 */
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { createSampleProfileStore } from '../profile/sampleStore'
import { strongAccount } from '../server'
import { createPgPublicationStore } from './pgStore'
import { sampleSource } from './sampleSource'
import { createPublicationService, type PubResult } from './service'

const PATH = '/portal/publications'

function service() {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  const pool = getIdentityPool(config.databaseUrl)
  return createPublicationService({ store: createPgPublicationStore(pool), profiles: createSampleProfileStore(pool), source: sampleSource, getAccount: () => strongAccount(PATH) })
}

export async function harvestWorks(): Promise<PubResult> {
  return service().harvest()
}
export async function claimWork(workId: unknown): Promise<PubResult> {
  return service().claim(workId)
}
export async function rejectWork(workId: unknown): Promise<PubResult> {
  return service().reject(workId)
}
export async function duplicateWork(workId: unknown, ofId: unknown): Promise<PubResult> {
  return service().markDuplicate(workId, ofId)
}
