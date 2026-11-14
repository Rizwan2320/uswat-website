# Brief FP-8: step-up re-authentication (AUTH-09) and session rotation (SES-03)

Branch `fp/step-up`, stacked on `fp/portal-security` (PR #47). Date 2026-11-13.

## Objective
1. **AUTH-09 / FPR-08:** changing how someone signs in (add, remove or rename a passkey, start or replace the authenticator app, make new recovery codes) needs a second factor verified within the last 10 minutes. Enforced in the API gate (not only on the page), so a direct call is refused. This closes the gap named in PR #47 (the last passkey can be removed by a direct call): the gate now refuses it unless the person has just proved it is them. It does not yet enforce "keep one second factor"; that stays a page rule and is stated as such.
2. **SES-03:** a new session id at sign-in and at step-up; the session the request arrived with is ended when a new one is made for it. Today the old session lingers (finding in FP-2).

## Design and why
- `session_assurance` gets `verifiedAt` (migration 0005; existing rows are backfilled to their creation time, so nothing is "fresh" just because the migration ran). Authentication events (passkey sign-in, TOTP, recovery sign-in) set it to now. Registering a passkey does **not** refresh it, except when the row is new (first-factor enrolment): otherwise adding keys would keep extending its own permission.
- Fresh means `now - verifiedAt <= 10 min`. Unknown or unreadable means not fresh (fail closed). The first factor needs no step-up: an account with no second factor has nothing to prove with.
- Step-up UI: the security page shows a "Confirm it is you" panel (passkey button, and a code field if an authenticator app is registered) when the session is not fresh, and the change controls only when it is. The library's own sign-in endpoints do the proving: TOTP verifies in place; a passkey makes a new session, which is the rotation.
- Rotation: an after-hook on the sign-in endpoints ends the session the request arrived with when a different new session is created. A failed call ends nothing.
- No new dependency, no new endpoint.

## Tests before code
Unit: gate table (each step-up path x fresh, stale, unknown, no factor yet), `isFresh`, session state carries `verifiedAt`, page guard returns `fresh`. Integration (real PostgreSQL): migration 0005 up and down, store `mark` semantics (authentication refreshes, registration does not, first row sets it), rotation hook. Browser: stale session refused on the API and shown the confirm panel; TOTP confirm in place; passkey confirm gives a new session id and the old one is dead; changes allowed right after, refused after 10 minutes (clock moved in the database).

## Not in this slice
Step-up for delegation, data download and high-impact approvals (those features need People); keeping one second factor server-side on delete; email alerts (no mailer).
