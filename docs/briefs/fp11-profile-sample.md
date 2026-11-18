# Brief FP-11: faculty profile on sample data (FP-02, FP-03, FP-04, FP-06 slice)

Branch `fp/profile-sample`, from `main` (8fd62bf). Date 2026-11-18. Owner decision (2026-11-18): the build is for the competition, so it runs on dummy data, written so real data can be connected later without rewriting screens.

## Objective
A signed-in faculty member (strong session) can open `/portal/profile`, edit the low-risk fields of a **sample** profile, see exactly what the public would see (preview), choose per field who sees email and photo, and submit the edit for review. High-impact fields (name, designation, department, status) are shown read-only with the reason. Nothing is published and nothing is written to Payload.

## Design (so real data can follow smoothly)
- **One seam:** screens and server actions talk only to `ProfileStore` (`load`, `saveDraft`, `submit`). Today's adapter is a sample adapter; the real one will read People through the Local API and write with origin `faculty` (needs P3's later migration: `claimedBy`, `faculty` origin, `onBehalfOf`).
- **Shape mirrors the real People collection on `main`** (name and designation localized en/ur, `details` = bio, `cvLink`, `visibility.{email,photo}`, `facultyStatus`); the extra Addendum C fields (research interests, office location and hours, ORCID, Scholar link) are marked as "P3 must add" in `docs/briefs/fp11-people-field-map.md`, which doubles as the answer to P3's open question about the allow-list.
- **The "Sample" label comes from the data**, not the screen: a record flag `sample`. Real records have none, so the label disappears without a code change.
- **Allow-list in one place** (`rules.ts`): only these fields are editable; any other key in a request is refused (FPR-02), not ignored.
- **Account from the session only** (FPR-03): no id is ever taken from the request. Server actions re-check the strong session themselves; Next's own Origin check covers CSRF.
- **Preview is a pure function** of the draft: a hidden email or photo never appears (FP-06), tested directly.
- Drafts live in the portal's own schema: table `identity.profile_draft` (migration 0007), one row per account, status draft or submitted. Nothing in `public`.

## Tests before code
Unit: validation (lengths, ORCID checksum, https-only links, Urdu text kept intact, control characters stripped, interests count), allow-list refusing every read-only key, preview visibility matrix. Integration (real PostgreSQL): save and load round trip, one row per account, account A cannot read or overwrite B's draft by any route in the adapter, submit locks edits until changed, cascade on user delete, migration up/down. Browser: edit, save, preview, hide email, submit, forbidden field attempted through a crafted request, keyboard-only, Urdu field renders right-to-left, another signed-in account sees only its own profile.

## Not in this slice
Claiming through an invitation (FP-01, needs People and email), the reviewer side (CMS lane), ORCID/OpenAlex, publications, CV, delegation, privacy for phone (the real collection has no phone field), photo upload, per-field risk classes beyond the allow-list, the audit trail of refused attempts (counted in the response only).
