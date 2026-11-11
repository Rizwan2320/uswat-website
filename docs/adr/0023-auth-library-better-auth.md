# ADR-0023: Portal sign-in uses Better Auth 1.7.18 plus three controls of our own

Status: Proposed (becomes Accepted only if gate G-FP0 passes and the slice goes ahead)
Numbering: this is Addendum C's "ADR-0013" (auth library chosen by spike S-2, no custom cryptography). See ADR-0020 for the mapping.

## Context
Addendum C requires mandatory two-factor sign-in, passkey first, TOTP fallback, recovery codes and server-side sessions, with no hand-rolled cryptography (AUTH-01 to AUTH-06, SES-01 to SES-06). Spike S-2 (`docs/evidence/FP0/spike-report.md`) ran the library against those rules, standalone and inside this repository's Next.js 16.3.3 and Payload 3.93.0 app.

## Decision
1. Use `better-auth` and `@better-auth/passkey` **pinned at 1.7.18** (exact versions, no ranges), with its two-factor plugin, on its own route and in its own PostgreSQL schema `identity` (ADR-0020). The library never creates tables; the SQL is generated, reviewed and committed.
2. Configure against the library defaults: passkey `authenticatorSelection.userVerification = "required"`; `useSecureCookies: false` with `defaultCookieAttributes.secure = true` and a `__Host-` prefix; session cookie cache off.
3. Write three controls ourselves, tests first: (a) an enrolment gate, so a password-only session can reach only the enrolment screens (AUTH-01); (b) a TOTP last-used-step guard (AUTH-04); (c) recovery codes hashed with a random-code SHA-256 check, or a written owner waiver for the library's reversible encryption (AUTH-05).
4. Keep in CI: the UV=0 rejection test (FPR-01) and the TOTP replay test, so a library upgrade cannot weaken either silently.
5. Add `pg` and `@types/pg` as direct dependencies of the portal (pnpm strict resolution needs them).

## Alternatives considered
| Option | Why not |
| --- | --- |
| Payload custom auth strategy | Same table as the admin realm (ADR-0020); would also need our own passkey and TOTP code. Not run in the spike (FP0-b), so nothing was compared |
| Hand-written WebAuthn and TOTP | Excluded by Addendum C ADR 0013 (no custom cryptography) |
| Library defaults as shipped | Fail the spec: UV=0 assertion accepted, wrong cookie prefix, password-only sessions |
| Better Auth 1.7.19 | Behaved the same in the suite; blocked by the repo's pnpm release-age policy until about 2026-11-11 00:25 UTC. Move only by a deliberate bump with the suite re-run |

## Evidence
`docs/evidence/FP0/results/` (six runs: 1.7.18 and 1.7.19 standalone, each with `required` and the default; in-app dev and production build): 19 pass, 1 fail (TOTP replay), 8 info in every `required` run. FP0-d: Payload's migrate tools leave the `identity` schema intact.

## Dependency cost and "three in, two out" (CLAUDE.md rule 9)
In: `better-auth`, `@better-auth/passkey`, `pg`, `@types/pg` (about 556 added lockfile lines, measured in the scratch copy).
Out (what it lets us not write or carry): (1) our own WebAuthn registration and assertion verification and its CBOR and attestation handling; (2) our own session, password-hash and rate-limit plumbing. A third candidate is a second WebAuthn library, which we never add. I have not measured the lines these would have cost, so this is a justification, not a count.

## Consequences
Three controls are ours to write and test. Supply chain: exact pins, the release-age policy stays on, and the lockfile diff is reviewed. Session token is stored raw in the library's table (the spec's data model says `idHash`); the signed cookie value means a database leak alone should not forge a session (inferred from lengths, not decoded). Idle timeout (SES-04) is not native and still has to be built. Not tested: Node 24, a Vercel deploy, behind a proxy, OIDC federation.

## Cost of reversal
Medium after users enrol: passkey records live in the library's `passkey` table, so changing library means a data migration or re-enrolment. Low before.

## Reversal trigger
A library release that weakens a CI-checked behaviour; an unfixed advisory; or the ASVS 5.0 L2 review failing on a control we cannot patch.

## Owner
Project owner; FP branch implements.

## Review date
Thu 12 Nov 2026, at G-FP0.

## Prediction
The three controls take about one working day with tests written first; the likeliest snag is the enrolment gate, because it has to sit in front of every portal route and the library has no hook for it.
