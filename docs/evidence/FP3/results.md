# FP-3 result: recovery codes issued and accepted (PJ3) (2026-11-12)

Branch `fp/recovery-codes`, stacked on `fp/session-assurance` (PR #27). Brief `docs/briefs/fp3-recovery-signin.md`. Predictions FP3-a and FP3-b.

## What exists now
- `POST /portal-api/auth/recovery/issue`: needs a session made with a second factor (the gate; class `portal`). Ten codes, old set replaced in one transaction, plain codes returned once, `cache-control: no-store`.
- `POST /portal-api/auth/recovery/sign-in` with `{ email, password, code }`: password checked with the library's verifier, then the code. On success every existing session of the account is deleted, a new session is created with the library's own calls, marked strong, and the number of codes left is returned.
- Migration `0003_recovery_attempt`: failure counter per account. Lockout after 5 failures in 15 minutes, applies even to a correct code. Library per-IP limiter rule on `/recovery/*` (10 per minute).
- Unknown email, wrong password, wrong code and locked account all return the same 401 with the same body (checked on the first three; the locked case checked for status).

## Results (local PostgreSQL 16.15, throwaway database)
| Check | Result |
| --- | --- |
| Typecheck | pass |
| Lint, my paths | 0 problems |
| Unit, whole app | 19 files, 284 tests pass |
| Identity integration | 17 tests pass (10 before this slice, plus issue, PJ3, uniform refusal, wrong password keeps the code, lockout, simultaneous sign-ins, simultaneous spends) |
| Production build | compiled, route listed |

## Mutations (each applied, tests run, then reverted)
| Mutation | Caught |
| --- | --- |
| M11 old sessions not revoked | yes (PJ3 test) |
| M12 password not checked | yes (2 tests) |
| M13 lockout not enforced | yes (2 tests) |
| M14 new session not marked strong | yes (PJ3 test: portal closed to the new session) |
| M15 spend not conditional in SQL (`and "usedAt" is null` removed) | **not caught at first**: the service's own pre-check already skips used rows, and three simultaneous HTTP calls do not reach the window between read and spend (password hashing staggers them). Fixed by testing the store directly: five simultaneous spends, exactly one wins. Now caught. The simultaneous HTTP test is kept as a smoke check; on its own it cannot detect M15 |

## Not built or not run
- Email to the user when a code is used (ABU-03): no mailer exists. Until then a recovery sign-in is silent.
- A prompt to enrol a new authenticator and to remove the lost device's passkey: the recovery session is strong and the old passkey stays registered, so the portal opens. The spec's "enrol a new authenticator" step is the user's to do on the (not built) security page.
- The 24-hour "lost everything" reset (FPR-11) and the security centre page (FP-51).
- A browser test of the full PJ3 with a new passkey (virtual authenticator); the integration test stops at "recovery session is strong and the portal is open".
- Timing comparison for the three failure kinds (only status and body compared).
- Behind Vercel's proxy: which client address the library's per-IP limiter sees.
- Neon, Vercel, Node 24 in-app.

## Note on design
Recovery is one call with the password, not the library's two-factor cookie, because an account whose only factor is a passkey has the library's two-factor flag off and is never given that cookie. The cost is that the endpoint is a second place that checks a password and creates a session, so it is the code in this module that most needs review.
