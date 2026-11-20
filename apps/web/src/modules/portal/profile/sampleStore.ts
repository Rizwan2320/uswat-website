/**
 * The SAMPLE adapter for `ProfileStore` (FP-11). Fixed fields come from a labelled sample seed; the editable fields come from
 * the draft row in `identity.profile_draft`. Every profile it returns has `sample: true`, which is what puts the "Sample" label
 * on screen. The real adapter (People through the Local API, origin `faculty`) replaces this file; screens do not change.
 * The account id is always the session's, passed in by the caller; this file never reads a request.
 */
import type pg from 'pg'

import type { LoadedProfile, Profile, ProfileEdit, ProfileStore } from './types'

export const EMPTY_EDIT: ProfileEdit = {
  bio: { en: '', ur: '' },
  researchInterests: [],
  officeLocation: '',
  officeHours: '',
  orcid: '',
  scholarUrl: '',
  cvLink: '',
  visibility: { email: 'hidden', photo: 'hidden' },
}

/** Dummy high-impact fields. Obviously fake on purpose: the person's own account name and address only. */
function sampleFixed(account: { email: string; name: string }, department: string | null): Profile {
  return {
    name: { en: account.name || 'Sample Faculty Member', ur: 'نمونہ استاد' },
    designation: { en: 'Lecturer (sample)', ur: 'لیکچرر (نمونہ)' },
    department: department ?? 'Sample Department',
    facultyStatus: 'current',
    email: account.email,
    ...EMPTY_EDIT,
    sample: true,
  }
}

/** Takes only the editable keys from a stored edit, so a row that somehow carries anything else cannot override a fixed field. */
export function pickEditable(stored: Partial<ProfileEdit>): ProfileEdit {
  return {
    bio: stored.bio ?? EMPTY_EDIT.bio,
    researchInterests: stored.researchInterests ?? EMPTY_EDIT.researchInterests,
    officeLocation: stored.officeLocation ?? EMPTY_EDIT.officeLocation,
    officeHours: stored.officeHours ?? EMPTY_EDIT.officeHours,
    orcid: stored.orcid ?? EMPTY_EDIT.orcid,
    scholarUrl: stored.scholarUrl ?? EMPTY_EDIT.scholarUrl,
    cvLink: stored.cvLink ?? EMPTY_EDIT.cvLink,
    visibility: stored.visibility ?? EMPTY_EDIT.visibility,
  }
}

type Row = { edit: ProfileEdit; status: 'draft' | 'submitted'; updatedAt: Date; reviewNote: string | null }

export function createSampleProfileStore(pool: pg.Pool): ProfileStore {
  return {
    async load(account) {
      const user = await pool.query<{ name: string }>(`select "name" from "user" where "id" = $1`, [account.id])
      const dept = await pool.query<{ department: string }>(`select "department" from "account_department" where "userId" = $1`, [account.id])
      const fixed = sampleFixed({ email: account.email, name: user.rows[0]?.name ?? '' }, dept.rows[0]?.department ?? null)
      const { rows } = await pool.query<Row>(`select "edit", "status", "updatedAt", "reviewNote" from "profile_draft" where "userId" = $1`, [account.id])
      const pub = (await pool.query<{ edit: ProfileEdit; approvedAt: Date }>(`select "edit", "approvedAt" from "profile_published" where "userId" = $1`, [account.id])).rows[0]
      const published = pub ? pickEditable(pub.edit) : null
      const publishedAt = pub ? pub.approvedAt.getTime() : null
      const row = rows[0]
      const loaded: LoadedProfile = row
        ? { profile: { ...fixed, ...pickEditable(row.edit) }, status: row.status, updatedAt: row.updatedAt.getTime(), published, publishedAt, reviewNote: row.reviewNote }
        : { profile: fixed, status: 'none', updatedAt: null, published, publishedAt, reviewNote: null }
      return loaded
    },
    async saveDraft(accountId, edit) {
      const r = await pool.query(
        `insert into "profile_draft" ("userId", "edit", "status", "updatedAt") values ($1, $2, 'draft', now())
         on conflict ("userId") do update set "edit" = excluded."edit", "updatedAt" = now(), "rev" = "profile_draft"."rev" + 1
         where "profile_draft"."status" = 'draft'`,
        [accountId, JSON.stringify(edit)],
      )
      return r.rowCount === 1
    },
    async submit(accountId) {
      const r = await pool.query(`update "profile_draft" set "status" = 'submitted', "updatedAt" = now(), "rev" = "rev" + 1, "reviewNote" = null where "userId" = $1 and "status" = 'draft'`, [accountId])
      return r.rowCount === 1
    },
    async withdraw(accountId) {
      const r = await pool.query(`update "profile_draft" set "status" = 'draft', "updatedAt" = now(), "rev" = "rev" + 1 where "userId" = $1 and "status" = 'submitted'`, [accountId])
      return r.rowCount === 1
    },
  }
}
