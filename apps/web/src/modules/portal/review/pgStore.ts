/**
 * The PostgreSQL adapter for the reviewer queue. Authorisation is decided here, in the same transaction as the write, not only by the page:
 * role, department, not-self, still submitted, and the revision the reviewer saw. See docs/briefs/fp16-review-queue.md.
 */
import type pg from 'pg'

import { pickEditable } from '../profile/sampleStore'
import type { ProfileEdit } from '../profile/types'
import { compareEdits, isSubjectId } from './rules'
import type { DecideInput, DecideOutcome, Publisher, QueueItem, ReviewDetail, ReviewStore } from './types'

/** The sample publisher: the last approved edit lives in `identity.profile_published`. The real one writes People instead. */
export const samplePublisher: Publisher = async (tx, p) => {
  await tx.query(
    `insert into "profile_published" ("userId", "edit", "approvedBy", "approvedAt") values ($1, $2, $3, $4)
     on conflict ("userId") do update set "edit" = excluded."edit", "approvedBy" = excluded."approvedBy", "approvedAt" = excluded."approvedAt"`,
    [p.subjectId, JSON.stringify(p.edit), p.reviewerId, p.at],
  )
}

const QUEUE_LIMIT = 200

/**
 * Submitted drafts that this reviewer may see: the reviewer holds the role, belongs to a department, the subject is in the same
 * department (case-insensitively), and the subject is not the reviewer. One query so list and open can never disagree.
 */
const VISIBLE = `
  from "reviewer_role" r
  join "account_department" rd on rd."userId" = r."userId"
  join "account_department" sd on lower(sd."department") = lower(rd."department")
  join "profile_draft" d on d."userId" = sd."userId"
  join "user" u on u."id" = d."userId"
  left join "profile_published" p on p."userId" = d."userId"
  where r."userId" = $1 and d."status" = 'submitted' and d."userId" <> r."userId"`

type Row = { id: string; name: string; department: string; rev: number; updatedAt: Date; after: ProfileEdit; before: ProfileEdit | null }

export function createPgReviewStore(pool: pg.Pool, publish: Publisher = samplePublisher): ReviewStore {
  return {
    async isReviewer(userId) {
      const { rows } = await pool.query(
        `select 1 from "reviewer_role" r join "account_department" d on d."userId" = r."userId" where r."userId" = $1`,
        [userId],
      )
      return rows.length === 1
    },

    async listQueue(reviewerId) {
      const { rows } = await pool.query<Row>(
        `select d."userId" as id, u."name", sd."department", d."rev", d."updatedAt", d."edit" as after, p."edit" as before ${VISIBLE}
         order by d."updatedAt", d."userId" limit ${QUEUE_LIMIT}`,
        [reviewerId],
      )
      return rows.map<QueueItem>((r) => ({
        subjectId: r.id,
        name: r.name,
        submittedAt: r.updatedAt.getTime(),
        rev: r.rev,
        changes: compareEdits(r.before && pickEditable(r.before), pickEditable(r.after)).length,
        firstPublication: r.before === null,
      }))
    },

    async load(reviewerId, subjectId) {
      if (!isSubjectId(subjectId)) return null
      const { rows } = await pool.query<Row>(
        `select d."userId" as id, u."name", sd."department", d."rev", d."updatedAt", d."edit" as after, p."edit" as before ${VISIBLE} and d."userId" = $2`,
        [reviewerId, subjectId],
      )
      const r = rows[0]
      if (!r) return null
      const detail: ReviewDetail = {
        subjectId: r.id,
        name: r.name,
        department: r.department,
        rev: r.rev,
        submittedAt: r.updatedAt.getTime(),
        before: r.before && pickEditable(r.before),
        after: pickEditable(r.after),
        sample: true,
      }
      return detail
    },

    async decide(reviewerId, input: DecideInput, now): Promise<DecideOutcome> {
      const client = await pool.connect()
      try {
        await client.query('begin')
        // 1. Authorisation. `for share` on the role row means a revocation waits for this decision or this decision sees it.
        const auth = await client.query(
          `select 1 from "reviewer_role" r
             join "account_department" rd on rd."userId" = r."userId"
             join "account_department" sd on lower(sd."department") = lower(rd."department")
           where r."userId" = $1 and sd."userId" = $2 and r."userId" <> sd."userId"
           for share of r`,
          [reviewerId, input.subjectId],
        )
        if (auth.rowCount !== 1) {
          await client.query('rollback')
          return 'forbidden'
        }
        // 2. The draft, locked: only the submitted version the reviewer saw can be decided, and only once.
        const draft = await client.query<{ edit: ProfileEdit; rev: number }>(
          `select "edit", "rev" from "profile_draft" where "userId" = $1 and "status" = 'submitted' and "rev" = $2 for update`,
          [input.subjectId, input.rev],
        )
        const d = draft.rows[0]
        if (!d) {
          await client.query('rollback')
          return 'stale'
        }
        const before = (await client.query<{ edit: ProfileEdit }>(`select "edit" from "profile_published" where "userId" = $1 for update`, [input.subjectId])).rows[0]?.edit ?? null
        const at = new Date(now)
        const edit = pickEditable(d.edit)
        if (input.decision === 'approved') await publish(client, { subjectId: input.subjectId, edit, reviewerId, at })
        await client.query(
          `update "profile_draft" set "status" = 'draft', "rev" = "rev" + 1, "updatedAt" = $2, "reviewNote" = $3 where "userId" = $1`,
          [input.subjectId, at, input.decision === 'changes-requested' ? input.note : null],
        )
        await client.query(
          `insert into "profile_review" ("userId", "reviewerId", "decision", "note", "before", "after", "at") values ($1, $2, $3, $4, $5, $6, $7)`,
          [input.subjectId, reviewerId, input.decision, input.decision === 'changes-requested' ? input.note : null, before === null ? null : JSON.stringify(pickEditable(before)), JSON.stringify(edit), at],
        )
        // One summary line for the person, queued in this transaction (FP-43): it exists only if the decision does.
        await client.query(`select identity.enqueue_notification($1, $2, 1, null, $3)`, [input.subjectId, input.decision === 'approved' ? 'profile-approved' : 'profile-returned', at])
        await client.query('commit')
        return 'ok'
      } catch (e) {
        await client.query('rollback').catch(() => {})
        throw e
      } finally {
        client.release()
      }
    },
  }
}
