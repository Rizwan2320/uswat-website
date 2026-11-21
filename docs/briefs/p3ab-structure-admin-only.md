# P3 slice 3ab: only a platform admin creates departments and programmes

**Branch:** `p3/academics-create-admin-only`, from `main`. **Lane:** `src/collections` (Departments, Programmes, the shared factory), `src/governance/access.ts`, tests, docs. **Schema change: none. No migration. No new dependency.**

## Why
Owner instruction (chat, 2026-11-21, while the academics brief `p3-academics-full-cms.md` was being read): creating an academic department and its programmes must be for the platform admin only. Today `governedCreate` lets every signed-in role except auditor create one.

## Decision
1. New access function `governedCreateAdminOnly` (platform admin only). `governedCollection` takes `createAdminOnly: true`; Departments and Programmes set it. Nothing else changes: editors, approvers and site managers still edit and publish the content of existing records under the same workflow, and delete stays as slice 3q decided.
2. The importer and the seeds use the system actor (Local API, no user), which does not go through this rule; the sample pack keeps loading. A test shows it.
3. The Create button disappears for other roles because Payload hides it when `create` access is false.
4. The access matrix gains `structure` (create: platform admin; update and delete as other governed types).
5. Site manager is deliberately NOT allowed to create: the instruction said platform admin only.

## Not doing
- Faculty groups, offices, campuses and People keep the old rule; the owner named academics (departments and their programmes) only. Ask if faculty groups should follow.
- No change to the academics build itself (`p3-academics-full-cms.md`): when it is built, new fields sit on these same collections and this rule already holds.

## Risks
1. Existing tests created departments and programmes as an editor (3 files). Mitigation: they now create as admin; the editing roles are unchanged.
2. A script or seed that creates as a non-admin user would now fail. Mitigation: grep for user-authenticated creates (done: none outside tests); the system actor is allowed.

## Gate
Typecheck, lint, unit and integration suite, build. Not a migration slice, so no migration drill.
