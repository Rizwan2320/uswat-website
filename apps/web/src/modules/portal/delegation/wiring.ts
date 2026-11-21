import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { isSubjectId } from '../review/rules'
import { resolveAccount, type ActingAccount } from './resolve'
import { strongAccount, strongReviewer } from '../server'
import { createPgDelegationStore } from './pgStore'
import { createDelegationService } from './service'
import type { Authorised, Section } from './types'

function store() {
  const config = readPortalConfig(process.env)
  if (!config.enabled) throw new Error('portal disabled')
  return createPgDelegationStore(getIdentityPool(config.databaseUrl))
}

export function delegationService(path: string) {
  return createDelegationService({ store: store(), getSession: () => strongReviewer(path) })
}

/** `strongAccount` first (full page guard, actor from the session), then the grant check in `resolveAccount`. */
export async function accountFor(path: string, section: Section, action: string, forId: unknown): Promise<ActingAccount | null> {
  const me = await strongAccount(path)
  if (!me) return null
  return resolveAccount(store(), me, section, action, forId, Date.now())
}

/** For a page opened with `?for=`: the grantor and the grant's end, or null (shown as 404). Records the access as `view`. */
export async function pageFor(path: string, section: Section, actorId: string, forId: unknown): Promise<Authorised | null> {
  if (!isSubjectId(forId) || forId === actorId) return null
  return store().authorise(actorId, forId, section, 'view', Date.now())
}
