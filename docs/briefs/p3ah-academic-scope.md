# P3 slice 3ah: who may write and publish academic pages, and the main pages

**Branch:** `p3/academic-scope-3ah`, stacked on `p3/admin-publishes-own-3ag` (#131), because the head-of-department rule below extends the admin one. **Lane:** `src/governance` (policy, access, roles), `src/collections` (Users, Programmes, Pages, `governedCollection`), `src/admin/workflow/rules.ts` (screen rules mirror the policy), one generated migration, tests, docs.

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
5. **Main pages stay with the platform admin by ownership, not by a lock.** The admin creates them with no office typed, and the default owner office for an admin is now "IT Directorate" (an empty owner office blocked publishing on the preview). No head, coordinator or editor of another office is in scope for an IT Directorate record. Locking the whole `pages` collection to admins was tried and backed out: the other offices (Registrar and the like) own pages of their own, and about 46 existing tests use pages as the generic test record. If the owner wants a hard lock, it is a one-line set in `policy.ts` plus moving those tests to another record type.
6. **A head of department publishes their department's pages themselves** (owner, 2026-11-22: "he should not send his draft for review, it is the only page he can change"). On `departments` and `programmes` an Approver may approve and publish what they edited or created, whoever started the draft; the screen offers Approve at once. Heads of other offices and site managers keep four-eyes on everything else.
7. **Who makes the accounts (answer to the owner, 2026-11-22).** The platform admin creates the head of department: role Approver, Offices = the department's office (the name shown on the department record). The head then creates their own coordinators (3hod already allows a head to add Editors and Contributors for their offices): role Editor, the department's office, and now **Programmes**, limited to programmes of their own department (a new check, `TEAM_PROGRAMME_FORBIDDEN`). The admin may assign any programme. A coordinator cannot widen their own list. No one self-registers; the first password is set by whoever creates the account (no mail is sent yet).

## Questions left to the owner (a default is used)
- Should a coordinator also draft the department's own page? Default: no (the head's).
- Should a programme coordinator be allowed to create news or notices for their office? Default: unchanged from today (an Editor with an office can).

## Not doing
No change to sign-in, to the faculty portal, to the public site. No dashboard or banner work (3ai). No one-click "approve and publish".

## Risks
1. Security-critical: a wrong scope rule lets an editor change another programme's page. Mitigation: pure policy tests with a case table, integration tests through the real Local API as each role, one test per "never".
2. Access filters by id must not leak across collections (an id of 5 means different things). Mitigation: the filter is built per collection (`governedReadFor(slug)`).
3. One schema change (a relationship field on users: one new table `users_rels`, one index). Predicted below; drilled up, down, up.

## Gate
Typecheck, lint, unit and integration (new matrix), the existing access matrix updated, Urdu coverage, build, migration drilled on a populated copy and on an empty database, no drift.
