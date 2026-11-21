# Brief FP-15: security centre, the missing half (FP-51, competition tier)

Branch `fp/security-centre`, from main (e7fb1ff). Independent of PR #93 (CV). Date 2026-11-20.

## Objective
Finish spec FP-51 and journey PJ8. Today `/portal/security` lists passkeys, recovery codes and other devices, and can sign out one or all other devices. Missing: the last 50 security events, "Sign out everywhere" (every session including this one), "This wasn't me" (revokes every session and raises an alert for the Platform Admin), passkey "synced or not", and the network of each session.

## Design
- New table `identity.security_event` (migration 0010): account, type, outcome, ip prefix, time. The prefix is the first 24 bits of an IPv4 address or 48 bits of an IPv6 address, never the full address (spec section 7: `ipPrefix`).
- New table `identity.security_alert` (same migration): an alert queue for the Platform Admin. Operators read it with `pnpm identity:alerts [--ack <id>]`. There is no mailer and no admin role yet (AUTH-07 is production tier), so nothing is emailed; the screen and the file say so.
- Events recorded: password accepted, passkey sign-in, authenticator sign-in, recovery sign-in, failed password attempt (known accounts only, at most one per 10 minutes so an attacker cannot bury real events), passkey added or removed, recovery codes issued, sign out everywhere, this wasn't me.
- Our own endpoints `/security/sign-out-everywhere` and `/security/not-me` inside the identity plugin set. They fall to class `portal` in the gate (strong session needed, default deny) and are not step-up: protective actions must stay easy. "This wasn't me" writes the alert first, then ends every session regardless of whether the alert could be written, and says which of the two happened.
- The page reads events on the server for the signed-in account only. Sessions show the network prefix; approximate location is not looked up (no data source, no approval).
- Passkeys show synced or this-device-only from the library's own `backedUp` flag. "Last used" is not shown: the library does not record it.
- Retention: events older than 180 days are removed by `pnpm identity:purge`. 180 days is my choice for the demo, not a policy; it is a data-protection decision for the university.

## Tests before code
Unit: ip prefix (v4, v6, v4-mapped, junk, unknown), event allow-list, plain-English descriptions, 50-row cap in the view model. Integration (real PostgreSQL and the real library): events recorded for password, passkey-less recovery sign-in, failed attempt (rate-limited to one per 10 minutes), only the owner's events returned, last 50 newest first; sign out everywhere ends all sessions of that account and no one else's; this wasn't me ends all sessions, raises one alert, writes one event, still ends sessions when the alert cannot be written; both endpoints refused without a second-factor session; purge removes old events only. Browser: events appear, both buttons need confirmation, a second signed-in device is dead after each, alert row exists, keyboard only, 390 px.

## Not in this slice
Email to the Platform Admin (no mailer), an admin screen (no privileged roles), approximate location from GeoIP, passkey last-used time, per-event detail beyond the spec fields, suspending the account after "This wasn't me" (the spec says revoke and alert only; the admin decides what next).
