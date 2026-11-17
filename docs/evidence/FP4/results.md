# FP-4 result: idle timeout and absolute lifetime (SES-04) (2026-11-12)

Branch `fp/session-timeouts`, stacked on `fp/recovery-codes` (PR #29), which sits on `fp/session-assurance` (PR #27). Brief `docs/briefs/fp4-session-timeouts.md`. Prediction FP4-a.

## What exists now
Every request that needs a session is checked in our handler before the library sees it: idle over 30 minutes or older than 12 hours ends the session (row deleted, so revocation is immediate) and returns 401 with a redirect to sign-in. This includes `get-session` and sign-out. The session is read with `disableRefresh`, and library refresh is also switched off in the config, so nothing but our own once-a-minute write moves `updatedAt`, and nothing extends `expiresAt`. A timestamp that cannot be read counts as expired. No new table, no migration.

## Results (local PostgreSQL 16.15, throwaway database)
| Check | Result |
| --- | --- |
| Typecheck | pass |
| Lint, my paths | 0 problems |
| Unit, whole app | 20 files, 301 tests pass |
| Identity integration | 22 tests pass (17 before, plus idle, absolute, keep-alive, throttle, store throttle) |
| Production build | compiled, route listed |

## Mutations
| Mutation | Caught |
| --- | --- |
| M16 idle not enforced | yes (5 tests) |
| M17 absolute not enforced | yes (4 tests) |
| M18 `disableRefresh` dropped from our lookup | yes, by a unit test only. The integration tests do not catch it because the config also disables library refresh (two guards, one tested end to end) |
| M19 activity never written | yes |
| M20 SQL throttle removed | **not caught at first** (the JavaScript check in front of it already skips recent sessions). Added a test that calls the store directly; now caught |
| M21 expired session not deleted | yes (4 tests) |

## Side finding
After a user confirms TOTP enrolment, the **earlier password-only session stays in the table** (the library does not delete it). It is harmless to the gate (it is unmarked, so it is not strong) and it expires with the idle rule, but it is a live cookie for up to 30 minutes of idle. Not changed here. A candidate for the SES-03 rotation work.

## Not built or not run
- The "shared computer" option (15 minutes idle): needs a choice at sign-in, so the sign-in page.
- A client warning before the session ends; session ID rotation at sign-in, step-up and role change (SES-03; only the sign-in creation is the library's).
- Behaviour over a real day: the 12-hour and 30-minute limits were tested by changing stored timestamps, not by waiting.
- Clock skew between the app and the database: the app's clock is used for the checks and the database for nothing here; a skewed app server shifts both limits.
- Neon, Vercel, Node 24 in-app.
