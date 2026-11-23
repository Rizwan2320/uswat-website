# Brief P3am: each role gets its own dashboard

**Objective.** The owner asked that every role should not see the same dashboard. Each kind of person now lands on a screen laid out for their job.

**Paths touched (apps/web).** `src/governance/roleBoards.ts` (new), `src/admin/EditorDashboard/{RoleViews.tsx (new), DashboardView.tsx, index.tsx, index.scss}`, `src/governance/adminMenu.ts`, `src/payload.config.ts`, tests `tests/unit/roleDashboards.unit.spec.ts`, `tests/int/roleBoards.int.spec.ts`, `tests/unit/dashboard.unit.spec.ts`.

**What each role sees.**
- Platform admin and site manager, "control room": decisions table, upkeep lists folded away, counts rail.
- Auditor: the same layout, read-only, titled "Everything in progress".
- Head of department: "Your tray" (sent to you, approved) beside a department board listing the department page and each programme with its coordinator and a status chip.
- Programme coordinator: one card per programme with a four-step rail (Draft, With your head, Approved, Live), a plain sentence on where it is, the head's sent-back reason if any, and one big button. The side menu shows only Programmes and Media.
- Editor and contributor: a writing desk (Sent back, My drafts, I sent for review; contributors have no review column).

**Risks.** Published rows are public, so any "live" list must filter by scope itself (found and fixed, with a leak test). The menu change only hides entries; access rules are unchanged.

**Schema.** No change (drift check: "No schema changes detected").

**Gate.** Typecheck, lint, unit and integration tests, production build, browser look at every role.
