/**
 * The SAMPLE adapter for `ProfileStore` (FP-11). Fixed fields come from a labelled sample seed; the editable fields come from
 * the draft row in `identity.profile_draft`. Every profile it returns has `sample: true`, which is what puts the "Sample" label
 * on screen. The real adapter (People through the Local API, origin `faculty`) replaces this file; screens do not change.
 * The account id is always the session's, passed in by the caller; this file never reads a request.
 */
import type pg from 'pg'

import { samplePublisher } from './publisher'
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
type FixedRow = { nameUr: string | null; designationEn: string; designationUr: string | null; photo: string | null }

function sampleFixed(account: { email: string; name: string }, department: string | null, fixed: FixedRow | null = null): Profile {
  return {
    name: { en: account.name || 'Sample Faculty Member', ur: fixed?.nameUr ?? 'نمونہ استاد' },
    designation: fixed ? { en: fixed.designationEn, ur: fixed.designationUr ?? '' } : { en: 'Lecturer (sample)', ur: 'لیکچرر (نمونہ)' },
    department: department ?? 'Sample Department',
    facultyStatus: 'current',
    email: account.email,
    photo: fixed?.photo ?? null,
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

/** Holds the head or the Registrar (verifier) role: the two roles whose own page has no reviewer. */
const SELF_PUBLISHING = `(exists (select 1 from "head_role" h where h."userId" = $1) or exists (select 1 from "verifier_role" v where v."userId" = $1))`

type Row = { edit: ProfileEdit; status: 'draft' | 'submitted'; updatedAt: Date; reviewNote: string | null }

export function createSampleProfileStore(pool: pg.Pool): ProfileStore {
  return {
    async load(account) {
      const user = await pool.query<{ name: string }>(`select "name" from "user" where "id" = $1`, [account.id])
      const dept = await pool.query<{ department: string }>(`select "department" from "account_department" where "userId" = $1`, [account.id])
      const fx = (await pool.query<FixedRow>(`select "nameUr", "designationEn", "designationUr", "photo" from "account_fixed" where "userId" = $1`, [account.id])).rows[0] ?? null
      const fixed = sampleFixed({ email: account.email, name: user.rows[0]?.name ?? '' }, dept.rows[0]?.department ?? null, fx)
      const { rows } = await pool.query<Row>(`select "edit", "status", "updatedAt", "reviewNote" from "profile_draft" where "userId" = $1`, [account.id])
      const pub = (await pool.query<{ edit: ProfileEdit; approvedAt: Date }>(`select "edit", "approvedAt" from "profile_published" where "userId" = $1`, [account.id])).rows[0]
      const selfPublishing = (await pool.query<{ s: boolean }>(`select ${SELF_PUBLISHING} as s`, [account.id])).rows[0]?.s === true
      const published = pub ? pickEditable(pub.edit) : null
      const publishedAt = pub ? pub.approvedAt.getTime() : null
      const row = rows[0]
      const loaded: LoadedProfile = row
        ? { profile: { ...fixed, ...pickEditable(row.edit) }, status: row.status, updatedAt: row.updatedAt.getTime(), published, publishedAt, reviewNote: row.reviewNote, selfPublishing, draftIsPublished: published !== null && JSON.stringify(pickEditable(row.edit)) === JSON.stringify(published) }
        : { profile: fixed, status: 'none', updatedAt: null, published, publishedAt, reviewNote: null, selfPublishing, draftIsPublished: false }
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
      // The department's reviewers get one summary line each (FP-43), queued in the same statement as the submission.
      const r = await pool.query<{ updated: number }>(
        `with u as (update "profile_draft" set "status" = 'submitted', "updatedAt" = now(), "rev" = "rev" + 1, "reviewNote" = null where "userId" = $1 and "status" = 'draft' and not ${SELF_PUBLISHING} returning "userId"),
              n as (select identity.enqueue_notification(rv."userId", 'review-waiting', 1, null, now())
                    from u join "account_department" sd on sd."userId" = u."userId"
                    join "account_department" rd on lower(rd."department") = lower(sd."department")
                    join "reviewer_role" rv on rv."userId" = rd."userId"
                    where rv."userId" <> u."userId")
         select (select count(*) from u)::int as updated, (select count(*) from n)::int as notified`,
        [accountId],
      )
      return r.rows[0]!.updated === 1
    },
    async publishOwn(accountId, now = Date.now()) {
      const client = await pool.connect()
      try {
        await client.query('begin')
        // `for share` on the role row: a revocation waits for this publish, or this publish sees it. Either role is enough.
        const isHead = ((await client.query(`select 1 from "head_role" where "userId" = $1 for share`, [accountId])).rowCount ?? 0) > 0
        const allowed = isHead || ((await client.query(`select 1 from "verifier_role" where "userId" = $1 for share`, [accountId])).rowCount ?? 0) > 0
        if (!allowed) {
          await client.query('rollback')
          return 'not-allowed'
        }
        const draft = await client.query<{ edit: ProfileEdit }>(`select "edit" from "profile_draft" where "userId" = $1 for update`, [accountId])
        const d = draft.rows[0]
        if (!d) {
          await client.query('rollback')
          return 'nothing'
        }
        const at = new Date(now)
        const edit = pickEditable(d.edit)
        const before = (await client.query<{ edit: ProfileEdit }>(`select "edit" from "profile_published" where "userId" = $1 for update`, [accountId])).rows[0]?.edit ?? null
        await samplePublisher(client, { subjectId: accountId, edit, reviewerId: accountId, at })
        // Back to a plain draft (equal to what is published), so a head who had a submission waiting is released too.
        await client.query(`update "profile_draft" set "status" = 'draft', "rev" = "rev" + 1, "updatedAt" = $2, "reviewNote" = null where "userId" = $1`, [accountId, at])
        // The audit row names the owner as the approver, which is how a self-published change is told apart from a reviewed one.
        await client.query(
          `insert into "profile_review" ("userId", "reviewerId", "decision", "note", "before", "after", "at") values ($1, $1, 'approved', null, $2, $3, $4)`,
          [accountId, before === null ? null : JSON.stringify(pickEditable(before)), JSON.stringify(edit), at],
        )
        await client.query('commit')
        return 'ok'
      } catch (e) {
        await client.query('rollback').catch(() => {})
        throw e
      } finally {
        client.release()
      }
    },
    async withdraw(accountId) {
      const r = await pool.query(`update "profile_draft" set "status" = 'draft', "updatedAt" = now(), "rev" = "rev" + 1 where "userId" = $1 and "status" = 'submitted'`, [accountId])
      return r.rowCount === 1
    },
  }
}
