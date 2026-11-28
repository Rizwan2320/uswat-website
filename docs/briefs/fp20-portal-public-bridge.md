# FP-20 Portal to public website bridge (stage 1)

Date 2026-11-27. FP agent. Owner request: "work on the connection". What a faculty member approved in the portal, and the Public works in their publication list, appear on their public `/people/[slug]` page, each work clickable.

## Objective
One signed call from the portal to the public site writes the person's People record and refreshes the page. Stage 1 sends only fields People already has, so no CMS migration is needed: `details` (bio, English and Urdu), `cvLink`, `visibility.email`, `visibility.photo`, `publications` (title and link).

## Design
- **Portal (FP lane).** A payload builder reads the person's approved profile (`profile_published`) and their claimed works marked Public, featured first (max 5 featured), and builds `{ subject, edit: {bio, cvLink, visibility}, publications: [{title, url}], approvedAt }`. A work's link is its full-text URL, else `https://doi.org/<doi>`, else none (plain title). A signer adds `x-uswat-timestamp` and `x-uswat-signature` (HMAC-SHA256 over `timestamp.bodyHash`). The sender runs after the approval commits, never inside the transaction and never in page render (FF-07). Result stored in `identity.public_sync` (migration 0018): last attempt, last success, short error. The portal shows "Waiting to appear on the public site" when the last attempt failed. A button "Update my public page" on the Publications page sends on demand; approval and self-publish also send.
- **Website (main lane, flagged).** `POST /api/portal/publish`: 404 for anything not correctly signed (also when the secret is not configured); timestamp within 5 minutes; body hash; strict allow-list and length limits; finds People by `slug == subject` (the account's `recordRef` is the People slug; `claimedBy` is not built). It writes with the Local API as the system actor and the flag `portalApproved`, then revalidates `list:people` and `/people/<slug>`. Never accepted: name, designation, department, status, email, photo.
- **Governance rule (lead lane, flagged).** A system write on a live People record that changes content is refused today (`EDIT_LIVE_NEEDS_REVIEWER`) and would reset Fact-check. One small additive rule: when the request context carries `portalApproved` (Local API only, a REST client cannot set it) and the collection is People, the system actor may change content on a live record and verification is kept. Reason: the head or Registrar already approved in the portal, and the fields are the person's own. Every other record and role is unchanged.
- **Mapping.** The portal account's `recordRef` must equal the People slug. Demo accounts get Sample slugs (`sample-person-NN`) through the existing invitation record reference.

## Paths touched
Portal lane: `modules/portal/bridge/**` (new), `modules/portal/profile/*` and `review/*` (trigger after approval), `modules/identity/sql/0018_*`, publications page and view, `copy.ts`, tests, docs. Outside the lane (opened as a PR for the owner or lead, not self-merged): `app/(site)/api/portal/publish/route.ts`, `governance/policy.ts` and `governance/hooks.ts` (one flag each), their tests, `site/people/shape.ts` and `PersonPage.tsx` only if the page needs a label for featured works (not planned).

## Risks
Forged or replayed calls (signature, timestamp, 404); a portal bug overwriting a person's record (allow-list, one record by slug, replace only the five fields); public works leaking private ones (only `public` and `claimed`, tested); secret leakage (env only, never logged or committed); portal outage blocking approval (send is after commit, failure is shown, approval stands); mismatched slug writing the wrong person (refuse when no People record has the slug, never create).

## Tests
Unit: signer and verifier (tampered body, old timestamp, wrong secret, missing secret), payload builder (private works absent, featured first, DOI fallback, caps), allow-list, policy flag (system plus flag allowed, system without flag refused, user with flag refused). Integration: People write through the real hooks on a local database, verification kept. End to end: portal approval then public page shows the text and the clickable works.

## Gate
Local end-to-end run green; CI green; PR open for the lead for the non-portal files. Not run until done: the live deployment (the secret and the public site address are not set in either Vercel project).
