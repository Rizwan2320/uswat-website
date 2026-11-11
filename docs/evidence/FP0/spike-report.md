# Spike S-2 report: can Better Auth carry the faculty portal's sign-in?

Dates: 2026-11-10 and 2026-11-11. Branch `p3/faculty-portal-spec`. Brief: `docs/briefs/fp0-faculty-portal.md`. Spec: Addendum C sections 5, 8 and 9 (project doc `addendum 3.txt`). Predictions: `docs/predictions.md` FP0-a, FP0-b, FP0-d (reconciled below).

## What was run, and what was not
Three setups, one test script (`scripts/test.mjs`, 28 checks: 19 pass or fail, the rest INFO), local PostgreSQL 16.15 (port 5544), tables in a separate schema `identity`, Chromium driven by Playwright 1.63.0 with a CDP virtual authenticator (no hardware), Node 22.23.4 for the first six runs; one standalone run on Node 24.22.2 (see table).

| Setup | Library | Server | Raw results |
| --- | --- | --- | --- |
| Standalone | 1.7.18 and 1.7.19, each with passkey user verification `required` and with the library default | plain Node HTTP server (`scripts/server.mjs`) | `results/standalone-{1.7.18,1.7.19}-{required,default}.json` |
| Standalone on Node 24 | 1.7.18, `required` (added 2026-11-11, prediction FP0-e) | same server, Node 24.22.2 | `results/standalone-1.7.18-required-node24.json`: 19 pass, 1 fail (E5), 8 info, identical outcomes |
| In-app, development | 1.7.18, `required` | this repository's Next.js 16.3.3 and Payload 3.93.0 app (scratch copy at `f3e3eea`), library mounted on its own route `/portal-api/auth/*` | `results/in-app-dev.json` |
| In-app, production build | 1.7.18, `required` | same app after `next build` and `next start` | `results/in-app-prod.json` |

Result in every `required` run: **19 pass, 1 fail (E5, TOTP replay accepted), 8 INFO**. The two library-default runs: 18 pass, 1 fail (E5), 9 INFO. The one difference is check D1: with the default, the UV=0 assertion is accepted, so the check cannot pass and is recorded as INFO (it would be a fail against the spec). The in-app files were produced from the scratch copy in `scripts/in-app/` (README there says how to rebuild it). The scratch copy was never committed to `apps/web`.

To reproduce standalone: `scripts/run.sh required 3010` (needs the local PostgreSQL). To reproduce in-app: `scripts/in-app/README.md`.

## Result per S-2 criterion
| Criterion (brief) | Result | Evidence |
| --- | --- | --- |
| Passkey registration and sign-in with user verification required; UV=0 assertion rejected (FPR-01, AUTH-02) | **Pass, only when configured.** With `authenticatorSelection.userVerification = "required"`: registration and sign-in pass and a UV=0 assertion is rejected. With the library default (`"preferred"`) the same UV=0 assertion is **accepted**. Same in 1.7.18, 1.7.19 and in-app | D1 to D3 in all result files; plugin source reads `requireUserVerification` only from that server option |
| TOTP enrolment, secret encrypted at rest, replayed code rejected (AUTH-04, PJ2) | **Partial.** Enrolment works and the stored secret is not plain base32. A code accepted once is **accepted again** in the same 30-second step | E1 to E5 (E5 fails in every run) |
| Ten single-use recovery codes, stored hashed, regenerate invalidates the old set (AUTH-05) | **Partial.** Ten codes, single use and regenerate-invalidates pass. Stored form is the library's reversible encryption, not a hash | F1 to F5 |
| Server-side sessions, opaque id in a `__Host-` cookie, revocation on the next request (SES-01, SES-02, SES-05, FPR-07) | **Pass with non-default cookie config.** Cookie `__Host-portal.session_token`: Secure, HttpOnly, SameSite=Lax, Path=/, no Domain. Revoked session has no session on the next request. Same in-app | G1 to G5 |
| Runs inside this Next.js 16 and Payload 3.93 app without sharing Payload `users` | **Pass in a scratch copy**, dev server and production build: same 19 pass, 1 fail. Needed `pg` and `@types/pg` as direct dependencies (pnpm strict resolution); first runs failed with `Can't resolve 'pg'` and a type-check error until added. Not tested: the in-app run on Node 24 (only the standalone server was run on Node 24), a Vercel deploy, behind a proxy | `results/in-app-dev.json`, `in-app-prod.json` |
| Identity tables created and rolled back without breaking `push: false` (FP0-d) | **Pass.** See FP0-d below. The library compiles its six tables to plain SQL (`identity-up.sql`: user, session, account, verification, passkey, twoFactor); the server never creates tables itself; `identity-down.sql` drops the schema | J1; `scripts/gen-schema.mjs`; `docs/predictions.md` FP0-d |
| OIDC federation (AUTH-08) | Not run (production tier) | n/a |

## FP0-d: do Payload's migrate tools ignore a second schema?
Run on PostgreSQL 16.15 with Payload 3.93.0. `migrate` applied the three repo migrations (113 tables in `public`). Adding schema `identity` with its six tables left the `public` schema dump identical (compared with pg_dump after dropping its random `\restrict` token lines). `migrate:create --skip-empty` wrote no file. `migrate:down`, `migrate` and `migrate:fresh` all left the six identity tables intact. **Caveat:** Payload's tools never recreate `identity`, so a dev reset (`migrate:fresh`) leaves it as it was and a clean database needs the identity SQL run separately; the same must be true for CI. An earlier comparison made while PostgreSQL was down compared two empty files and was discarded and redone.

