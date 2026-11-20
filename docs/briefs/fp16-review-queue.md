# Brief FP-16: department reviewer queue (FP-03 reviewer half, FPR-04, PJ4; competition tier)

Branch `fp/review-queue`, from main. Independent of PR #104 (security centre). Date 2026-11-20.

## Objective
Today a faculty member can save a draft and press "send for review", and nothing happens next. This slice builds the other half: a department reviewer sees the submitted changes in their department, compares them with what is published, and approves them or sends them back with a reason. Until approval, the published version does not change (FPR-04). Journey PJ4: edit bio, submit, reviewer approves, the published version updates. All on Sample data.

## Design
- **Who is a reviewer.** `identity.reviewer_role` (one row per account) and `identity.account_department` (one department per account). A reviewer reviews only the department their own account belongs to. Roles and departments are set by an operator command (`pnpm identity:roles`), never from a screen and never by the person themselves. Department names are Sample text until People supplies real ones.
- **What a reviewer may do.** List submitted drafts in their department (oldest first, never their own); open one; see a field-by-field comparison of published against submitted; approve, or send back with a reason (1 to 500 characters). Nothing else: no editing, no high-impact fields.
- **One decision, one transaction.** The page carries the draft's revision number. The decision applies only if the draft is still `submitted` at that revision, the reviewer still holds the role, the subject is in the reviewer's department and is not the reviewer. Otherwise it is refused as stale or forbidden and nothing changes. Two reviewers pressing Approve at once: one wins, the other is told it was already decided.
- **Published version.** `identity.profile_published` holds the last approved edit. A `Publisher` seam writes it; the real adapter (People through the content service, origin `faculty`, tag invalidation) replaces it later. The screens do not change.
- **Decision log.** `identity.profile_review` is append-only: subject, reviewer, decision, note, the published edit before and the edit after, time. This is the spec's audit entry (actor, diff).
- **Faculty side.** The profile page shows what is published now, whether the draft is waiting, and the reviewer's note when changes were requested (cleared when they resubmit).
- **Fresh second factor.** Approving changes what the university would publish about a named person, so a decision needs a recent second-factor proof (the existing step-up). If it is stale the page says so and links to the security page to confirm, then back.
- **Authorisation** is in the service and the store (the page guard is not enough): role, department, not self, status, revision. Account ids come from the session only.

## Tests before code
Unit: comparison of two edits (every editable field, visibility, interests order, equal edits give no changes), decision input validation (note required for changes, trimmed, length, control characters, unknown decision), service order of checks. Integration (real PostgreSQL): approve copies exactly the reviewed edit to published and logs before and after; changes-requested sets the note and returns the draft to editable; stale revision refused; double decision refused (one winner under concurrency); reviewer of another department refused; no role refused; self refused; role revoked between listing and deciding refused; queue lists only this department's submitted drafts, never the reviewer's own, oldest first; the faculty draft cannot be changed while submitted; resubmitting clears the note; the log cannot be changed by the app; cascade and set-null on account deletion; migration up, down, up. Browser: both roles end to end (PJ4), a reviewer of another department sees nothing, a non-reviewer gets 404, stale confirm, hostile text, 390 px, keyboard.

## Not in this slice
Account activation by the department head and invitations (FP-01, PJ1), the Verifier role and high-impact fields with source documents (FP-03 other half), email or digest to the faculty member about the decision (no mailer; FP-43), a real People write and public page (P3's area), delegates, reviewing publications or courses.
