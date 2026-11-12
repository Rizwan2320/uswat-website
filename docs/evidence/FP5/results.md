# FP-5 result: progressive delay after failed password sign-ins (ABU-01) (2026-11-12)

Branch `fp/signin-delay`, stacked on `fp/session-timeouts` (PR #33), then `fp/recovery-codes` (#29), then `fp/session-assurance` (#27). Brief `docs/briefs/fp5-signin-delay.md`. Prediction FP5-a.

## What exists now
Around the library's `POST /sign-in/email`, in our handler:
- Two counters keyed by SHA-256 hashes (normalised email; client address). Account: 3 free failures, then a wait of 1, 2, 4 ... seconds from the last failure, capped at 15 minutes (the cap is reached at the 14th failure). Address: 20 free failures, same doubling, cap 5 minutes. Counts start again after an hour without a failure.
- During a wait the answer is 429 with `Retry-After` and `no-store`, even for a correct password, and the library is not called. The answer is the same for an unknown email (AUTH-10).
- Only a library 401 counts as a failure; 200 (a session, or the second-factor step) clears the account counter, not the address counter. The library's own 429, a 400 or a 500 count for nothing.
- No permanent lockout. Passkey sign-in and recovery sign-in are not held by this counter.
- If the counters cannot be read the request gets 503 (not waved through); if a failure cannot be recorded the library's answer still goes out.
- Migration `0004_signin_failure` (hashes only). One conditional upsert per failure.

## Results (local PostgreSQL 16.15, throwaway database)
| Check | Result |
| --- | --- |
| Typecheck | pass |
| Lint, my paths | 0 problems |
| Unit, whole app | 21 files, 325 tests pass |
| Identity integration | 27 tests pass (22 before, plus delay and recovery, no permanent lockout, hashes only, 20 simultaneous failures counted, hour decay) |
| Production build | compiled, route listed |

## Mutations (each applied, tests run, reverted): 8 of 8 caught
Success not clearing the account; account counter ignored; never refusing; any non-200 counted; SQL not counting; SQL without decay; failing open when counters are unreadable; wait never growing. All were caught on the first run; none needed an extra test.

## Cost the owner should know
Someone who knows a staff email can keep that account's **password** sign-in waiting for up to 15 minutes by failing on purpose (the spec's choice: delay, not lockout). The owner can still get in with a passkey or a recovery code from another address. Staff behind one campus address share the 20-failure allowance of the address counter; the address wait is capped at 5 minutes.

## Not built or not run
- The library's own per-IP limiter (3 per 10 s) was **not** on in these tests (it is off outside production mode), so its interaction with this delay was not exercised. The design does not count its 429s, but this is untested together.
- Client address behind Vercel: `x-real-ip`, then the first `x-forwarded-for`. Not tested behind Vercel; a wrong value weakens only the per-address counter.
- Alerts on more than 5 failed second-factor attempts and new country or impossible travel (ABU-02, production tier); the email to the user (ABU-03, no mailer); the breached-password check (AUTH-03); a delay on the second-factor step (the library limits `/two-factor/*` to 3 per 10 s per IP).
- Timing comparison of known and unknown emails. Real wait times were tested with a one-second wait only; longer waits are unit-tested on the schedule.
- Neon, Vercel, Node 24 in-app.
