/**
 * The portal's view of a faculty profile (FP-11). The shape mirrors the People collection on `main`
 * (docs/briefs/fp11-people-field-map.md); fields the collection lacks today are marked there.
 */
export type Visibility = 'hidden' | 'internal' | 'public'
export const VISIBILITIES: readonly Visibility[] = ['hidden', 'internal', 'public']

/** English and Urdu text, as the collection stores localized fields. */
export type LocalText = { en: string; ur: string }

/** What a faculty member may change (the allow-list). Everything else is read-only. */
export type ProfileEdit = {
  bio: LocalText
  researchInterests: string[]
  officeLocation: string
  officeHours: string
  orcid: string
  scholarUrl: string
  cvLink: string
  visibility: { email: Visibility; photo: Visibility }
}

/** High-impact fields: never editable by the faculty member (FP-03). */
export type ProfileFixed = {
  name: LocalText
  designation: LocalText
  department: string
  facultyStatus: 'current' | 'former' | 'emeritus'
  /** The person's own address, shown to them; public only if their visibility says so. */
  email: string | null
}

export type Profile = ProfileFixed & ProfileEdit & {
  /** True for dummy data. The "Sample" label on screen is driven by this, not hard-coded. */
  sample: boolean
}

export type SubmissionStatus = 'none' | 'draft' | 'submitted'

export type LoadedProfile = {
  profile: Profile
  status: SubmissionStatus
  /** Epoch ms of the last save or submit; null when there is no draft yet. */
  updatedAt: number | null
}

/**
 * The one seam between the screens and wherever profiles live. The account id always comes from the session,
 * never from a request. Today: a sample adapter. Later: People through the Local API, writing with origin `faculty`.
 */
export interface ProfileStore {
  load(account: { id: string; email: string }): Promise<LoadedProfile>
  /** Replaces the draft with an already validated edit. Refused (returns false) once submitted. */
  saveDraft(accountId: string, edit: ProfileEdit): Promise<boolean>
  /** Sends the saved draft for review. Returns false when there is no draft or it was already submitted. */
  submit(accountId: string): Promise<boolean>
  /** Takes a submitted edit back to draft so it can be changed again. Returns false when nothing was submitted. */
  withdraw(accountId: string): Promise<boolean>
}
