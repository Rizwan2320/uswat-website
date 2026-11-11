# Brief FP-0: faculty portal, specification intake and auth spike S-2

Branch `p3/faculty-portal-spec` (cut from `main` at ef8d627). Date 2026-11-10. Source: project doc `addendum 3.txt` (Addendum C, "Faculty Portal: Specification v1", 2026-11-09). Where Addendum C disagrees with plan v2 or the 2026-11-06 addendum on anything about the faculty portal, Addendum C wins (its section 14 lists the edits).

## Objective
Get the faculty portal to a decision point by **gate G-FP0 (Thu 12 Nov evening)** without touching the Must list work or the public site. Concretely:
1. Reconcile Addendum C with the repo (numbering, lanes, data rules) so nobody builds on a clash.
2. Run spike **S-2**: can one auth library give passkeys with user verification required, TOTP with replay protection, recovery codes and server-side sessions, beside Payload 3.93 in this app? Evidence goes in `docs/evidence/FP0/`.
3. Hand the owner a clear go or no-go for the C-tier slice (Addendum C section 10). No-go means the portal ships in the submission pack as the specification plus the spike report.

## Paths touched
New only: `docs/briefs/fp0-faculty-portal.md`, `docs/evidence/FP0/**`, ADR drafts under `docs/adr/` (numbers below), and a throwaway spike under `docs/evidence/FP0/scripts/` (same pattern as `docs/evidence/G0/scripts/`).
Appended: `docs/predictions.md` (own rows FP0-*), `docs/STATUS.md` (own section).
Not touched: `src/collections/**`, `src/governance/**`, `src/migrations/**`, `src/payload.config.ts`, `src/design/**`, `src/site/**`, `src/app/**`. No product code and no migration until G-FP0 passes and the lane question below is settled.

## Findings from reading Addendum C against the repo
1. **ADR number clash.** Addendum C names its ADRs 0010 to 0014, but 0010 (governance) and 0011 (CMS routes on the site shell) exist. **Settled by the main agent: the portal ADRs are 0020 to 0024** (see Decisions). The earlier renumbering proposed here (0011 to 0015) is withdrawn: Addendum C 0010 (monolith, separate origin, own identity realm) becomes **0011**; 0011 (mandatory MFA, passkey-first) becomes **0012**; 0012 (Odoo and HR stay systems of record) becomes **0013**; 0013 (auth library from S-2) becomes **0014**; 0014 (RP ID `portal.uswat.edu.pk`) becomes **0015**. ADRs stay Proposed until their gate.
2. **Lane conflict (CLAUDE.md rule 8, P3 coordination brief).** The portal needs new tables (`identity.*`, `portal.*`) and, in the CMS, `People` fields (`claimedBy`, per-field `visibility`, `facultyStatus`) plus `origin = faculty`. Collections, schema and migrations belong to the P3 agent; one migration per PR. So before any non-spike code: the main agent or owner decides who owns the portal schema, and whether Better Auth (or any library) may own its own tables or must go through Payload migrations.
3. **Two schema owners is the real technical risk.** Payload runs with `push: false` and generated migrations. A library that wants to migrate its own tables would be a second schema owner. S-2 must show how the identity tables are created and rolled back without breaking that rule (FF-10).
4. **Separate origin on the demo.** Addendum C wants a separate origin for the portal. The demo is one Vercel project on `uswat-website.vercel.app`. Options: a second Vercel project from the same repo, or a path-only demo with the cookie and CSP differences documented as a known gap. Owner decision. WebAuthn RP ID follows the host, so demo passkeys will not carry over to `portal.uswat.edu.pk` (already stated in Addendum C).
5. **Time.** Today is Tue 10 Nov, the deadline Tue 17 Nov. Addendum C section 0.4 puts the portal below the Must list and gates it on G-FP0 on Thu 12 Nov, which needs the importer, templates and redirects Must items green. I do not control that part; the gate will say so if it is not met.
6. **Data rules still apply.** Demo accounts use fictional faculty marked Sample. Real faculty appear only with written consent. No student data. The 185 imported People records are not committed to the public repo (STATUS "Inputs received"). Odoo is not called, ever, from here.

