# ADR-0011: Faculty portal is its own phase and its own deployment, in the same repository

Status: Proposed (decided by the delegated owner authority on 2026-11-10; becomes Accepted at gate G-FP0)
Numbering: this is Addendum C's "ADR-0010" (faculty portal inside the monolith, separate origin, own identity realm). Renumbered because 0010 is taken by `0010-governance-policy-in-hooks.md`. Addendum C's 0011 to 0014 become 0012 to 0015.

## Context
Addendum C (2026-11-09) adds a faculty portal with mandatory two-factor sign-in. It says the portal is a separate origin with its own identity tables, inside the monolith. The CMS has about ten trusted staff on the Payload admin. The portal would have hundreds of faculty and can change what the university says publicly about named people. The deadline is 17 Nov and the portal is gated at G-FP0 (Thu 12 Nov), below the Must list.
The existing Vercel project `uswat-website` is git-linked to `main`, runs migrations in its build (ADR-0005), has Deployment Protection off, and serves the public demo.

## Decision
1. **Separate phase.** The portal is phase FP, scheduled after the Must list. It is not a P3 slice and it does not change the CMS gates.
2. **Separate from the CMS in identity.** Portal accounts live in their own realm (`modules/identity`, not Payload `users`). No portal account can hold a CMS role.
3. **Same repository.** One codebase and type system, new modules `modules/identity` and `modules/portal`, same design tokens, content reached only through the content service and Payload hooks.
4. **Separate deployment on its own origin, created only after G-FP0 passes.** A second Vercel project from the same repo, with its own host, cookie scope and CSP. Nothing is created before the gate, because a git-linked second project would build on every push.
5. **Separate database objects.** Identity tables in their own PostgreSQL schema `identity`, created by one reviewed migration owned by the FP branch. The public CMS schema stays under the P3 lane. The portal project gets its own connection string and its own database role without rights on CMS content tables, except through the content service.
6. **If G-FP0 fails**, nothing is deployed. The portal ships in the submission pack as the specification plus the S-2 spike report.

## Alternatives considered
| Option | Why not |
| --- | --- |
| Integrate into the CMS (Payload users, `/admin`) | Shares accounts and cookies with the admin realm; password-based auth; one phished faculty login could reach the CMS |
| Separate repository | Duplicates tokens, content types and tests; breaks rule 8 coordination; no benefit the separate deployment does not already give |
| Same Vercel project, path-only | Cookies, CSP and the passkey RP ID are shared with the public site; kept only as the fallback if a second project cannot be created |
| Create the second project now | Nothing to deploy; a git-linked project would build and could run migrations against live Neon on every push |

## Evidence
Addendum C sections 0.2, 4.1, 5.3 and 6.1. Vercel project settings read 2026-11-10 (git-linked `main` domain, Node 24.x, protection off). Repo: `docs/adr/0005-migrate-on-vercel-build.md`.

## Consequences
Two Vercel projects on one free team (Hobby limits apply to each). The portal build must NOT run the CMS migration step against the shared database: its build command differs, and it needs its own reviewed migration path. Environment variables and secrets are entered by the owner in the dashboard, never in the repo or chat. Demo passkeys are bound to the demo host and will be re-enrolled at cutover (Addendum C section 5.3).

## Cost of reversal
Low before G-FP0 (nothing built). After: merging back to one deployment is a config change, but identity tables and enrolled passkeys would have to move or be re-enrolled.

## Reversal trigger
A second Vercel project cannot be created or exceeds free limits; or the university supplies an identity provider that makes a separate realm unnecessary.

## Owner
Project owner (delegated decision recorded 2026-11-10); FP branch implements.

## Review date
Thu 12 Nov 2026, at G-FP0.

## Prediction
The decision costs no time before G-FP0 because nothing is created. If the gate passes, creating and configuring the second Vercel project takes under one hour, and the likeliest snag is the build command running the CMS migrate script by default.
