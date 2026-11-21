import { isSubjectId } from '../review/rules'
import type { DelegationStore, Section } from './types'

export type ActingAccount = { id: string; email: string }

/**
 * The account an action runs for, given the signed-in account `me`. Without `forId` (or with your own id) it is `me`, exactly as
 * before. With another id it is that grantor, and only if an unrevoked, unexpired grant covers `section` for `me`; the authorised
 * action is written to the audit log. Anything else, including a malformed id, gives null.
 */
export async function resolveAccount(store: Pick<DelegationStore, 'authorise'>, me: ActingAccount, section: Section, action: string, forId: unknown, now: number): Promise<ActingAccount | null> {
  if (forId === undefined || forId === null || forId === '' || forId === me.id) return me
  if (!isSubjectId(forId)) return null
  const a = await store.authorise(me.id, forId, section, action, now)
  return a ? { id: a.subject.id, email: a.subject.email } : null
}
