# Brief FP-4: idle timeout and absolute lifetime (SES-04)

Branch `fp/session-timeouts`, stacked on `fp/recovery-codes` (PR #29). Date 2026-11-12.

## Objective
Addendum C SES-04: idle timeout 30 minutes, absolute lifetime 12 hours. The library has an absolute lifetime (`expiresIn`, already 12 h) but no idle timeout (spike S-2 finding 7).

## Design and why
Enforced in the handler layer, before the library, for every path that needs a session:
- Read the session with `disableRefresh`, so our own lookup does not reset the idle clock.
- Pure rule: idle if now minus `updatedAt` is over 30 minutes; absolute if now minus `createdAt` is over 12 hours. Either ends the session (row deleted, so revocation is immediate) and the request gets 401 with a redirect to sign-in.
- Otherwise touch `updatedAt` with one conditional statement at most once a minute, so activity keeps the session alive without a write per request.
- No new table and no change to the library. If the touch fails the request still proceeds; the cost is an early idle logout, not a weaker one.

## Not in this slice
The "shared computer" option (15 minutes idle) needs a choice at sign-in and so needs the sign-in page; a client-side warning before expiry; session ID rotation at step-up (SES-03).

## Tests (before the code)
Unit: the rule at the boundaries; handlers (idle and absolute refuse and end the session, active touches, public paths unaffected). Integration with the real library: an idle session is refused and deleted; a session past 12 hours is refused; use keeps a session alive; touch is throttled.

## Risks
The library refreshing the session itself would defeat the idle check. Mitigation: `disableSessionRefresh` in the config, and an integration test that reads `updatedAt` before and after.
