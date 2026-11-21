import { readPortalConfig } from '../../identity/config'
import { getIdentityPool } from '../../identity/db'
import { isSubjectId } from '../review/rules'
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

export type ActingAccount = { id: string; email: string }

/**
 * The account an action runs for. Without `forId` it is the signed-in person, exactly as before. With `forId` it is the grantor,
 * and only if an unrevoked, unexpired grant covers `section` for the signed-in person (the actor always comes from the session);
 * the authorised action is written to the audit log. Anything else, including a malformed `forId`, gives null, and every service
 * answers null with its "session" error and does nothing.
 */
export async function accountFor(path: string, section: Section, action: string, forId: unknown): Promise<ActingAccount | null> {
  const me = await strongAccount(path)
  if (!me) return null
  if (forId === undefined || forId === null || forId === '' || forId === me.id) return me
  if (!isSubjectId(forId)) return null
  const a = await store().authorise(me.id, forId, section, action, Date.now())
  return a ? { id: a.subject.id, email: a.subject.email } : null
}

/** For a page opened with `?for=`: the grantor and the grant's end, or null (shown as 404). Records the access as `view`. */
export async function pageFor(path: string, section: Section, actorId: string, forId: unknown): Promise<Authorised | null> {
  if (!isSubjectId(forId) || forId === actorId) return null
  return store().authorise(actorId, forId, section, 'view', Date.now())
}
