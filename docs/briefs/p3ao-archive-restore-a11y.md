# P3 slice 3ao: Archive and Restore buttons, and an accessibility pass on the new screens

**Branch:** `p3/archive-restore-a11y-3ao`, from `main` (e9b65b8). **Lane:** `src/admin/workflow` (rules, bar, styles), `src/admin/EditorDashboard` (only if the accessibility pass finds a fault), tests, docs. No schema change, no migration, no dependency.

## Objective
1. A reviewer can **Archive** a live page (off the website, kept on record) and a head or platform admin can **Restore** an archived one, from the status box, with an "are you sure" step. Until now the server allowed both but no screen had a button (STATUS, "Archive and Restore buttons").
2. Run axe and a keyboard-only pass on the screens added in slices 3ai to 3am (role dashboards, status box, Stage box) and fix what is ours. Payload's own widgets are recorded, not fixed.

## Rules (no new rule; the screen follows the server)
- **Archive:** `published > archived` is checked by `mayTakeOffline` in `policy.ts`. The screen offers it to a reviewer who may take the page offline (platform admin; site manager except High impact; head on a page that is not a programme). A coordinator may take their programme offline but is not offered Archive: archiving is a reviewer step and only a head or admin can undo it. This is listed as "hidden on purpose" in the matrix test.
- **Restore:** `archived > published` is checked by `canRestore` (platform admin; head of the owning office). Restoring is a publishing save, so the publish checks still run (verified, owner, source, review date for High impact); if one fails the server says which.
- Both are a **publishing save** with the Stage set to Archived or Published (`NEEDS_PUBLISH_ACTION` explains why a plain draft save is refused). Archive is offered only when the Stage is Published, so a live page with a pending draft is never archived with unreviewed edits.

## Paths touched
`src/admin/workflow/rules.ts`, `WorkflowBar.tsx`, `tests/unit/uiServerMatrix.unit.spec.ts`, `tests/unit/workflowRules.unit.spec.ts`, a browser spec for the two buttons, `docs/STATUS.md`, `docs/predictions.md`, `docs/evidence/`.

## Risks
- Payload may hand the form an old copy after a publishing save (the reason for `recentlyAccepted` in the bar). The new buttons reuse that guard.
- The archived row keeps Payload's `_status: published`; the public site must keep hiding it by the governance status. Checked, not assumed (see predictions).
- Accessibility: axe finds many faults inside Payload's own components. Only our markup is changed.

## Tests
Unit: rules for each role at Published and Archived; the screen/server matrix (2,400 cases plus the new buttons). Integration: archive and restore by role through the real config (existing `governance.workflow` walk). Browser: head archives and restores a department page; coordinator does not see Archive. axe per role; keyboard-only pass of the status box.

## Gate
Typecheck, lint (0 errors), unit and integration suites, the matrix test green, browser check of the buttons, axe results recorded in `docs/evidence/p3ao-a11y.md`. Draft PR. Not merged by me.
