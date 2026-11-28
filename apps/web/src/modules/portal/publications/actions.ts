'use server'
/**
 * Server actions for the publications screen. Each re-runs the full page guard and takes the account from the session only.
 * The source is the Sample list unless PORTAL_PUBLICATIONS_SOURCE=openalex; the DOI lookup (Crossref) is on unless PORTAL_DOI_LOOKUP=off.
 * Every action is a button press from a signed-in page; none runs while a page renders.
 */
import { after } from 'next/server'

import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { createSampleProfileStore } from '../profile/sampleStore'
import { sendPublicPage } from '../bridge/wiring'
import { accountFor } from '../delegation/wiring'
import { createPgPublicationStore } from './pgStore'
import { resolveLookup, resolveSource } from './sources'
import { createPublicationService, type ExportResult, type LookupResult, type PubResult } from './service'

const PATH = '/portal/publications'

function service(action: string, forId?: unknown, onAccount?: (id: string) => void) {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  const pool = getIdentityPool(config.databaseUrl)
  return createPublicationService({
    store: createPgPublicationStore(pool),
    profiles: createSampleProfileStore(pool),
    source: resolveSource(process.env),
    lookup: resolveLookup(process.env),
    getAccount: async () => {
      const a = await accountFor(PATH, 'publications', action, forId)
      if (a) onAccount?.(a.id)
      return a
    },
  })
}

/**
 * A change to the list: when it succeeds, schedule a send to the public page after the response (Next `after`), so the click is
 * not slowed and a failure is only stored as "waiting". An unchanged message is skipped by its stored hash (ADR-0029, stage 2).
 */
async function changing<T extends { ok: boolean }>(action: string, forId: unknown, run: (s: ReturnType<typeof service>) => Promise<T>): Promise<T> {
  let accountId: string | null = null
  const result = await run(service(action, forId, (id) => { accountId = id }))
  if (result.ok && accountId) {
    const id: string = accountId
    after(async () => {
      try {
        await sendPublicPage(id)
      } catch {
        /* stored or ignored: the person's button still works */
      }
    })
  }
  return result
}

export async function harvestWorks(forId?: unknown): Promise<PubResult> {
  return changing('harvestWorks', forId, (s) => s.harvest())
}
export async function claimWork(workId: unknown, forId?: unknown): Promise<PubResult> {
  return changing('claimWork', forId, (s) => s.claim(workId))
}
export async function rejectWork(workId: unknown, forId?: unknown): Promise<PubResult> {
  return changing('rejectWork', forId, (s) => s.reject(workId))
}
export async function duplicateWork(workId: unknown, ofId: unknown, forId?: unknown): Promise<PubResult> {
  return changing('duplicateWork', forId, (s) => s.markDuplicate(workId, ofId))
}
export async function lookupDoi(doi: unknown, forId?: unknown): Promise<LookupResult> {
  return service('lookupDoi', forId).lookupDoi(doi)
}
export async function addWork(input: unknown, via: unknown, forId?: unknown): Promise<PubResult> {
  return changing('addWork', forId, (s) => s.addWork(input, via))
}
export async function importWorks(text: unknown, filename: unknown, forId?: unknown): Promise<PubResult> {
  return changing('importWorks', forId, (s) => s.importFile(text, filename))
}
export async function updateWorkDetails(workId: unknown, input: unknown, forId?: unknown): Promise<PubResult> {
  return changing('updateWorkDetails', forId, (s) => s.editWork(workId, input))
}
export async function setWorkFeatured(workId: unknown, featured: unknown, forId?: unknown): Promise<PubResult> {
  return changing('setWorkFeatured', forId, (s) => s.setFeatured(workId, featured))
}
export async function setWorkPublic(workId: unknown, isPublic: unknown, forId?: unknown): Promise<PubResult> {
  return changing('setWorkPublic', forId, (s) => s.setPublic(workId, isPublic))
}
export async function removeWork(workId: unknown, forId?: unknown): Promise<PubResult> {
  return changing('removeWork', forId, (s) => s.remove(workId))
}
export async function exportWorks(format: unknown, forId?: unknown): Promise<ExportResult> {
  return service('exportWorks', forId).exportWorks(format)
}

export type UpdatePublicPageResult = { ok: true; status: 'sent' | 'unchanged' } | { ok: false; error: 'session' | 'off' | 'not-linked' | 'failed' }
/** The "Update my public page" button: sends the approved profile and the Public works to the university website (ADR-0029). */
export async function updatePublicPage(forId?: unknown): Promise<UpdatePublicPageResult> {
  const account = await accountFor(PATH, 'publications', 'updatePublicPage', forId)
  if (!account) return { ok: false, error: 'session' }
  const r = await sendPublicPage(account.id, true)
  if (r.status === 'sent' || r.status === 'unchanged') return { ok: true, status: r.status }
  return { ok: false, error: r.status === 'failed' ? 'failed' : r.status }
}