## Work plan (Tue 10 to Thu 12 Nov)
| When | Work | Output |
| --- | --- | --- |
| Tue 10 | This brief; predictions FP0-a to FP0-c; list of S-2 pass criteria | brief, predictions |
| Wed 11 | S-2 on a throwaway spike against a local PostgreSQL 16 (the sandbox cannot reach Neon): chosen library, Playwright virtual authenticator, no hardware | `docs/evidence/FP0/spike-report.md` and scripts |
| Thu 12 | Reconcile predictions with results; write the G-FP0 note: pass, fail or workaround per criterion, with a recommendation | `docs/evidence/FP0/g-fp0.md`, ADR 0023 proposal |

## S-2 pass criteria (from Addendum C sections 5, 8 and 9)
- Passkey registration and sign-in with `userVerification: required`; an assertion with UV=0 is rejected (FPR-01, AUTH-02).
- TOTP enrolment; a replayed code is rejected; secret encrypted at rest (AUTH-04, PJ2).
- Ten single-use recovery codes, stored hashed; regenerating invalidates the old set (AUTH-05).
- Server-side sessions with an opaque ID in a `__Host-` cookie; revoking a session or authenticator takes effect on the next request (SES-01, SES-02, SES-05, FPR-07).
- Runs inside this Next.js 16 and Payload 3.93 app without sharing the Payload `users` collection (ADR realm split).
- Identity tables created and rolled back in a way that respects `push: false` (finding 3).
- OIDC federation (AUTH-08) is a P-tier item: noted, not run unless time allows.

## Risks
- Library compatibility with Next 16, React 19 or Payload's bundling is unknown until run.
- A library default may not enforce UV or the flag check; the spike must test it, not trust documentation.
- Passkey enrolment is hard to demo to judges without a prepared device; the virtual authenticator proves CI, not usability.
- Scope pressure on the Must list. Authentication rules are never cut, but the slice can be dropped whole.

## Tests
S-2 is evidence, not product tests. If the slice goes ahead, the Addendum C journeys PJ1 to PJ8 and requirements FPR-01 to FPR-10 become the test plan, written before the code.

## Gate (this brief)
G-FP0 note exists in `docs/evidence/FP0/` with each S-2 criterion marked pass, fail or workaround and a go or no-go recommendation. Anything not run says "not run" and why.

## Decisions (owner delegated authority on 2026-11-10: "decide yourself")
1. **Separate phase, separate deployment, same repository** (ADR-0020, Proposed). Identity is its own realm; no portal account can hold a CMS role. The second Vercel project is created only after G-FP0 passes, never before, because a git-linked project builds on every push and the existing project's build runs migrations (ADR-0005).
2. **ADR numbers: 0020 to 0024**, as assigned by the main agent. Addendum C 0010 = 0020, 0011 = 0021, 0012 = 0022, 0013 = 0023, 0014 = 0024.
3. **Schema ownership.** FP owns a separate PostgreSQL schema `identity`; the P3 agent keeps `public`. Both agents acknowledged (see below). Still open: the main agent has to agree how the identity migration is applied and rolled back (section "Identity schema application") before any migration is written.
4. **Demo origin.** At G-FP0, if it passes, I propose a separate Vercel project with exact settings and wait for the owner's go (creating it, env vars and DNS are the owner's, per the main agent's brief). Path-only on the existing host is the fallback and its gap must be written into the submission pack.
5. Addendum C open questions Q1 to Q5 are still unanswered; none block S-2.

