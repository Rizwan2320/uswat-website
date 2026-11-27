# FP-18 results: delegation (FP-50, PJ6, section 5.6)

Date 2026-11-21. Branch `fp/delegation`, stacked on `fp/claim-activation` (PR #118), which is stacked on `fp/review-queue` (PR #115). Merge order: #115, then #118, then this. Brief `docs/briefs/fp18-delegation.md`; predictions FP18-a and FP18-b (reconciled). All people are Sample; nothing real, nothing live; no email is sent.

## What was built
- Migration 0013: `delegation` (grantor, delegate, sections subset of profile/publications/courses, at most 90 days, never to oneself, one open grant per pair) and an append-only `delegation_audit`. Down migration drops both.
- A faculty member opens `/portal/delegation`, types a colleague's address, ticks the parts and the days (1 to 90, default 30). Needs a recent second factor. Unknown, inactive and suspended addresses get one and the same sentence. Giving access again to the same person replaces the earlier grant (shown as Withdrawn). The grantor can withdraw at any time; leaving or suspension of either person withdraws every grant.
- The delegate sees "Access you have been given" with one link per part. Each opens the normal page with `?for=<grantor id>` and a banner saying whose page it is, until when, with a way back. The page loads the grantor's data; actions carry the grantor's id as a request value that is only a claim: the server resolves the account through `authorise`, with the signed-in person as the actor, inside one transaction that also writes the audit row. Anything else (bad or unknown id, ungranted part, expired, withdrawn, himself, a stranger) gives the same 404 or the service's "session" refusal.
- Never delegated, and guarded by a static test: submit and withdraw (they take no `forId`), security, the delegation screen itself, CV, review and activation.
- The grantor sees recent activity on their behalf in plain words ("Bilal Sample · Courses · added a course"). Viewing is audited as "opened the page".

## What was run
- Unit (16 new): grant allow-list (days 1 to 90, whole numbers, known unique sections, no security/delegation, bad addresses, extra keys), service order (session, validate, fresh factor, one answer for unknown/inactive, never oneself, session-only grantor, revoke), and four static guards on what code can reach delegation or act for someone else, and that every audited action has a plain-words line.
- Integration (real PostgreSQL 16, 21 new): database limits (self, sections, 90 days, one open grant), re-grant replacement, received list, delegate lookup (case, suspended, pending), revoke by the grantor only, per-section authorise, three-account IDOR (stranger, reverse direction, himself), bad section and action names, expiry to the millisecond, withdrawal, suspended/left/pending refused, the real status store withdrawing grants, revoke versus authorise at the same time, one audit row per authorised action and none for refused ones, append-only audit, set-null and cascade, a delegated course action landing in the grantor's list and never the delegate's, a delegated profile save leaving the status draft. Whole suite: 1398 of 1398 (113 files).
- Mutation checks: 14 deliberate breakages, all caught (expiry, section, revoked, grantor active, delegate active, actor binding, revoke owner, replace, audit insert, resolve fallback to oneself, fresh check, self check, 91 days, status revoking grants).
- Production build passes (`/portal/delegation` dynamic; profile, publications, courses read `searchParams`).
- Browser (`scripts/delegation-run.mjs`, Chromium, production build, virtual authenticators; Ayesha, Bilal, Carol): 24 of 24, `results/delegation-run.json`. Covers: the page and its explanation; same sentence for unknown and suspended; refusing oneself, 91 days and no part; granting; 30 days; the delegate's links (none for the profile, none given); the banner; a course added by the delegate landing in the grantor's list; the delegate's own page unchanged; looking for works with the grantor's ORCID iD and claiming one; the same 404 for six kinds of bad `for`; the stranger's 404 on three parts; the security page ignoring `for`; the audit log content; the grantor's activity list; re-grant replacing; profile save with no Submit button and status still draft; a page opened before withdrawal unable to change anything and saying so; 404 straight after withdrawal; expiry without a job; 390 px with a very long name on both sides; keyboard-only form; nothing secret in the HTML.
- Screenshots in `shots/`.

## Defects found
- Real: after withdrawal, the delegate's already-open page said "Your session ended", which is false and confusing. Now "Your access to this page has ended, so nothing was saved." Found by reading what the check actually matched, not by a failing check.
- Script and test mistakes (mine, 4): a status name the database does not have; two browser checks too loose (stale error text; Next's route announcer counts as an alert); one pointless second-device sign-in.
- Improved while looking at the 390 px screenshot: developer action names in the activity list replaced with plain words.

## Decisions I took (reversible, in the brief)
- The grant covers whole parts, not single fields. Reviewers and the grantor's own review/submit flow are unchanged: only the grantor submits.
- Harvest for a publications delegate uses the grantor's public ORCID iD from the profile draft. That is what the part is for; it does not let the delegate read or change anything else on the profile.
- The audit records an action as soon as it is authorised, so an authorised action that then fails validation is still logged (over-records, never under-records). Page views are logged as "opened the page".
- The activity list is not collapsed, so a delegate opening a page often adds several rows. Acceptable for a sample; a daily roll-up is a later improvement.
- The delegate page headings still read "Your courses" while editing the grantor's list; the banner states whose it is. Left as is.

## Not run, and why
- Email to the grantor when access is given or used: there is no mailer (ABU-03 not run). The grantor sees the activity list and the Active grant on their delegation page.
- A job that withdraws expired grants: not needed, expiry is checked when used; the list computes "Ended".
- Real devices, a screen reader, https; forged server-action calls in a browser (covered by unit and integration tests); quarterly review of delegations; delegation of CV or of review duties (not allowed by design); real People.
