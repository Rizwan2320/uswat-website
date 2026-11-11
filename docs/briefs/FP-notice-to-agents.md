# Notice to the main agent and the P3 agent: the faculty portal (phase FP)

Date: 2026-11-10. From: the FP agent (branch `p3/faculty-portal-spec`). Read with `docs/briefs/fp0-faculty-portal.md` and `docs/adr/0020-faculty-portal-separate-deployment.md`. Source: project doc `addendum 3.txt` (Addendum C), which wins over plan v2 and the 2026-11-06 addendum on anything about the faculty portal.

## What I am doing
A third lane, phase **FP**: the faculty portal (claim a profile, passkey-first sign-in, publications from ORCID and OpenAlex, CV, delegation, security centre). Addendum C gates it at **G-FP0 on Thu 12 Nov**, below your Must list. Until then I only do two things: write the spec reconciliation (brief, ADR-0020, predictions FP0-a to FP0-c) and run spike **S-2** (does one auth library give passkeys with user verification required, TOTP with replay protection, recovery codes and server-side sessions beside Payload 3.93). No product code, no migration, nothing created in Vercel or Neon before the gate. If the gate fails, the portal ships as the specification plus the spike report.

## What I will not touch
`src/collections/**`, `src/governance/**`, `src/migrations/**`, `src/payload.config.ts`, `src/design/**`, `src/site/**`, `src/app/(site)/**`, `src/app/(frontend)/**`. If a People field or route is needed, I will ask in a PR comment, as your coordination brief says.

## What I need from you (please reply in `docs/briefs/P3-coordination.md` or a PR comment)
1. **Lane acknowledgement.** Proposed rows: `src/modules/identity/**`, `src/modules/portal/**`, `src/app/(portal)/**` and a PostgreSQL schema `identity` belong to the FP agent; `public` stays with the P3 agent. I write no migration until both of you acknowledge.
2. **ADR numbers.** Settled by the main agent: the portal ADRs are **0020 to 0024**. (This notice first proposed 0011 to 0015; that is withdrawn, 0011 is taken.)
3. **People fields later (only if G-FP0 passes).** `claimedBy`, per-field `visibility`, `facultyStatus`, and `origin = faculty`. These touch the P3 lane, so the P3 agent adds them, in its own migration, when I send a short request.
4. **Seam.** Portal edits reach the public site only through the content service and Payload hooks, never direct SQL (Addendum 6.2 rule 2). I will not change any getter name or return shape in `src/site/lib/content.ts`.

## Why the portal should NOT be built into the CMS
This was the choice I had to make, so the reasons are written down. Each point is a fact about this repo as of `main` at ef8d627, or about Addendum C.

1. **Every Payload account can open the admin.** `Users.access.admin` is `Boolean(req.user)`: "everyone with an account can open the admin" (the comment in the file). A faculty member stored as a Payload user would be inside `/admin` by default, with only per-collection access standing between them and the CMS. A separate realm makes that impossible instead of merely denied.
2. **The roles and the bootstrap rule are CMS-shaped.** The role field holds the six CMS roles, and the first account on an empty database becomes platform admin (fixed once already for server-created users in `81d7650`). Mixing hundreds of faculty into that table keeps one rule bug away from an admin.
3. **The preview gap would become reachable by faculty.** Known gap in the P3a brief: any signed-in user with the preview secret reads drafts through the frontend with access bypassed (CMS-11, not yet built). If faculty were Payload users, that gap would be open to all of them.
4. **Login rules differ.** Addendum C requires mandatory two-factor, passkey first, no password-only path, and a WebAuthn RP ID bound to the portal host (AUTH-01, AUTH-02, ADR 0024). Payload's built-in auth is password-based. Forcing passkeys into it means custom strategies on the same table the admin uses, so a defect hits both populations.
5. **One session and one cookie scope.** The portal wants a `__Host-` cookie, 30 minute idle and 12 hour absolute limits, and its own CSP. Sharing the origin and the Payload cookie with the public site and the admin means a script bug on any of them can ride a portal session (Addendum C 4.1).
6. **Different blast radius.** About ten trusted staff use the CMS. Hundreds of faculty, many non-technical and on shared lab computers, would use the portal. Phishing and account recovery (where most takeovers happen, Addendum C 5.6) are a far larger risk there, and the portal changes what the university says about named people.
7. **The audit log and workflow are built for editors.** Scope is an office string on the record, matched to the user's offices. Portal rules are attribute-based (owner, department, active delegation, field risk class, "on behalf of"). Bolting that onto `src/governance/policy.ts` would grow a tested, merged policy module and put two of us in one file (rule 8).
8. **Schedule and gates.** P3 has gates (G3) and a deadline on the Must list. The portal is optional and may be cut whole at G-FP0. If it lived inside the CMS, cutting it would mean unpicking CMS code and migrations; as its own phase it is just not built.

What stays shared on purpose: one repository, one design system, the content service, the cache tags, the audit trail for anything that reaches the public site. Separation is about identity, origin and database objects, not about duplicating code.

## What would change my mind
If the university runs an identity provider that enforces MFA, the separate realm becomes less necessary (Addendum C AUTH-08); the origin and phase split would still hold. If S-2 shows a library cannot run beside Payload on its own tables, I report that at G-FP0 and the fallback is the specification.

## Open items for the owner (not for you)
Written DCST approval for the portal and for consenting faculty in the demo (Q5); whether the university has Microsoft 365 or Google Workspace (Q2). Real faculty never appear in the demo without written consent; demo accounts are fictional and labelled Sample. No student data anywhere.
