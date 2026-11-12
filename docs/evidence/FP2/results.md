# FP-2 result: password-only sessions and the enrolment gate (2026-11-12)

Branch `fp/session-assurance`, from `main` at a318f03. Prediction FP2-a in `docs/predictions.md`.

## Finding (a defect in the merged FP-1 code, not a library change)
The gate on `main` counted a **registered** passkey or TOTP as the second factor. It could not tell whether the **session** had used one. The library only asks for a second factor at sign-in when the account's two-factor flag is on, and a user whose only factor is a passkey has that flag off. So email and password alone gave that user a session the gate treated as fully authorised. This breaks AUTH-01 ("a password must never be enough").

Reproduced before any fix: integration test "a user whose only factor is a passkey cannot reach the portal with a password alone" failed on `main` plus the test (a protected call returned 200). Not exposed anywhere: the portal route is off on every deployment (no `PORTAL_*` variable is set), and no identity migration has been applied outside local databases.

A second hole of the same family, found while designing the fix: from such a password-only session, `two-factor/enable` would have let an attacker with only the password add their own TOTP to an account that already has a passkey, then confirm it. Closed by the same change (not run as its own exploit test: covered by the 403 on `two-factor/enable` in the integration test).

## Change
- Migration `0002_session_assurance`: table `session_assurance(sessionId, createdAt)`, cascades with the session. No row means password-only (default deny).
- `sessionAssurancePlugin`: marks a session strong only after a successful passkey sign-in, a completed TOTP step, or passkey registration. A failed call marks nothing.
- Gate: a protected path needs a strong session AND a registered factor. A password-only session may enrol the **first** factor only; once a factor exists, enrolment needs a strong session. Reading the own session and sign-out are open to any session (route class `session`, replacing the old `signout` and moving `get-session` out of `enrolment`).
- Handlers: look up factors and strength for `portal` and `enrolment` paths; any failure counts as not strong.

## Results (local PostgreSQL 16.15, throwaway database)
| Check | Result |
| --- | --- |
| Typecheck | pass |
| Lint, my paths | 0 errors, 0 warnings |
| Unit, whole app | 18 files, 272 tests pass |
| Identity integration (needs `IDENTITY_TEST_DATABASE_URL`) | 10 tests pass (9 before, plus the passkey-only case) |
| Production build | compiled |
| Mutation M9: plugin not registered | caught by "enrols TOTP from a password-only session" |
| Mutation M10: gate ignores session strength | caught, 5 tests fail |

## Not run
- Passkey sign-in and passkey registration marking a session strong: those two paths are covered by the plugin's path list only. No browser or virtual-authenticator test on this branch exercises them, so a mistake there would not be caught.
- First-factor enrolment by someone who only has the password (an invited but unactivated account): out of scope here. The invitation link and department-head activation (Addendum C 5.6, FP-01) are not built, and until they are, whoever holds an account's password can enrol the first factor.
- Neon, Vercel, Node 24 in-app.
