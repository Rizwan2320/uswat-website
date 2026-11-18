# FP-11 results: faculty profile on sample data

Date 2026-11-18. Branch `fp/profile-sample`. Predictions FP11-a, FP11-b, FP11-c in `docs/predictions.md`.

## What was run
- Unit: `tests/unit/portal/profileRules.unit.spec.ts` (rules, allow-list, ORCID checksum, links, preview matrix), `profileService.unit.spec.ts`, `pageGuard.unit.spec.ts` (adds `accountFrom`). All portal and identity unit tests pass.
- Integration (real PostgreSQL 16, local): `tests/int/identity/identity.int.spec.ts`, including 9 tests for the sample store and the migration list with 0007. 50 of 50 pass. Not run against Neon (never touched).
- Mutation checks (logic-only mutations, each restored): 17 run. 15 caught at once. Two survivors were examined: one was a mutation that changed nothing observable (reordering a computation, redone as a real reorder and caught), one is an equivalent mutant (an id taken from the request is unreachable because the allow-list refuses it first). Two further gaps were closed with new tests (characters outside the basic plane counted once; a signed-out caller learns nothing about validation) and a pure `accountFrom` was extracted so the strong-session check is tested.
- Browser: `docs/evidence/FP11/scripts/profile-run.mjs`, Chromium with a virtual authenticator, elements found by role and label, against `next start` of a production build. 22 of 22 pass (`results/profile-run.json`). Screenshots in `shots/` (desktop, 390 px).

## What the browser run covers
Signed-out redirect; Sample badge and note from the data flag; fixed fields shown as text; hidden email and photo absent from the preview until set to Public; Urdu field right-to-left with lang=ur and intact after reload; live preview and de-duplicated interests; wrong ORCID checksum and http Scholar link refused with linked messages; save, reload, persistence; crafted requests replayed with the session cookie (a high-impact field, another account id, a save after submit) all refused; submit locks the form and withdraw reopens it; Save reachable by Tab and Enter; no horizontal scroll at 390 px; a second account sees only its own empty profile.

## Defects found by running it (both fixed)
1. A stored row with extra keys overrode the fixed fields on load (integration test).
2. The preview showed duplicate interests that the server removes (browser run); the preview and the validator now share `tidyInterests`.
3. `.portal-main` overflowed 32 px at 390 px width (browser run); now `box-sizing: border-box`. This applied to the other portal pages too.

## Not run, and why
- Real People collection or any real faculty data: not available by design; this slice is sample only.
- Real device passkeys, https, screen reader, right-to-left layout of the whole page (only the Urdu fields): need people or an owner environment.
- Photo upload, publications, claiming by invitation, the reviewer side: out of this slice (brief).
- The Urdu words of the interface itself: English only for now.
- `tests/unit/env.unit.spec.ts` fails in this container when `DATABASE_URL` and the other CMS secrets are unset; it fails the same on `main` and is not related.

## To connect real data later
Write one adapter that implements `ProfileStore` (read People through the Local API, write with origin `faculty` through the content service). Needs from P3: `claimedBy`, the `faculty` origin, the extra fields in `docs/briefs/fp11-people-field-map.md`. Screens, actions and rules do not change; the Sample label disappears because the records will carry `sample: false`.
