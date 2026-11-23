/**
 * The sample publisher: the last approved edit lives in `identity.profile_published`. The real one writes People instead.
 * It sits here, not in the review module, because two paths publish through it: a reviewer's approval, and the owner's own
 * "Save and publish" for a head of department or the Registrar, who have no reviewer (docs/briefs/fp-self-publish-and-redesign.md).
 */
import type { Publisher } from '../review/types'

export const samplePublisher: Publisher = async (tx, p) => {
  await tx.query(
    `insert into "profile_published" ("userId", "edit", "approvedBy", "approvedAt") values ($1, $2, $3, $4)
     on conflict ("userId") do update set "edit" = excluded."edit", "approvedBy" = excluded."approvedBy", "approvedAt" = excluded."approvedAt"`,
    [p.subjectId, JSON.stringify(p.edit), p.reviewerId, p.at],
  )
}
