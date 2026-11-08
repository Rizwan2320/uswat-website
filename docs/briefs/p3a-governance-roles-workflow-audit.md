# Brief P3 slice 3a: governance fields, roles, workflow, audit log

Branch `p3/cms-core` (cut from `main` at d9c190b). Date 2026-11-09. Plan: v2 sections 3, 7.2, 7.3, 11 (P3); Addendum sections 7 and 17 (the Addendum wins).

## Objective
Make the CMS refuse to publish things it should not publish, and remember who did what.

1. One shared governance field group on every governed record (plan 7.2 plus Addendum 7).
2. Six roles with scoped access (plan 7.3).
3. Editorial workflow Draft > In review > Approved > Published > Archived with role-gated transitions, and the VER-01 gate (an unverified record cannot be published).
4. An append-only audit log written from collection hooks.

Requirements covered: CMS-02 (role matrix), CMS-03 (states and transitions), CMS-05 (audit), VER-01.
Not in this slice: new collections (AffiliatedColleges, MeritLists, ContactDirectory, ArticleTags), scheduled publish and expiry (LIF-01 to LIF-04), media rules, accessibility guard, editor dashboard, editor guide, notification adapter (LIF-03).

## Paths touched
New: `apps/web/src/governance/*` (roles, policy, hash, fields, access, hooks, audit, plugin), `apps/web/src/collections/AuditLogs.ts`, tests under `apps/web/tests/{unit,int}`, one generated migration, `docs/adr/0010-*.md`, this brief.
Changed: `src/collections/Users/index.ts` (role, offices), `src/collections/Pages/index.ts` and `src/collections/Posts/index.ts` (governance group, access, hooks), `src/payload.config.ts` (register collection and plugin), `src/app/(frontend)/next/seed/route.ts` (platform admin only), `src/payload-types.ts` (regenerated), `docs/predictions.md`, `docs/STATUS.md`.
Not touched: `src/app/(site)`, `src/site`, `src/design`, tokens, branch `p2/landing`.

## Design in one page
- **Two status fields, kept consistent.** Payload's `_status` (draft or published) controls what the public can read and drives versions and scheduled publish. `governance.status` holds the five workflow states. Invariant: `_status = published` only with `governance.status` published or archived. An archived record stays readable (the archive listing needs it) but is excluded from current lists.
- **Why a group.** A top-level field named `status` would collide with the enum Payload already creates for `_status`. Inside a group the enum is `enum_pages_governance_status`.
- **One pure policy module.** `policy.ts` takes the actor, the previous state and the requested state and returns either an error or the corrected values. No Payload imports, so it is unit-tested without a database. The `beforeChange` hook is a thin adapter.
- **Transitions (strict, no skipping, except reviewers may go draft to approved).**

| Move | Who |
| --- | --- |
| create as draft | anyone with create access (never as published) |
| draft to in review (submit) | editor (in scope), approver (in scope), site manager, platform admin. Not contributor |
| in review or approved back to draft | reviewer |
| draft or in review to approved | reviewer |
| approved to published | reviewer, or the system job at the scheduled time |
| published to archived | reviewer |
| archived to published (restore) | approver (in scope) or platform admin |
| published to a new draft revision | implicit, any role with update access |

  A **reviewer for a record** is: platform admin; approver whose `offices` include the record's `ownerOffice`; site manager if the record is not high-impact. High-impact records therefore always need an approver (Addendum 7, VER-rule).
- **VER-01.** Publishing (including restore) needs `verificationStatus = verified`. Only a reviewer for the record can set verified, which stamps `verifiedAt`. The system (importer, jobs) can never set verified. High-impact records also need `reviewDueAt` to publish (Addendum 16).
- **Edits invalidate approval.** If a non-reviewer changes content of a record that is in review or approved, it drops back to draft, and a verified record becomes unverified. This stops an approved draft being swapped before a scheduled publish.
- **Scope.** `ownerOffice` on the record is matched against `offices` on the user. Editor and approver act only inside scope. Site manager and platform admin are global. Contributor touches only own drafts. Auditor reads everything and edits nothing.
- **Audit.** One `audit-logs` collection, no create, update or delete through any API. Entries are written in the same transaction as the change, so a failed audit write rolls the change back. Covers create, update, delete, status transitions and logins on every collection except form submissions (personal data) and the search index (derived). Autosaves from the admin are skipped. Large values are stored as hashes, and password and token fields are redacted.

## Assumptions to confirm (the plan is silent or ambiguous)
1. Contributor cannot submit for review ("draft only"); an editor in the record's office submits it.
2. Site manager cannot approve or publish high-impact records at all (stricter reading of "cannot approve own high-impact change", following the Addendum VER-rule).
3. Delete: platform admin everywhere; site manager only non-high-impact; nobody else.
4. `ownerOffice` is free text for now (no Offices collection yet). It becomes a relationship when Offices exist (P4), as a later migration.
5. Extra fields beyond the plan list: `governance.createdBy` (contributor rule). Nothing else.
6. Approver can approve a record they created. Two-person approval is CMS-10, tier P.
7. `contentHash` is computed per save from the content fields in the language being saved. It is used to detect "content changed in this save", not as a cross-language fingerprint (limitation until Urdu content depth).
8. ADR number 0010, not 0007: v2 reserves 0007 (search), 0008 (localization) and 0009 (import).

## Risks
- Payload semantics around drafts and versions (which document is `originalDoc`, partial group updates, restore) are assumed from source reading and tested on a real database, not assumed.
- The migration adds NOT NULL columns with defaults to `pages` and `posts`. Existing rows in the live Neon database (if any) get `governance.status = draft` even if published; public reads use `_status`, so nothing disappears, but republishing them needs the workflow.
- The template seed publishes content directly. It will now be refused, which is intended: it is invented demo content. Removing it is a later slice.
- p2/landing may change the schema too. Two generated migrations on the same base will conflict; whoever merges second regenerates theirs.
- Preview (`/next/preview`) lets any signed-in user with the preview secret read drafts through the frontend with access bypassed. Known gap, belongs to the preview slice (CMS-11).
- The audit table is append-only through the application only. A database trigger would make it append-only for the DB role too; not done (no hand-written SQL in migrations).

## Tests
- Unit (no database): policy (every transition x role, VER-01, invalidation, scope), audit diff (truncation, redaction), content hash stability.
- Integration (real PostgreSQL): role x collection x action matrix (CMS-02), workflow journeys (CMS-03), VER-01 attempt, audit entry for every write kind with user, time and diff (CMS-05), first user becomes platform admin, restore-version cannot bypass the gate.
- Not run in this slice: Playwright admin flows (no browser run), Docker path, scheduled publish through the jobs queue.

## Gate (slice)
CMS-02, CMS-03, CMS-05 and VER-01 tests green locally and in CI on the draft PR; migration has a working down step, proven on a fresh local database (up, down, up; schema dump identical after down); typecheck, lint and build pass. Anything else is reported as "not run".
