# P3 slice 3ah: who may write and publish academic pages, and the main pages

**Branch:** `p3/academic-scope-3ah`, from `main` (slice 3ag, #131, is separate). **Lane:** `src/governance` (policy, access, roles), `src/collections` (Users, Programmes, Pages, `governedCollection`), `src/admin/workflow/rules.ts` (screen rules mirror the policy), one generated migration, tests, docs.

## Owner request (2026-11-22)
- A department (for example DCST) has one head (HOD). Each programme (Software Engineering, Computer Science, AI...) has its own coordinator.
- A coordinator writes drafts for **their own programme page only**, and sends them to the HOD. The HOD verifies and publishes; for the department's pages and all its programmes.
- The landing page and the other main pages belong to the platform admin: draft and publish alone (3ag).
- Login must not be confusing (slice 3ai: role banner, role dashboards).

## Decisions
1. **HOD = an Approver whose Offices are the department's office** (already how `3hod` works). No change. They see and review everything owned by that office, including the programme drafts.
2. **A programme takes its department's owner office automatically.** A `beforeValidate` hook on Programmes copies the department's `governance.ownerOffice`; nobody types it. A programme without a department keeps what it has.
3. **Coordinator = an Editor with "Programmes" filled in** (new field `users.programmes`, many programmes, set by a platform admin). For the `programmes` collection that Editor may edit only those programmes, by id. For the `departments` collection they have no edit rights at all (the DCST page is the HOD's). For every other collection nothing changes (office scope). An Editor with no programmes behaves exactly as today.
4. **Their drafts and versions are visible by id**, not by office, so a coordinator sees their own programme's drafts and no one else's.
5. **Main pages (`pages`) are for the platform admin and the site manager.** Approvers and editors lose Pages write access (they may still read published ones). Creating a page is admin only (the same rule as departments).
6. **Owner office for an admin**: a platform admin with no office now gets "IT Directorate" as the default owner office, so publishing a main page no longer stops at an empty "Owner office" box (seen on the preview).
7. Programmes are assigned by a platform admin only. A HOD assigning their coordinators is a follow-up (3hod's rule would need a limit to the HOD's own department).

## Questions left to the owner (a default is used)
- Should a coordinator also draft the department's own page? Default: no.
- Should a programme coordinator be allowed to create news or notices for their office? Default: unchanged from today (an Editor with an office can).

## Not doing
No change to sign-in, to the faculty portal, to the public site. No dashboard or banner work (3ai). No one-click "approve and publish".

## Risks
1. Security-critical: a wrong scope rule lets an editor change another programme's page. Mitigation: pure policy tests with a case table, integration tests through the real Local API as each role, one test per "never".
2. Access filters by id must not leak across collections (an id of 5 means different things). Mitigation: the filter is built per collection (`governedReadFor(slug)`).
3. One schema change (a relationship field on users: one new table `users_rels`, one index). Predicted below; drilled up, down, up.

## Gate
Typecheck, lint, unit and integration (new matrix), the existing access matrix updated, Urdu coverage, build, migration drilled on a populated copy and on an empty database, no drift.
