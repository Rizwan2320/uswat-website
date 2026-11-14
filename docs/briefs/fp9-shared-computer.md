# Brief FP-9: "shared computer" sign-in option (SES-04)

Branch `fp/shared-computer`, stacked on `fp/step-up-on-main` (PR #55). Date 2026-11-14.

## Objective
Sign-in pages offer "This is a shared computer". A session made with it ends after 15 minutes without activity (normal sessions: 30). The 12-hour absolute limit is unchanged. Spec: SES-04, risk row "Shared lab computers".

## Design and why
- The choice must survive a multi-step sign-in (password, then code) and the passkey and recovery paths, so the page sets a short-lived cookie `__Host-portal.shared=1` (10 minutes, Secure, SameSite=Lax, Path=/) before submitting. Each place that makes a session reads it and records the session in a new table `session_shared` (migration 0006).
- Only the stricter direction can be requested by the browser: setting or removing the cookie can only move a session between 30 and 15 minutes idle, never longer. An unreadable flag is treated as shared (stricter).
- The idle check reads the flag with the session; the rest of the lifetime logic is unchanged.
- No new dependency, no new endpoint.

## Tests before code
Unit: idle boundary 15 minutes shared vs 30 minutes normal, absolute unchanged, unreadable timestamps still invalid; the cookie reader; session state treats a failing flag lookup as shared. Integration (real PostgreSQL): the sign-in with the cookie records the session, without it does not; a shared session idle 16 minutes is refused with 401, a normal one is not; recovery sign-in honours the cookie; migration 0006 up and down. Browser: tick the box, sign in with password and code and with a passkey, age the session 16 minutes in the database, see the "signed out" notice; untick and see the session survive.

## Not in this slice
Server-side cleanup of expired rows; an admin setting for the 15 minutes (the number is a constant, spec says university IT can adjust); a visible countdown.
