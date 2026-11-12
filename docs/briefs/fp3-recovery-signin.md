# Brief FP-3: recovery codes issued and accepted (PJ3, AUTH-05, section 5.6 "lost device")

Branch `fp/recovery-codes`, stacked on `fp/session-assurance` (PR #27) because it uses the session-strength rule. Date 2026-11-12.

## Objective
Make the recovery codes that FP-1 built (hashed, single use) usable: issue them, and let a person who lost their device sign in with one. Addendum C 5.6: "sign in with a code, enrol a new authenticator, all other sessions revoked, email alert". Journey PJ3: lost device, recovery code, new passkey, old sessions dead.

## Design and why
The library's own backup-code endpoints stay closed (its codes are reversible). Two endpoints of ours, in a Better Auth plugin:
1. `POST /portal-api/auth/recovery/issue`: portal class (strong session and a registered factor). Generates ten codes, replaces the old set in one transaction, returns the plain codes once with `cache-control: no-store`.
2. `POST /portal-api/auth/recovery/sign-in` with `{ email, password, code }`: public class. One self-contained call, not the library's two-factor cookie, because a user whose only factor is a passkey has the library's two-factor flag off and so never gets that cookie. It checks the password with the library's own verifier, then the code, then revokes every existing session of the account, creates a new session, and marks it strong.
- Same refusal for unknown email, wrong password, wrong code and locked account (AUTH-10); a dummy hash keeps timing close.
- Lockout: 5 failures in 15 minutes per account, one SQL statement, table `recovery_attempt` (migration 0003). The library's per-IP limiter gets a rule for the path too.
- A code is consumed by one conditional update, so two simultaneous uses cannot both win.

## Paths touched
New: `apps/web/src/modules/identity/{recoveryService,recoveryStore,recoveryPlugin}.ts`, `sql/0003_recovery_attempt.{up,down}.sql`, tests. Edited: `gate.ts` (one public path), `auth.ts`, `migrate.ts`. Not touched: Payload, `src/collections`, `src/governance`.

## Risks
- Session issuance is the most sensitive code in the module. Mitigation: use the library's own `createSession` and `setSessionCookie`, test end to end against the real library, and mutate the checks.
- A recovery sign-in is a password plus a lookup secret; the spec accepts that for lost devices. Revoking all other sessions limits the damage of a stolen code.

## Tests (written before the code)
Unit: service (accept once, wrong code, lock after 5, reset on success, locked refuses even a right code); gate classification. Integration against the real library: issue returns ten codes and the table holds hashes only; PJ3 end to end; regenerate invalidates; same refusal for each failure kind; lockout.

## Not in this slice
Email alert on recovery use (ABU-03, no mailer yet), a prompt to enrol a new authenticator, the 24-hour "lost everything" reset (FPR-11), the Security centre page.

## Gate
Typecheck, lint, unit and identity integration green; mutations caught; evidence in `docs/evidence/FP3/`.
