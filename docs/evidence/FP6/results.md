# FP-6 result: the real passkey flows in a browser (2026-11-13)

Branch `fp/browser-passkey-test`, from `main` at 6797d49 (identity code through PR #29). Brief `docs/briefs/fp6-browser-passkey-test.md`. Prediction FP6-a. Scripts and raw results in `docs/evidence/FP6/`.

## What was run
The built app (`next start`, production build) with the portal enabled on `http://localhost:3040`, a throwaway local PostgreSQL 16.15 database `fp6` with identity migrations 0001 to 0003, Chromium 1.63 driven by Playwright with a CDP virtual authenticator (CTAP2, internal, resident key, user verification on), and the real Better Auth browser client against `/portal-api/auth`. Nothing on Neon or Vercel. The user is made with the module's own auth object because sign-up is closed on the route (404).

## Result: 19 of 19 checks pass, twice (`results/run-1.json` before the mutations, `results/run-2.json` after)
| Check | Result |
| --- | --- |
| S1 password sign-in with no factor: protected path 403 (towards enrolment), own session readable | pass |
| S2 first passkey registered from that session (UV required); the session is then strong and the protected path opens | pass |
| S3 sign out, password only again: a session exists but a protected path is 403; adding a TOTP is 403; starting a second passkey is 403 | pass (this is the AUTH-01 hole fixed in PR #27, now shown in a browser) |
| S4 passkey sign-in with UV: session, strong, protected path open, may enrol a further passkey | pass |
| S5 an assertion with UV=0 is rejected, no session (FPR-01, AUTH-02) | pass |
| S6 recovery codes issued from the passkey session; `__Host-portal.session_token` is Secure, HttpOnly, SameSite=Lax, Path=/; a fresh browser signs in with a code, gets a strong session, the old browser session is dead on its next request, and the code works once | pass |

## Mutations: the run notices breakage (each applied, rebuilt, run, reverted)
| Mutation | Browser run |
| --- | --- |
| M33 passkey user verification left at `preferred` | **S5 fails**: the UV=0 assertion gets a session |
| M34 passkey sign-in no longer marks the session strong | **7 checks fail** (S4b, S4c, S6a, S6c, S6d, S6e, S6f): a passkey user is stuck as password-only |
| M35 passkey registration no longer marks the session strong | **S2b fails** |

**First attempt at the mutations was invalid and is discarded.** All three reported 19 pass because `pkill "next start"` does not stop the child `next-server` process, so the old build kept serving port 3040 and the mutated builds never ran (the same trap as in the spike). Caught because three different breakages all "passing" was not believable. The script now kills by port and prints the server's start time against the build time and the process count before each run.

## What this settles, and what it does not
- Settles: the path list in `sessionAssurancePlugin` is right for passkey sign-in and registration; a passkey user can sign in and reach the portal; the UV setting is enforced end to end, and this run can now be repeated in CI-like fashion before any library bump.
- Not claimed: a real device, a phone or a hardware key; behind Vercel (the `__Host-` cookie worked on `http://localhost`, which browsers treat as a secure context, not on https); Node 24; any page UI (none exists, so the gate was exercised through the route only); the S5 control with rewritten options and a verified authenticator (the S6 passkey sign-in after S5 shows the authenticator works again, but it is not the same request); the sign-in delay, the idle timeout and the TOTP paths (those are in PR #33, PR #36 and the earlier integration tests, not on `main` or not part of this run).
- Not part of the repo's CI: this run needs Chromium, Playwright and a database, so it lives as an evidence script, not as a test in `pnpm test`.
