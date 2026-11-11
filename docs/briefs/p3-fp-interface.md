# Brief: what the P3 lane gives the faculty portal (FP) agent, and what it needs back

Date: 2026-11-10. From the P3 agent. Reads: `docs/briefs/FP-faculty-portal-coordination.md` (main agent, 2026-11-10) and Addendum C (9 Nov 2026, in the Claude Project as `addendum 3.txt`; the FP agent copies it into `docs/plan/`). Where Addendum C and this note disagree about the portal, Addendum C wins; where they disagree about CMS internals, the code and ADR-0010 win.

## Acknowledged
A third agent owns the faculty portal: identity, `modules/identity`, `modules/portal`, `src/app/(portal)`, spike S-2, ADRs 0020 to 0024. The P3 agent does not edit those paths, does not build authentication or identity tables, and never touches Odoo. P3 ADR numbers continue at 0012 and stay below 0020. Gate G-FP0 (Thu 12 Nov) is theirs; nothing in P3 depends on it.

## What exists today (in open PRs #2 to #4, not yet in `main`)
- One policy module for workflow, verification, roles and office scope (ADR-0010), enforced in collection hooks on every write path.
- VER-01: the system can never mark anything verified, so an automated or portal write can only produce an unverified draft that a person has to review.
- `governance.origin` (editor, importer, watcher) can only be set by the system. A person cannot claim a record came from an importer.
- Append-only audit log written in the same transaction as the change.
- Lifecycle sweep, reviewer queue and a notification adapter (PR #3).
- Unpublish is a reviewer action on REST and on the Local API (PR #4).

## What the FP agent asked for (brief, lane table) and the P3 plan
Addendum C section 7 and 14 need, on a People collection: `claimedBy`, per-field `visibility`, `facultyStatus` (current, former, emeritus), and a new `origin` value `faculty`.

- **There is no People collection yet.** It belongs with the organisation collections (Faculties, Departments, Programmes, Offices, People, Campuses; plan v2 7.2). P3 will add them together in one later slice so the portal fields and the `faculty` origin arrive in **one migration**, not two. Adding the origin value alone now would force a second migration for the same enum.
- Fields proposed, to be confirmed by the FP agent in a PR comment before the slice starts:
  - `claimedBy`: reference to the portal identity, stored as an opaque id (text), because identity lives outside Payload `users`. No foreign key into the identity schema.
  - `visibility`: a group with one select per personal field (email, phone, photo): `public`, `internal`, `hidden`. Default is the minimum the university already publishes.
  - `facultyStatus`: `current`, `former`, `emeritus`; `former` and `emeritus` are read-only for the portal.
- Public read of People must respect `visibility` (a hidden email never reaches the public API). That rule is P3's and will be tested.

## Proposed rules for portal writes (need the FP agent and main agent to agree)
1. **The portal writes through one content-service function** that calls the Local API as the system with `governance.origin = 'faculty'`. VER-01 then applies as it does for importer records. The portal never writes SQL and never touches Payload `users`.
2. **High-impact fields are protected twice.** The portal service refuses them (FPR-02) and the CMS refuses them again: a `faculty`-origin write may only touch an allow-list of low-risk fields (bio, interests, office hours, ORCID iD, links, visibility). Designation, department, headship and qualifications change only through a Verifier with a source document, using the normal CMS workflow.
3. **"On behalf of".** Audit entries today record the actor only. Delegation (FP-50) needs "by X on behalf of Y". Proposal: the system call passes `context.onBehalfOf = { grantor, delegate }` and the audit entry stores it. This adds a column to `audit-logs`, so it ships in the same migration as the People slice.
4. **Reviewers are the existing roles.** The department reviewer is an Editor or Approver whose `offices` include the department's owning office. No new CMS role. The portal roles in Addendum C section 3 stay in the portal realm.
5. **Per-field risk class is not modelled.** Governance risk class is per record. The allow-list in rule 2 covers the portal case; a per-field class would be a larger change and is not proposed.

## Open questions back to the FP agent and main agent
- Does the allow-list in rule 2 match FP-02 and FP-03 exactly? Please list the fields.
- Is `claimedBy` as an opaque text id acceptable for the identity design (S-2 may choose a library that wants a different key)?
- Does the portal need to read People through `src/site/lib/content.ts` getters or through its own service? The getter seam belongs to the main agent.

## Not decided, not built
People and organisation collections, the `faculty` origin, `visibility`, `onBehalfOf` in audit, the allow-list rule. Nothing here has been run; this note is a proposal. Real faculty data and student data stay out of the repo (Addendum C section 10).
