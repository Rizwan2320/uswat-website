# Brief FP-5: progressive delay after failed password sign-ins (ABU-01)

Branch `fp/signin-delay`, stacked on `fp/session-timeouts` (PR #33). Date 2026-11-12.

## Objective
Addendum C ABU-01: "progressive delay per account and per IP after failed attempts; no permanent lockout, which attackers could use to block staff". Today the only brake on password guessing is the library's blunt per-IP limiter (3 attempts per 10 seconds, spike S-2) and our recovery-code lockout.

## Design and why
In the handler layer, around the library's `POST /sign-in/email`:
- Two counters, keyed by a SHA-256 of the normalised email (the same whether or not the account exists, so the answer never shows which accounts exist, AUTH-10) and of the client address.
- Account: 3 free failures, then a wait of 1, 2, 4 ... seconds after the last failure, capped at 15 minutes. Address: 20 free failures (a campus network sits behind few addresses), same doubling, capped at 5 minutes. Counts decay after an hour without failures.
- During a wait the request is refused with 429, `Retry-After` and `no-store`, **even if the password is right** (otherwise the wait would only slow honest users).
- A sign-in that gets past the password (a session, or the second-factor step) clears the account counter, not the address counter.
- No permanent lockout. Passkey sign-in and recovery are not touched by this counter, so a person whose password is being attacked can still sign in with a passkey.
- One table `signin_failure` (migration 0004), one conditional upsert statement per failure.

## Known cost, to be accepted by the owner
Someone who knows a staff email can keep that account's password sign-in waiting for up to 15 minutes by failing on purpose. That is the spec's trade-off (delay, not lockout); the cap and the passkey route limit it. The per-address counter is only as good as the address Vercel passes; not tested behind Vercel.

## Not in this slice
Alerts on more than 5 failed second-factor attempts and on new country or impossible travel (ABU-02, production tier), the email to the user (ABU-03, no mailer), the breached-password check (AUTH-03).

## Tests (before the code)
Unit: the delay schedule and its cap, decay, the account and address independence, success clears the account only, a right password is refused during a wait. Handlers: 429 with `Retry-After`, the body is not consumed for the library, other paths unaffected. Integration: real sign-in failures lead to 429; a right password inside the wait is refused; the store upsert under simultaneous failures counts them all.
