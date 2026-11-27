/** Delegation (FP-50). Shapes only; no I/O. */
export type Section = 'profile' | 'publications' | 'courses'
export const SECTIONS: readonly Section[] = ['profile', 'publications', 'courses']
export const MAX_DAYS = 90

export type GrantInput = { delegateEmail: string; sections: Section[]; days: number }
export type GrantState = 'active' | 'expired' | 'revoked'
export type GivenView = { id: string; delegateName: string; delegateEmail: string; sections: Section[]; createdAt: number; expiresAt: number; state: GrantState }
export type ReceivedView = { id: string; grantorId: string; grantorName: string; sections: Section[]; expiresAt: number }
export type AuditView = { at: number; actorName: string | null; section: Section; action: string }
export type Authorised = { delegationId: string; subject: { id: string; email: string; name: string }; expiresAt: number }

export interface DelegationStore {
  /** The active portal account with this address, or null for unknown, inactive or suspended (never told apart). */
  findDelegate(email: string): Promise<{ id: string; name: string } | null>
  /** Creates the grant, revoking the previous open one for the same pair, in one transaction. */
  create(grantorId: string, input: { delegateId: string; sections: Section[]; days: number }, now: number): Promise<{ id: string; expiresAt: number }>
  listGiven(grantorId: string, now: number): Promise<GivenView[]>
  listReceived(delegateId: string, now: number): Promise<ReceivedView[]>
  /** Only the grantor can revoke. False for anything else, including an id that does not exist. */
  revoke(grantorId: string, delegationId: string, now: number): Promise<boolean>
  /**
   * Is `actor` allowed to act on `subject`'s `section` right now? Unrevoked, unexpired, section covered, and both accounts active.
   * When yes, writes the audit row in the same transaction ("by actor on behalf of subject"); an audit failure throws, so the answer
   * is then no. `action` is a short name such as `saveProfile` or `view`.
   */
  authorise(actorId: string, subjectId: string, section: Section, action: string, now: number): Promise<Authorised | null>
  recentAudit(grantorId: string, limit: number): Promise<AuditView[]>
}
