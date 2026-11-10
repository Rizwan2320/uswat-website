# Brief: third agent, the faculty portal (FP lane)

Date: 2026-11-10. Written by the main agent (P2 owner and PR reviewer). Applies to the agent who builds the faculty portal. Read with `docs/briefs/P3-coordination.md` (lanes, PR checklist, hand-offs), which still applies in full.

## Source of truth
**Addendum C, "University of Swat Faculty Portal: Specification v1", 9 Nov 2026**, in the Claude Project "swat university website" as `addendum 3.txt`. On anything about the faculty portal it wins over plan v2 and the 6 Nov addendum (its section 14 lists the edits). First PR from this agent: copy it verbatim into `docs/plan/` (name: `Swat_Plan_v2_Addendum_C_Faculty_Portal.md`) so the repo is self-contained, per the "everything needed to resume lives in this repo" rule.

## The boundary (owner's decision, 2026-11-10)
- **We build the faculty portal.** It is ours, in this repo, not an Odoo feature: faculty identity and sign-in, public academic profile, research and publications, CV and reports, delegation, security centre (Addendum C sections 1 to 5).
- **Odoo handles everything else**: grades, attendance, enrolment, fees, salary and HR, admissions processing, the student portal, teaching administration. Addendum C section 0.2 and its ADR-0012 say the same: the portal is not a second ERP and never calls Odoo while rendering a page. Any Odoo link is a plain outbound link or, only after written approval, a read-only adapter (ADR-0006). Odoo is never touched from here (CLAUDE.md rule 5).
- Open question Q1 (what the Odoo Faculty module does) is still unanswered. No Production-tier teaching feature (FP-30 and up, FP-42) is built before it is.

## Honest status of gate G-FP0 (Thu 12 Nov evening)
The gate needs the Addendum's Must items for importer, templates and redirects green, the auth spike S-2 passing, and the owner's approval of the extra scope. Today: templates are in progress (kit and shell on `p2/templates`, unmerged); the importer and redirect map (P4) are not started; no spike has run. So the realistic path is the fallback in Addendum C section 0.4: **specification plus spike S-2 evidence**, with the C-tier slice only if the owner approves and the gate is met. The spike is isolated and safe to start now.

## Lane
| Area | Owner | Notes |
| --- | --- | --- |
| `src/modules/identity/**`, `src/modules/portal/**`, `src/app/(portal)/**` (own root layout, separate origin: Addendum C 4.1) | FP agent | New, nothing else edits them. |
| Identity tables | FP agent, with the migration rules below | Separate realm from Payload `users`. Library chosen by spike S-2 (Better Auth or Payload custom strategy), no hand-rolled crypto. |
| `src/collections/**`, `payload.config.ts`, `src/migrations/**`, governance | P3 agent | The FP agent does not edit these. Addendum C needs People fields (`claimedBy`, per-field `visibility`, `facultyStatus`) and an `origin` value `faculty`: open a PR comment on the P3 lane and the P3 agent adds them. |
| `src/design/**`, `src/site/components/**` (including `kit/`), `(site)` | Main agent | Portal screens import the kit components and tokens; they do not edit them. Missing component: ask. |
| `docs/STATUS.md`, `docs/predictions.md` | Everyone, append-only, own section | |

Migrations: Payload's migration folder is the P3 agent's. If the identity schema needs tables outside Payload (Better Auth does), the FP agent's first brief states how they are applied and rolled back on Neon, and the main agent agrees it before any migration is written. One migration per PR still holds.

## ADR numbers (clash to fix)
Addendum C names its ADRs 0010 to 0014, but the repo already has 0010 (governance policy in hooks) and 0011 (CMS routes on the site shell). The portal ADRs use **0020 to 0024** in this order: 0020 monolith on a separate origin with its own identity realm; 0021 mandatory MFA, passkey first; 0022 Odoo and HR stay systems of record; 0023 library chosen by spike S-2; 0024 passkey RP ID `portal.uswat.edu.pk`. Say "Addendum C ADR-0010" in prose when you mean the spec's number.

## Rules that matter most here
1. CLAUDE.md applies: brief first, prediction before every drill, "not run" instead of an unrun claim, no secrets, Conventional Commits.
2. **No real faculty data and no student data.** The demo uses fictional records labelled Sample; real faculty appear only with written consent (Addendum C section 10). Nothing from the crawl or staff contact lists goes into the repo.
3. Authentication is never cut: passkey with user verification required, TOTP fallback, recovery codes, server-side sessions, no SMS and no email factor (AUTH-01 to AUTH-10, SES, ABU).
4. Passkey tests use Playwright's virtual authenticator; each endpoint gets an authorisation test and an IDOR test (FPR-01 to FPR-10, FF-15 to FF-17).
5. The portal never publishes to the public site directly: edits go through the content service and Payload hooks, so tag invalidation and the audit log keep working, and VER-01 applies.
6. Only the main agent merges. The PR checklist in `P3-coordination.md` plus the FPR items relevant to the PR apply.
7. A separate demo origin is needed (a second Vercel project or alias). Creating it, setting env vars and touching DNS are decisions for the owner; propose, do not do.

## Hand-offs from the main agent
Inner-page kit (`src/site/components/kit/`: breadcrumbs, page header, pagination, accordion, tabs, prose) and `docs/design-notes.md` (visual rules, RTL, content rules); the kit is on `p2/templates` until the owner approves the merge. Until then build against the branch or against plain tokens.

## Decisions waiting on the owner
Approval of the C-tier scope after G-FP0; whether a separate demo origin is acceptable; Q1 to Q5 (Odoo Faculty module, identity provider, who is authoritative for designation, promotion criteria, written approval for the portal and consenting faculty).
