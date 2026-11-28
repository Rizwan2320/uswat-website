/**
 * The Registrar's office (the spec's "Verifier"): sets the fields the university owns, from a source document.
 * Shapes only; no I/O. The Verifier's id always comes from the session; the request carries the subject, the values and the source note.
 */
export type FixedValues = {
  designationEn: string
  designationUr: string | null
  nameUr: string | null
  department: string
}

export type PersonRow = { subjectId: string; name: string; email: string; department: string | null; designationEn: string | null }

export type DepartureOutcome = 'former' | 'emeritus'
export const DEPARTURE_OUTCOMES: readonly DepartureOutcome[] = ['former', 'emeritus']
/** The Registrar's record of a person leaving; rolesRemoved are the privileged roles the account held when it ended. */
export type Departure = { at: number; outcome: DepartureOutcome; source: string; rolesRemoved: string[] }
export type AccountState = 'pending-activation' | 'active' | 'suspended' | 'left'

export type PersonDetail = {
  subjectId: string
  name: string
  email: string
  current: FixedValues | null
  holdsRole: boolean
  history: ChangeRow[]
  /** The account's state and, once marked, the departure. `linked` is whether the account is tied to a public People record. */
  state: AccountState
  linked: boolean
  departure: Departure | null
}

export type ChangeRow = { at: number; source: string; fields: string[] }

export type SaveInput = { subjectId: string; values: FixedValues; source: string }

export type LeaveInput = { subjectId: string; outcome: DepartureOutcome; source: string }

/** 'forbidden': not a Verifier, the Verifier's own record, or an unknown person (never told apart). 'has-role': a department change for a reviewer or head. */
export type SaveOutcome = 'ok' | 'forbidden' | 'has-role'
/** 'already': the account is already marked as left. Not the Verifier, their own record and an unknown person are all 'forbidden'. */
export type LeaveOutcome = 'ok' | 'forbidden' | 'already'

export interface RegistrarStore {
  isVerifier(userId: string): Promise<boolean>
  search(verifierId: string, q: string): Promise<PersonRow[]>
  load(verifierId: string, subjectId: string): Promise<PersonDetail | null>
  save(verifierId: string, input: SaveInput, now: number): Promise<SaveOutcome>
  /** Ends the account and writes the log row in one transaction (section 5.6). */
  leave(verifierId: string, input: LeaveInput, now: number): Promise<LeaveOutcome>
}
