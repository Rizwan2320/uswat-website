# Brief FP-6: run the real passkey flows in a browser against the merged identity code

Branch `fp/browser-passkey-test`, from `main` at 6797d49. Date 2026-11-12. Evidence only: scripts and results under `docs/evidence/FP6/`; no change to `apps/web` unless the run finds a defect (then a separate fix commit).

## Why
Every earlier test of the gate, session assurance, recovery and timeouts used the library through its server API with the passkey table filled by hand or TOTP only. Nobody has yet registered a passkey, and signed in with one, through the real route, gate and plugins that are now on `main`. PR #27 marks a session strong after a passkey sign-in or registration, and that path is covered by a path list only. If it were wrong, a passkey user could never reach the portal. The user-verification rejection (FPR-01) was proved in the spike S-2 only, not on this code.

## What is run
The built app (`next start`) with `PORTAL_ENABLED=true` on `http://localhost`, a throwaway database, Chromium driven by Playwright with a CDP virtual authenticator (no hardware), the real Better Auth browser client against `/portal-api/auth`. Users are made with the module's own auth object because sign-up is deliberately closed.
Scenarios: (1) password sign-in with no factor: protected path refused, enrolment allowed; (2) register the first passkey from that session: the session becomes strong; (3) password-only sign-in again: refused at protected paths and cannot add a second authenticator; (4) passkey sign-in with user verification: strong session, protected path open; (5) a user-verification=0 assertion is rejected; (6) recovery codes issued from the passkey session and used in a fresh browser: old session dead, new one strong; (7) idle limit through the running server.

## Not claimed
Real devices, a phone, hardware keys, behind Vercel, Node 24, any page UI (none exists).
