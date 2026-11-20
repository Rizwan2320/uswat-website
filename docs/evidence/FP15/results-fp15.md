# FP-15 results: security centre, the missing half (FP-51, PJ8)

Date 2026-11-20. Branch `fp/security-centre` (from main, then merged with main after #93). Brief `docs/briefs/fp15-security-centre.md`; predictions FP15-a and FP15-b.

## What was built
- Migration 0010: `identity.security_event` (account, type, outcome, network prefix, time) and `identity.security_alert` (open or acknowledged). Both go with the account when it is deleted.
- Events recorded by one plugin: password accepted, passkey sign-in, authenticator sign-in, recovery sign-in, passkey added or removed, recovery codes issued, sign out everywhere, "This wasn't me". A wrong password is recorded for known accounts only, at most once per 10 minutes per account, so failures cannot push real events out of the last 50 and the log cannot be used to test which emails exist.
- `/security/sign-out-everywhere` and `/security/not-me`: our own endpoints, in the gate's `portal` class (second-factor session required, closed by default), not step-up. "This wasn't me" ends every session first, then raises the alert and logs it, and answers whether the alert was written; the page never says the administrator was told when they were not. If ending sessions fails, the alert is still tried and the error is returned.
- Page: a table of the last 50 events (caption, column headers), the network of each device as a prefix, passkey synced or this-device-only, both buttons behind a confirmation, and notices on the sign-in page afterwards.
- `pnpm identity:alerts [--ack <id>]` lists and acknowledges alerts, because there is no mailer or admin role yet. The screen says no email is sent.
- The library now reads `x-real-ip` then `x-forwarded-for`, the same as the throttle and the log.

## What was run
- Unit (45 + 12 in the two security specs): address prefix (v4, v6, v4-in-v6, junk, 20 malformed inputs), header choice, event types equal to the SQL check list, gate class for both endpoints, order and failure behaviour of both actions (end first, alert failure still ends sessions, end failure still tries the alert and logs a failure), no throw from logging, wording for every event type, network labels never show a full address, no Node import in the browser helper.
- Integration (real PostgreSQL 16 and the real library, 17 new): last 50 newest first for one account only, limit clamps, failure coalescing at exactly 10 minutes, database refusals, cascade delete, events logged for password, authenticator, recovery issue and recovery sign-in, wrong password logged once and not for an unknown address, no full address stored, session address equals log address, both endpoints end all of this account's sessions and nobody else's, refused without a session and for a password-only session, repeated "This wasn't me" gives separate alerts, alert queue order and single acknowledgement, malformed ids, retention purge, alerts never purged. 102 of 102 in the file; 846 of 846 across all unit and integration tests (the only failing file is `tests/unit/env.unit.spec.ts`, which needs CMS secrets and fails the same way on main).
- Mutation checks: 15 deliberate breakages (swallowing an end failure, wrong outcome, alert before ending sessions, no coalescing, oldest first, no cap, other accounts' events, no id check, doubled retention, failures not logged, library ignoring x-real-ip, cookie left after sign out everywhere, prefix keeping the last byte, failure not flagged, alert queue order). All caught against a passing baseline.
- Browser (`scripts/security-run.mjs`, Chromium, production build, virtual authenticator; the second device is a second browser context given a copy of the passkey, so it signs in for real): 28 of 28 in `results/security-run.json`. Covers: signed-out redirect and 401 on both endpoints; the enrolment history newest first; prefix only; table caption and headers; passkey synced flag; the second device listed with browser and network; cancel leaves everything alone; keyboard; a request from another origin is refused (403) and changes nothing; sign out everywhere (notice, other device dead, no sessions, no alert, old cookie dead); history after signing back in; wrong password logged once and shown as Failed; PJ8 end to end (notice, other device dead, one open alert with the prefix, listed and acknowledged with the command, press visible in the history); 390 px with no sideways scroll and all four columns visible; every stored network is a /24 prefix; a second account sees only its own history.
- Screenshots: `shots/security-desktop.png`, `shots/security-390.png`.

## Defects found
- The library stored 127.0.0.1 as a session's address because it reads only `x-forwarded-for`; my log reads `x-real-ip` first. Fixed (one header order for the library, the throttle and the log), with a test.
- At 390 px the Result column, which carries the Failed marker, was cut off by the table's own scrolling. Fixed with tighter padding on small screens, with a check that the table fits.
- Script mistakes (not product defects): ambiguous locator, a session left by the seed script, a copied passkey whose counter did not increase (the library correctly refused it as a possible clone), Next's route announcer matching `role=alert`, text that also appears in the section intro, a wrong unit expectation about when "password accepted" is logged.

## Not run, and why
- The passkey-removed event: the only passkey cannot be removed in the UI and no second one was made, so that hook is untested.
- Approximate location: no GeoIP data source and no approval. The page shows the network prefix and says locations are not looked up.
- Passkey last-used time: the library does not record it.
- Email to the Platform Admin: no mailer. An admin screen: no privileged roles (AUTH-07 is production tier).
- Real devices, https, a screen reader, a phone's native confirm dialog.
- Behaviour behind a host that does not overwrite `x-real-ip` (on Vercel the platform sets it; elsewhere a caller could set it, which the throttle already trusts).

## Open decisions for the owner
- Retention of security events: 180 days is my demo choice (`EVENT_RETENTION_MS`), not a policy. Needs a data-protection decision.
- The library keeps the full network address in the session row for as long as the session lasts (the log keeps only the prefix). Whether to turn that off is a data-protection decision; the sessions list shows only the prefix either way.
- After "This wasn't me" the spec says revoke and alert only. Someone who has the password and a second factor can sign in again; deciding whether the account is then suspended is the administrator's call.
