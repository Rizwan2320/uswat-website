# FP-1 results (2026-11-11): identity module and the three controls

Branch `fp/identity-controls` (stacked on `p3/faculty-portal-spec`, PR #14). Brief: `docs/briefs/fp1-identity-controls.md`. All runs local: Node 22.23.4, PostgreSQL 16.15 on port 5544 (throwaway databases `fp1` and `fp1build`), better-auth 1.7.18. Nothing on Neon or Vercel.

## What was run
| Check | Command (from `apps/web`) | Result |
| --- | --- | --- |
| Baseline before any change | typecheck, lint, `vitest run tests/unit` with dummy env values | typecheck pass; lint 0 errors, 22 warnings (existing); 154 unit tests pass. Note: `env.unit.spec.ts` needs DATABASE_URL, PAYLOAD_SECRET, CRON_SECRET and PREVIEW_SECRET set, so it fails in a bare shell (existing behaviour, not caused by this branch) |
| After | same | typecheck pass; lint 0 errors, same 22 warnings, none in `modules/identity` or `portal-api`; **239 unit tests pass** (85 new) |
| Integration, real library, real PostgreSQL | `IDENTITY_TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5544/fp1 vitest run tests/int/identity` | **9 pass**: migration up, down, up gives an identical schema; public schema untouched; no sign-up or email/SMS endpoints; FPR-01 (password-only session gets 403 on a protected endpoint); TOTP enrolment opens the gate; PJ2 (replayed code rejected at sign-in, fresh code accepted); replay table holds hashes only; SES-05 (deleted session gets 401 on the next request); AUTH-02 (server asks for user verification "required" when registering and signing in) |
| Production build | `pnpm db:migrate` on a throwaway local database (114 public tables), then `pnpm build` | Compiled; route `/portal-api/auth/[...all]` listed as dynamic |
| Switch on the built app (`next start`) | curl | **Off** (no PORTAL_* variables, as on the existing deployment): sign-in, get-session and passkey options all 404 with `cache-control: no-store`; home page 200. **On** (all four variables, local database): passkey options 200 with `rpId` localhost and `userVerification: required`; sign-up 404; protected endpoint without a session 401 |

## Mutation checks (tests must fail when the control is broken)
Unit: recovery codes counted as a factor, prefix matching on public paths, no fail-closed on unreadable factor state, replay guard disabled, recovery code never marked used: all five caught. Integration: replay plugin removed (PJ2 and the hash check fail), gate always sees a factor (FPR-01 fails), passkey user verification left at the default (first run **not caught**, which exposed a gap; the AUTH-02 options test was added and then catches it).

## Not covered, said plainly
- **UV=0 assertion rejected (FPR-01, second half):** proved only in spike S-2 with the Playwright virtual authenticator (`docs/evidence/FP0/results/`). This branch tests that the server asks for `required`, not that a forged assertion is refused; there is no browser test in this branch yet.
- **Recovery codes (AUTH-05):** the hashing module is tested, and the library's own backup-code endpoints are closed (404), but **no endpoint issues or accepts our recovery codes yet, so PJ3 (lost device) does not work**. Building it means creating a session after a recovery code, which touches library internals; not started.
- **Enrolment gate on portal pages:** applied to the auth API route. There are no portal pages yet, so page-level enforcement is untested.
- **Idle timeout (SES-04), step-up (AUTH-09), progressive delay (ABU-01), email alerts (ABU-03), breached-password check, invitation and activation (FP-01), CSRF token beyond the library's Origin check:** not built.
- Library account lockout (10 failures, 15 minutes) is on by default in 1.7.18 and was not tested here.
- Node 24, a Vercel build, Neon, a real browser: not run. The sample user in the tests is `example.test` and fictional.
