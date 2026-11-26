# P3 slice 3ap: Back and Sign out at the top of every admin screen; a head of department creates programmes

**Branch:** `p3/admin-nav-and-programme-create-3ap`, from `main` (4ed3d83). **Lane:** `src/admin` (new top bar), `src/governance/access.ts`, `src/collections/Programmes.ts`, `src/collections/governedCollection.ts`, tests, docs. `payload.config.ts` gets one entry in `admin.components.header` and the import map is regenerated (lead: this file is shared). No schema change, no migration, no dependency.

## What the owner asked (2026-11-24, with a screenshot of Forms > Create New)
1. There is no Back button.
2. The admin should create heads of department and departments; a head should create programmes and the coordinator accounts (Editor role).
3. There is no Sign out button.

## What I found before changing anything
- **Sign out exists** but only inside Payload's left menu (bottom) and on the account page. At the width in the screenshot the menu is behind the hamburger, so nobody sees it. Fix: a visible Sign out at the top, always.
- **Back does not exist.** Payload shows a breadcrumb only. Fix: a Back button under the role banner on every screen except the dashboard and the sign-in pages. It goes back one step, or to the list above if there is no history.
- **Admin creating departments and heads: already allowed** (`createAdminOnly` on departments; the admin may set role Approver and offices on a user). Nothing to build; I will check it in a browser and say so.
- **Head creating coordinators: already allowed** (slice 3hod and 3ah: Editor or Contributor of the head's own offices, programmes only of the head's own department).
- **Head creating programmes: NOT allowed.** Owner decision of 2026-11-21 (slice 3ab) made departments and programmes admin-only. The owner now asks for the reverse for programmes. Departments stay admin-only (the owner asked only that the admin creates departments).

## Rule change (owner decision, 2026-11-24; reverses part of 2026-11-21)
A **head of department** (Approver holding at least one office) may **create a programme** in a department of their own office. Everything else is unchanged:
- The new programme starts as a draft owned by the department's office (already inherited from the department; nobody types it).
- A head may not put a programme under another office's department: the programme takes its department's office, and the existing scope rule refuses it (`OWNER_OUT_OF_SCOPE`). No new hook is needed (see predictions P3ap-a: a first draft of this brief had one; it was dead code and a blank-screen bug, and was removed).
- A new programme with no department yet is a draft in the head's own office (the Create screen saves an empty draft first, so this must be allowed). It is not shown on the public site until it is published under a department.
- A head can already approve and publish their own programme page (slice 3ah, `mayApproveOwn`), so no new approval rule.
- Editors, contributors, site managers and auditors still cannot create programmes or departments. Only a platform admin creates departments.

## Paths touched
`src/admin/TopBar/` (new: `index.tsx`, `TopBar.client.tsx`, `index.scss`), `src/payload.config.ts` (one line), `src/app/(payload)/admin/importMap.js` (generated), `src/governance/access.ts` (new `governedCreateAdminOrHead`), `src/collections/governedCollection.ts` (option `createRoles`), `src/collections/Programmes.ts`, `src/governance/whoAmI.ts` (text for admin and head), `tests/int/governance.structure.int.spec.ts`, other tests that pin "approver cannot create a programme", `docs/editor-guide.md`, `docs/STATUS.md`, `docs/predictions.md`.

## Risks
- A head could create a programme under someone else's department (closed by the scope rule; tested).
- The top bar sits in the `header` slot above Payload's own header; at phone width it must not push the page sideways or hide the hamburger. Checked at 390 and 1280 px.
- Sign out is a link to Payload's own logout route, so the session cookie is cleared by Payload, not by my code.
- Urdu labels are drafts for a native reader.

## Tests
Unit: label and visibility rule for the bar (no Back on the dashboard or sign-in). Integration: who may create a programme per role (8 roles), a head creating under their own and under another department, the system actor still creating, the head approving and publishing their own new programme. Browser: the bar on a form, Back returns, Sign out ends the session and the next admin address asks for sign-in; axe on the bar.

## Gate
Typecheck, lint (0 errors), unit and affected integration tests, browser check at 390 and 1280 px, draft PR. Not merged by me.
