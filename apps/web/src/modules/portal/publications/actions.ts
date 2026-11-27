'use server'
/**
 * Server actions for the publications screen. Each re-runs the full page guard and takes the account from the session only.
 * The source is the Sample list unless PORTAL_PUBLICATIONS_SOURCE=openalex; the DOI lookup (Crossref) is on unless PORTAL_DOI_LOOKUP=off.
 * Every action is a button press from a signed-in page; none runs while a page renders.
 */
import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { createSampleProfileStore } from '../profile/sampleStore'
import { accountFor } from '../delegation/wiring'
import { createPgPublicationStore } from './pgStore'
import { resolveLookup, resolveSource } from './sources'
import { createPublicationService, type ExportResult, type LookupResult, type PubResult } from './service'

const PATH = '/portal/publications'

function service(action: string, forId?: unknown) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  const pool = getIdentityPool(config.databaseUrl)
  return createPublicationService({ store: createPgPublicationStore(pool), profiles: createSampleProfileStore(pool), source: resolveSource(process.env), lookup: resolveLookup(process.env), getAccount: () => accountFor(PATH, 'publications', action, forId) })
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
export async function lookupDoi(doi: unknown, forId?: unknown): Promise<LookupResult> {
  return service('lookupDoi', forId).lookupDoi(doi)
}
export async function addWork(input: unknown, via: unknown, forId?: unknown): Promise<PubResult> {
  return service('addWork', forId).addWork(input, via)
}
export async function importWorks(text: unknown, filename: unknown, forId?: unknown): Promise<PubResult> {
  return service('importWorks', forId).importFile(text, filename)
}
export async function updateWorkDetails(workId: unknown, input: unknown, forId?: unknown): Promise<PubResult> {
  return service('updateWorkDetails', forId).editWork(workId, input)
}
export async function setWorkFeatured(workId: unknown, featured: unknown, forId?: unknown): Promise<PubResult> {
  return service('setWorkFeatured', forId).setFeatured(workId, featured)
}
export async function setWorkPublic(workId: unknown, isPublic: unknown, forId?: unknown): Promise<PubResult> {
  return service('setWorkPublic', forId).setPublic(workId, isPublic)
}
export async function removeWork(workId: unknown, forId?: unknown): Promise<PubResult> {
  return service('removeWork', forId).remove(workId)
}
export async function exportWorks(format: unknown, forId?: unknown): Promise<ExportResult> {
  return service('exportWorks', forId).exportWorks(format)
}
