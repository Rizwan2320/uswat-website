# Brief FP-18: delegation without sharing a password (FP-50, PJ6, FPR-06, FPR-08; competition tier)

Branch `fp/delegation`, stacked on `fp/claim-activation` (PR #118), which is stacked on `fp/review-queue` (PR #115): migration numbering continues from 0012. Merge in order. Date 2026-11-21. All people Sample.

## Objective
A faculty member lets a named colleague or assistant edit chosen sections of their profile for up to 90 days. The delegate works under their own account, so there is no shared password. Every authorised action is recorded as "by X on behalf of Y". A delegate can never change security settings, delegate further, or submit the profile for review. PJ6: grant, delegate edits publications, expiry, access gone.

## Design
- **Sections** that can be granted: `profile` (the editable fields; save a draft only), `publications` (harvest, claim, reject, mark duplicate), `courses`. Not delegable: security, delegation, CV download, submitting or withdrawing a profile for review (a sign-off), anything in the review or activation queues.
- **Grant** (`identity.delegation`): grantor, delegate, a non-empty set of sections, `expiresAt` at most 90 days after creation (database check), `revokedAt`. One non-revoked grant per pair; granting again replaces it. The grantor and delegate differ (database check). The delegate must hold an active portal account; the answer for an unknown, inactive or mistyped address is the same sentence. Creating a grant needs a fresh second factor (AUTH-09, FPR-08).
- **Using a grant.** One function, `resolveDelegation(actor, subject, section, now)`, answers yes only for a grant that is unrevoked, unexpired, covers the section, and whose grantor and delegate are both active. The actor is always the session account. Each existing service already takes `getAccount()`; delegation supplies the grantor as the account for the granted actions only, so rules, allow-lists and stores are reused unchanged. Actions take an optional trailing `forId`; the security, delegation, review, activation, CV and submit/withdraw actions do not.
- **Audit** (`identity.delegation_audit`, append-only): time, actor, subject, section, action name, grant id. Written when a delegated action is authorised, so a refused or invalid save is also recorded (it over-records rather than misses). Shown to the grantor on the delegation page.
- **Revoke**: the grantor can revoke at any time without a fresh factor (it only reduces access). Marking either person suspended or left revokes every grant they are in, the same moment.
- **Pages**: `/portal/delegation` (grant, list given and received, revoke, recent delegate activity); `?for=<id>` on `/portal/profile`, `/portal/publications`, `/portal/courses` with a banner "You are editing X's section as their delegate until D". A bad, expired or out-of-scope `for` is 404, the same as a missing page.

## Tests before code
Unit: grant input validation (sections allow-list and non-empty, days 1 to 90, email shape, unknown keys refused), service (session first, fresh factor, same sentence for unknown and inactive, never self), resolution rules at the expiry boundary. Integration (real PostgreSQL): 90 day cap and the other checks in the database, replace on re-grant, resolve for each section and for a non-granted section (refused), after expiry and after revoke (refused), grantor or delegate suspended or left (refused and revoked), delegate cannot grant, IDOR across three accounts, concurrency (revoke while editing), audit entry per delegated action, append-only, cascade, and that the delegated profile save cannot submit. Browser: PJ6 end to end plus the refusals, 390 px, keyboard.

## Not in this slice
Email to the grantor on a new delegation (ABU-03; no mailer, shown on the page and in the log), delegating to someone outside the portal, per-field grants, delegation of review sign-offs, an automatic expiry job (expiry is checked at use; expired grants are shown as expired).
