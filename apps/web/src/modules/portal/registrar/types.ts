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

export type PersonDetail = { subjectId: string; name: string; email: string; current: FixedValues | null; holdsRole: boolean; history: ChangeRow[] }

export type ChangeRow = { at: number; source: string; fields: string[] }

export type SaveInput = { subjectId: string; values: FixedValues; source: string }

/** 'forbidden': not a Verifier, the Verifier's own record, or an unknown person (never told apart). 'has-role': a department change for a reviewer or head. */
export type SaveOutcome = 'ok' | 'forbidden' | 'has-role'

export interface RegistrarStore {
  isVerifier(userId: string): Promise<boolean>
  search(verifierId: string, q: string): Promise<PersonRow[]>
  load(verifierId: string, subjectId: string): Promise<PersonDetail | null>
  save(verifierId: string, input: SaveInput, now: number): Promise<SaveOutcome>
}
