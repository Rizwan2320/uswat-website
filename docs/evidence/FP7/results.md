# FP-7a: portal identity pages, evidence

Date: 2026-11-13 (local PostgreSQL 16.15, production build served with `next start`, Chromium with a CDP virtual authenticator; no real device, no Vercel, no Neon).

## What was built
`/portal` (home), `/portal/sign-in` (passkey, password, then authenticator code), `/portal/enrol` (passkey or authenticator app, then recovery codes shown once), `/portal/recover` (recovery code), sign-out. One root layout for the portal, no new dependency, styles on the existing tokens in `portal.css`. A page guard (`pageGuard.ts`) applies the same gate decision as the API route; both read the session through `sessionState.ts`.

## Results
- Browser run: `docs/evidence/FP7/results/run-2.json`, 20 of 20 checks pass (A1-A10 passkey path, B1-B4 and B2b authenticator-app path with keyboard-only sign-in, C1-C3 errors and recovery sign-in, D1-D2 no leakage to or from the public site).
- `run-1.json`: 19 of 20. The failed check (A5) was a race in the test (it read the recovery list before the page showed it). The test was fixed; the product was not changed. Earlier attempts before run-1 also stopped on test mistakes (a second `role=alert` from Next's route announcer; the library's per-address sign-in limiter, 3 per 10 s, answering a fast run with 'Too many attempts'). They wrote no results file.
- Unit: 355 passed (23 files). Identity integration: 28 passed (`IDENTITY_TEST_DATABASE_URL`). `tsc` clean. Lint: 0 errors; the 26 warnings are in files outside the portal.
- Mutation check on the page guard (unit): expired reason removed, deny ignored, second-factor reason removed. All three were caught (1, 7 and 2 failing tests). Browser-level mutation runs were not repeated for the pages.

## Not run
- Payload integration tests (`tests/int/*` other than `identity`) on this branch: they need the Payload database and were not run here; this branch does not touch Payload.
- Real devices, https, Vercel's proxy, screen readers, Urdu text, colour contrast of `portal.css` against the token contrast test (the test reads `tokens.css` only).
- Page `/portal/security` (list and add passkeys, regenerate recovery codes, sessions): not built yet (slice 7c).

## Findings
- After a recovery-code sign-in the person lands on `/portal/enrol` and can add a new passkey straight away (C3). A strong session on a person who already has a factor is let into the enrol page; that is intended.
- The library's own limiter (3 sign-ins in 10 s per address) is on in production mode and shows the same 'Too many attempts' message. Its interaction with the progressive delay is still not tested at the HTTP level beyond this observation.
