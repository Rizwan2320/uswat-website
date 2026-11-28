# Slice 3as: one page per person (2026-11-28, P3 lane)

**Objective.** A head of department works on one page, the department page; a coordinator works on one programme page. Each gets one entry in the left menu for "the whole page", as the admin has "Home page content" for the home page. Home page content belongs to the web team.

**Paths touched.** `governance/roleBoards.ts` (scope, `loadPageLinks`), `admin/EditorDashboard/RoleViews.tsx` and `index.scss` (head desk), `admin/PageNav/` (new menu link), `governance/adminMenu.ts`, `globals/HomeContent/index.ts`, `governance/whoAmI.ts` (banner text), `payload.config.ts`, the admin import map, tests, `docs/editor-guide.md`.

**What changed.**
- Head desk: tray plus the department page only. Programme pages are not listed; they arrive in the tray when a coordinator sends them for review.
- Left menu: "Your department page" / "Your programme page" at the top, one link to the edit form of that page.
- Departments and Programmes list entries are hidden from heads and coordinators with a style rule. They are not hidden in config: Payload does not route a hidden area, so the link would answer "Nothing found".
- Home page content: hidden from everyone except platform admin, site manager, auditor.

**Not changed.** Access rules. A head can still open and edit programmes of their office by address; this slice changes what is shown, not what is allowed.

**Risks.** The CSS rule uses `:has()` (supported by current Chrome, Edge, Safari and Firefox). If it were not supported the list entries would simply show again, which is harmless.

**Tests.** Unit: head desk, page link. Integration: board scope, page links, menu rules (including "a head is never given a hidden Departments area"). Browser: three desks, axe, link opens the edit form.

**Gate.** Lead merges PR #171 after CI. Owner checks the preview signed in as the test head and test coordinator.

**Open.** Should the head's menu drop Pages, Posts, Notices, Events and the other areas too? Approver is also the role of heads of non-department offices, so this needs a decision.