## Acknowledgements received (2026-11-10)
- **Main agent**, on `main`: `docs/briefs/FP-faculty-portal-coordination.md`. Lane `src/modules/identity/**`, `src/modules/portal/**`, `src/app/(portal)/**` is FP. Portal ADRs 0020 to 0024. Second Vercel project, env vars and DNS: propose, do not do. Identity tables outside Payload need an agreed apply and rollback plan before any migration.
- **P3 agent**, on PR #4's branch (`p3/followups-3d`), file `docs/briefs/p3-fp-interface.md`, not yet on `main`: confirms the FP paths and ADR range, will not build identity, plans one later migration for People, `faculty` origin and `onBehalfOf` together. It asks three questions, answered next.

## Replies to the P3 agent's three questions (proposals; the P3 agent adds nothing until FP confirms in a PR comment)
1. **Allow-list for `faculty`-origin writes.** From Addendum C FP-02, FP-03, FP-06: bio (English and Urdu), research interests (controlled keywords and free tags), office hours, office location, ORCID iD, Google Scholar and other links, photo with its consent flag, and the per-field `visibility` settings. **Not** on the list (Verifier only, normal CMS workflow): designation, department, headship, and qualifications used for promotion. Open point I cannot settle from the spec: FP-02 lists "education" and "positions" as profile fields, while FP-03 makes "qualifications used for promotion" high-impact. Until Q3 and Q4 are answered, education and positions are treated as Verifier-only too (stricter; can be loosened later without a migration).
2. **`claimedBy` as an opaque text id.** Acceptable, and preferred: no foreign key into the `identity` schema, so the library choice in S-2 cannot force a People migration. Constraint on my side: the id I store is stable and never an email address.
3. **Getters or own service?** Both, split by what is read. The public `/people/{slug}/` page (published, verified profiles only) goes through a `src/site/lib/content.ts` getter, so it needs a new getter from the main agent, with its type, in a PR comment first. The portal's own screens (a person's draft, their review status, their delegations) read through a portal service that calls the Local API as the system and is scoped to the signed-in account's own record. Drafts never go through the public getters.
Also agreed in principle with the P3 proposal: one content-service write function with `origin = 'faculty'` (rule 1), the double allow-list (rule 2), and `context.onBehalfOf` stored in the audit entry (rule 3), shipped with the People migration. I have not seen these merged and have not run anything against them.

## Identity schema application (proposal; the main agent must agree before any migration is written)
- **Where:** a PostgreSQL schema named `identity`, separate from `public`. The `identity.*` and `portal.*` tables in Addendum C section 7 live there. Payload and the P3 migrations never reference them.
- **How applied:** one reviewed SQL migration file with an `up` and a `down`, run by its own script (for example `pnpm identity:migrate` and `pnpm identity:rollback`), recorded in its own table `identity.migrations`. It is NOT a Payload migration and Payload's `migrate` does not run it. If S-2 picks Better Auth, its table definitions are reviewed and committed as that SQL file; the library never creates tables at runtime (`push` style behaviour is off).
- **Where it runs:** locally and in CI against a throwaway PostgreSQL. On Neon only from the portal deployment's own build step or by the owner, never from this sandbox (which cannot reach Neon, see P1-d) and never from the existing project's build, which would run the CMS migration step (ADR-0005).
- **Rollback:** the `down` drops the `identity` schema objects it created and nothing else; proven up, down, up on a fresh database with an identical schema dump, as for P3a. One migration per PR holds.
- **Database role:** the portal gets its own connection string and role with rights on `identity` and `portal` only, plus access to CMS content through the content service, not through table grants.
- **Tested (prediction FP0-d, 2026-11-10):** Payload's `migrate:create`, `migrate`, `migrate:down` and `migrate:fresh` ignore a second schema in the same database and leave it intact. Caveat: they never recreate it, so a dev reset and CI must also run the identity SQL (`docs/evidence/FP0/identity-up.sql`). Evidence: `docs/evidence/FP0/spike-report.md`.

## Questions that remain for the owner
Only inputs only the owner has: written DCST approval for the portal and for consenting faculty in the demo (Q5), and whether either tenant enforces MFA. Q2 answered 2026-11-11 by the owner: the university uses both Microsoft 365 and Google Workspace (statement, no document seen).
