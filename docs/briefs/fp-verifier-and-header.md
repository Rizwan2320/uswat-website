# Brief: Registrar's office (Verifier role) and the portal header

**Objective.** (1) Someone must be able to set a person's designation, Urdu name and department; until now they came from a table loaded by hand. The spec's Verifier role does this. (2) The portal header should look like the public site's header.

**Paths touched.** `modules/identity/sql/0016_verifier.*`, `modules/portal/registrar/**`, `app/(portal)/portal/registrar/**`, `modules/portal/{PortalHeader,Shell,SignOutButton,headerRoles,copy,pageGuard,server,portal.css}`, `modules/portal/review/roles.ts`, `scripts/identity-roles.ts`, tests, docs. Schema `identity` only; no edit to `public`, People.ts or the public site's components.

**Rules held.** The role is granted only by `identity:roles grant-verifier`. Needs a registered passkey (AUTH-07), a strong session, and a fresh second factor to save. Cannot edit their own record. An unknown person, the Verifier's own record and a non-Verifier all look the same (404 / "unavailable"). Source note of 5 to 300 characters is required and kept with each change in an append-only log (`fixed_change`). A reviewer or head cannot be moved to another department here (it would move their approval scope). Delegation never reaches this: the actions use the signed-in account only.

**Risks.** The session does not record whether it began with a passkey or an authenticator app, so "passkey only" means "the account holds a passkey and the session is strong and fresh", not "this session was opened with the passkey". The person is not notified of a change (the log is the record). The header link list is display-only; every page checks the role itself.

**Tests.** Integration (PostgreSQL): who may use it, own-record refusal, freshness, atomic write and log, letter-case department, bad input, reviewer/head department rule, rollback, search escaping, append-only log, grant/revoke. Browser run (14 checks): Registrar flow, faculty blocked, header menu, 390px drawer, no horizontal scroll.

**Gate.** Predictions FPV-a to FPV-c and FPH-a in `docs/predictions.md` recorded before the run, results after.
