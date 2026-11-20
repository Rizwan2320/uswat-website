# P3 slice 3hod: a Head of Department manages their own team (D1)

**Branch:** `p3/hod-team`, from `main`. **Lane:** `src/collections/Users`, `src/governance` (new `teamAccess.ts`, `adminMenu.ts`), tests, docs. **Schema change: none** (access rules and hooks only). **No new dependency.** Source: `docs/briefs/FP-department-portal-gap.md` D1 and `docs/STATUS.md` ("D1: recommended yes, P3 lane, with the stated limits"). The owner said "implement them" on 2026-11-20.

## Problem
Only the platform admin can create an account or change a role or office, so every change to a department's IT team goes through the IT Directorate. The department's head (HOD, an Approver whose offices are the department) cannot add or remove their own editors.

## The rule (the limits are the ones already stated in D1)
An **Approver** may, for the offices **they themselves hold** (their "team"):
1. **Create** an account whose role is Editor or Contributor and whose offices are a non-empty subset of the approver's own offices.
2. **See** the accounts of their team: Editors and Contributors who share at least one of the approver's offices. Everyone else stays invisible to them, as today.
3. **Change** a team member's **role** (Editor or Contributor only) and **offices**, but only the approver's own offices: they can add one of their offices, or take one of their offices away; any office of theirs is the only thing they can touch. A person's other offices are left exactly as they were.
4. **Delete** an account only when the person works for none but the approver's offices. Otherwise the answer is "take your office off instead".

They can **never**: grant Approver, Site Manager, Platform Admin or Auditor; touch an account that has any of those roles; give or take an office that is not theirs; change a team member's name, email or password; change their own role or offices (unchanged rule). Every create, change and delete is written to the audit log by the existing hooks, with the approver as the actor.

Platform admin keeps everything it has. Site manager, editor, contributor and auditor are unchanged.

## Why the rule lives in code, not in the admin screen
Field access alone cannot express "only your offices", so the real gate is the collection's `beforeChange` and `beforeDelete` hooks (pure checks in `src/governance/teamAccess.ts`, unit tested without a database). Field access and the `where` filters only decide what is visible and which requests reach the hooks. A hidden menu is tidiness, not security (adminMenu.ts says so).

## Decisions I made, open to change
1. **New accounts get a password set by the head.** There is no mailer, so the invitation the plan calls for ("strong passwords and invitations now") cannot be sent. The head types an initial password and tells the person; the person can change it from their own account. This means the head knows the first password. I judged that acceptable for a demo and listed it for the owner; the proper fix is an emailed invitation, which needs the mail service and is not built. No authentication code is added or changed.
2. **Name, email and password of a team member are not editable by the head.** Changing an email is the first step of taking over an account, so it stays with the IT Directorate. Re-creating a mistyped account is: delete and create again.
3. **"Remove" means take the office off** (and delete only when nothing else is left), because a person may serve two offices.
4. A head with **no offices** cannot manage anyone.
5. Whether an email is already registered elsewhere leaks through the duplicate-email error on create. Accepted: it needs a signed-in head, and the alternative (a central directory search) is worse.

## Not doing
No emailed invitations, no password reset, no change to how anyone signs in. No change to the faculty portal or its accounts. No new menu or page: the existing Users screen opens for approvers, scoped.

## Risks
1. A rule that is too loose is a privilege escalation (a head making themselves or someone else an admin). Mitigation: pure checks with a case table, plus integration tests through the real Local API as each role, and one test per "never" above.
2. Payload's admin sends the whole document on save; the hook must not refuse a save that changed nothing but role and offices. Mitigation: a test that sends name and email unchanged alongside the change.
3. A `where` filter on a many-valued text field might not behave as I expect. Mitigation: tests against the real database, predicted first.

## Gate
Typecheck, lint, unit and integration (including the access matrix and the menu test, updated), build, no drift (`migrate:create` finds nothing), and one browser check that a head signs in, sees the Users screen scoped to their team and can create an editor.
