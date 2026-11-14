# FP-8: step-up (AUTH-09) and session rotation (SES-03), evidence

Date 2026-11-14. Local PostgreSQL 16.15, production build, Chromium with a CDP virtual authenticator. No real device, no Vercel, no Neon.

## Built
- Migration 0005: `session_assurance."verifiedAt"` (existing rows backfilled to their creation time).
- Gate: the paths that change how someone signs in (register, delete and update a passkey, start or disable the authenticator app, make recovery codes) need a second factor proved in the last 10 minutes; an account with no second factor yet is not asked. Unknown freshness, a missing clock and a time in the future all mean refused.
- Authentication (passkey sign-in, code, recovery) sets the clock; registering a key never does.
- Rotation: a session the request arrived with is ended when a different new one is made for it.
- Security page: a "Confirm it is you" card (passkey button and/or code field) replaces the change controls when the proof is stale; a 403 mid-use turns into a plain message and a reload.

## Results
- Browser: `results/stepup-run-2.json`, 14 of 14 (A1-A11 passkey account, B1-B3 authenticator-app account). An earlier run was 12 of 14 for two test-side reasons (the seed script's sign-up leaves a session behind, so the session counts were wrong); its result file was deleted, not kept. The script now drops that session first.
- Rebased on `main` after the main agent merged the earlier portal PRs and the font change: the browser run was repeated on the rebased production build, `results/stepup-run-3-rebased.json`, 14 of 14. Unit and identity integration there: 447 passed (28 files); `tsc` clean; lint 0 errors (32 warnings, none new in portal code except the one noted); `next build` passes after `pnpm install` for the fonts main added.
- Before the rebase: 443 passed (27 files), of which 8 new integration tests on the real library and PostgreSQL. `tsc` clean. Lint 0 errors (28 warnings, one new from the confirm card's effect heuristic).
- Mutation checks (unit + integration): window doubled, step-up switched off, no-factor exemption removed, clock never set were all caught (4 of 4 straight away). Two more (rotation delete removed, registration refreshing the clock) were first **not** caught; I extracted their rules into `refreshesProof` and `endReplacedSession`, tested them directly, and re-ran: both caught (1 failing test each).
- The ten minutes were not waited out: "stale" is made by moving `verifiedAt` back 11 minutes in the database. Boundary behaviour (exactly 10 minutes passes, just over fails) is covered by the unit and integration tests, which also use database ageing.

## Not run, and limits
- **Limit:** after a password-then-code sign-in over an existing session, the previous session is not ended (the library already dropped its cookie at the password step). It cannot be used by anyone without the cookie and expires on its own; a periodic clean-up of expired rows is not built.
- Step-up for delegation, data download and approvals: those features need the People collection.
- Keeping one second factor on a direct delete call is still not enforced server-side (the page rule remains); the gate now makes that call need a recent proof.
- Migration 0005's backfill on a database with existing sessions: not run (the test database had no rows when migrated).
- Real devices, https, Vercel's proxy, screen readers, Payload integration tests on this branch.
