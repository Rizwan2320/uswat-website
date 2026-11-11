# Brief FP-1: identity module and the three controls of our own

Branch `p3/faculty-portal-spec`. Date 2026-11-11. Follows FP-0 (`fp0-faculty-portal.md`, spike report `docs/evidence/FP0/spike-report.md`).

## Owner go, and what it does and does not change
On 2026-11-11 (07:15 PKT) the owner asked the FP agent to continue building. Addendum C's gate G-FP0 (Thu 12 Nov) has three conditions: the Must items green, S-2 passing, and the owner approving the extra scope. The owner's go covers the third. The first is still open and the main agent has said so (STATUS, "Decisions on the route map, importer ownership and G-FP0"); the Thursday report stays honest about it. The FP agent builds in its own lane in the meantime, so it takes no time from the Must list, and everything below is reversible by not merging.
What does NOT change: nothing is created or changed in Vercel or Neon; no identity migration is applied anywhere except a local throwaway database; the second Vercel project stays the owner's step; the portal route is off by default (see Risks), so merging this branch cannot expose a portal on the public site.

## Objective
Turn the three S-2 findings that need our own code into tested modules, and mount Better Auth 1.7.18 on its own route behind a switch:
1. **Enrolment gate (AUTH-01, FPR-01):** a password-only session reaches only the enrolment screens and sign-out until a passkey or TOTP is enrolled.
2. **TOTP replay guard (AUTH-04, PJ2):** a code is accepted once.
3. **Recovery codes (AUTH-05):** hashed, not reversible, single use, regenerate invalidates. Owner waiver is the alternative if hashing proves intrusive; not assumed.

## Paths touched
New only: `apps/web/src/modules/identity/**`, `apps/web/src/app/(portal)/portal-api/auth/[...all]/route.ts`, `apps/web/tests/unit/identity/**`, `apps/web/tests/int/identity/**` (if the integration run allows a second schema), `apps/web/scripts/identity-migrate.mjs`, this brief, evidence under `docs/evidence/FP1/`.
Shared files, additive only: `apps/web/package.json` and `pnpm-lock.yaml` (better-auth, @better-auth/passkey 1.7.18, pg 8.20.0, @types/pg; ADR-0023 carries the rule 9 justification), `docs/STATUS.md` (own section), `docs/predictions.md` (own rows).
Not touched: `src/collections/**`, `src/migrations/**`, `src/governance/**`, `src/payload.config.ts`, `src/site/**`, `src/design/**`, anything Payload runs.

## Risks
- **The portal route on the existing deployment.** The existing Vercel project builds `main` and serves the public site. A portal route there would mean a portal on the CMS origin (against ADR-0020) and would hit a database without the `identity` schema. Mitigation: the handler answers 404 unless `PORTAL_ENABLED=true` and `PORTAL_ORIGIN` are set, no module opens a database connection at import time, and a test proves both. Those variables are set only by the owner on the second project.
- **Lockfile conflicts** with the other agents' PRs. Mitigation: dependencies are added in one small commit that can be rebased; the main agent merges.
- **Library hooks may not expose what the TOTP guard needs** (which account a verify call is for). If so the guard works on the library's second-factor cookie or is replaced by our own verify endpoint; the finding goes in the evidence, not hidden.
- **The enrolment gate sits in front of every portal route**; a gap there is the worst failure. Mitigation: the gate is a pure function with an exhaustive table test, and an integration test per route class.
- Time: five days to 17 Nov. If the controls are not tested by Fri 13 Nov the slice stops at the specification plus these modules.

## Tests (written before the code)
- Unit, pure: gate decision table (no factor, passkey, TOTP, recovery only; each route class); TOTP code once-only with a window; recovery-code issue, hash format, single use, regenerate invalidates; route switch (404 off, no connection at import).
- Integration against the local throwaway PostgreSQL (schema `identity`): FPR-01 (UV=0 rejected; no password-only path reaches a portal page), PJ2 (replayed TOTP rejected), recovery-code single use, revocation on the next request. Re-uses the S-2 scripts where they apply.
- Not claimed unless run: Node 24 in-app, a Vercel build, anything in a browser beyond the virtual authenticator.

## Gate (this brief)
`pnpm typecheck`, `pnpm lint`, `pnpm test:unit` green; the integration cases above pass locally; each result is in `docs/evidence/FP1/` with what was not run. Predictions FP1-a and onward in `docs/predictions.md` before each run.