## Library rate limiter (ABU, partly)
The library's production-mode limiter applied to sign-in: three wrong-password attempts returned 401 and the following ones 429 within about 10 seconds. With the limiter switched off (spike-only switch `RATE_LIMIT=off`) all returned 401. This is a blunt per-IP limit, not the progressive per-account delay and alerts of ABU-01 to ABU-05; those are not run. Behaviour behind Vercel's proxy (which address the library sees) was not tested. One earlier "limiter off" run was invalid because a stale `next-server` child process was still serving the old configuration (port 3020); it was discarded and redone after killing by port.

## Version pin and dependency cost
- **Pin 1.7.18.** 1.7.19 is blocked by the repo's pnpm 11 default supply-chain policy (`minimumReleaseAge` 1 day) until about 2026-11-11 00:25 UTC. Behaviour in the suite is the same on both versions. If we move to 1.7.19 it must be a deliberate bump.
- **Rule 9 (three in, two out).** Adding `better-auth`, `@better-auth/passkey`, `pg` and `@types/pg` adds about 556 lockfile lines. This needs ADR 0023 with a "two out" justification (candidates: the hand-written session, password and sign-in code the spec would otherwise require, and a second WebAuthn library). Draft due at G-FP0, not written yet.
- **Neon.** The main agent found that preview builds share the production database. So the portal build must never run the CMS migration, and I will not place migrations on any branch that gets a preview. Nothing here touched Neon.

## Findings that change the plan
1. **User verification is not enforced by default.** The server config must set `userVerification: "required"`. A test that asserts UV=0 is rejected has to stay in CI (FPR-01), or a library upgrade could silently weaken it.
2. **No mandatory second factor out of the box (AUTH-01).** A user with only a password gets a full session at sign-up and at sign-in (B1, B2). We need our own gate: until a passkey or TOTP is enrolled, the session may reach only the enrolment screens. Designed, not built or tested.
3. **TOTP replay is accepted (AUTH-04).** Needs our own guard: store the last accepted time step per account and reject any code at or below it. Designed, not built or tested.
4. **Recovery codes are encrypted, not hashed (AUTH-05).** Either accept encryption with a key held outside the database as a documented deviation (a waiver by the owner), or replace the library's backup-code check with our own hashed one (hashing a random code with SHA-256 is not custom cryptography, but it is our code).
5. **Cookie naming needs a non-default setup.** With `useSecureCookies: true` the library always prefixes `__Secure-` and the name becomes `__Secure-__Host-portal.session_token`, which loses the `__Host-` guarantees. `useSecureCookies: false` plus `defaultCookieAttributes.secure = true` gives the right name.
6. **Session token is stored raw** in the `token` column, where Addendum C's data model has `idHash`. The browser cookie is longer than the stored token (77 against 32 characters, so it carries a signature; inferred from length, not decoded), so a database leak alone should not be enough to forge a session. Deviation to accept or fix. The library's cookie cache must stay off, or revocation would not be immediate.
7. **Session lifetime.** The library has an absolute lifetime (`expiresIn`); the spec's 30-minute idle limit (SES-04) is not a native setting. Not tested.
8. **Cross-origin POST refused (SES-06: 403); sign-in response identical for an unknown email and a wrong password (AUTH-10; status and body, timing not compared).** Password length 15 enforced with no composition rules (AUTH-03). The breached-password blocklist was not tested (the library's plugin calls an outside host, and the sandbox has no route to it).

## Reconciliation of predictions
- **FP0-a** predicted (60%) that the passkey UV test, the UV=0 rejection and the TOTP replay rejection would all pass from library defaults. Actual: **0 of 3 at defaults** (UV=0 accepted; replay accepted); with one setting changed, UV passes; replay still fails. Snag 1 happened as predicted. Snag 2 (library creating tables outside Payload's migrations) did not happen: the schema comes out as SQL we control, provided nobody runs the library's own `migrate`. Snag 3 happened in another form: the cookie name, not `Secure` on localhost. The in-app run was an addition not covered by the prediction and passed on the first working build after the dependency fixes above.
- **FP0-b** (Payload custom strategy would not be chosen unless Better Auth failed on schema ownership): Better Auth did not fail there. The alternative was not run, so nothing was compared.
- **FP0-d** predicted that Payload's tools would ignore the second schema. Actual: confirmed, with the caveat above. See `docs/predictions.md` for the written prediction and the difference.
- **FP0-c** (G-FP0 ends as a no-go) is still open: it depends on the Must list and on the owner, not on this spike.

## Not run
OIDC federation (AUTH-08); idle timeout (SES-04); step-up (AUTH-09); delegation; progressive delay and alerts (ABU); breached-password check; real devices or phones; load; the in-app run on Node 24; a Vercel deploy; anything on Neon; a Payload custom-strategy alternative (FP0-b); rate limiting behind a proxy; timing comparison for AUTH-10.

## Recommendation, auth side only (the gate decision also needs the Must-list status and the owner's approval)
Better Auth 1.7.18 is viable for passkeys with user verification, server-side sessions and revocation, and it runs inside the Next.js 16 and Payload app on its own route and its own schema without touching Payload's migrations. It is not enough on its own: three controls the spec calls non-negotiable (enrolment gate, TOTP replay guard, hashed or waived recovery codes) need our own code, and the library's configuration has to be set against its defaults (user verification, cookie name, cookie cache off). If the slice goes ahead, the first half day is: build those three controls with tests written first, re-run the in-app suite on Node 24, and write ADR 0023 with the dependency justification. If the slice does not go ahead, the portal ships as the specification plus this report.
