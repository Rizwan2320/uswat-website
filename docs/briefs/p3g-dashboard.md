# P3 slice 3g: editor dashboard and editor guide

**Branch:** `p3/dashboard-3g`, stacked on `p3/media-a11y-3f`. **Plan refs:** CMS-09, feature 22, P3 deliverable "editor guide draft".

## Objective
When a person signs in, the first page shows what needs them: my drafts, waiting for review, expiring soon, needs a fresh check, images without alt text.

## Paths touched
New `src/admin/EditorDashboard/` (admin component), `src/governance/{dashboard,dashboardData}.ts`, `src/payload.config.ts` (one line: `beforeDashboard`), the generated `importMap.js`, tests, `docs/editor-guide.md`. **Removed:** the template's `src/components/BeforeDashboard` (a welcome message and a Seed button; the seed route is already platform-admin only and refused by the workflow), the "two out" for this addition. Not touched: `(site)`, `src/site`, `src/design`, tokens, the portal paths. `src/admin/` is a new folder in the P3 lane rather than `src/components`, so it cannot collide with the main agent's components.

## How it works
- Queue definitions are plain data (`dashboard.ts`): title, one plain sentence, roles that see it, and a `where` built from the user and the clock. They reuse `reviewQueueWhere()` from 3c.
- `loadDashboard` runs each queue across every collection that has the governance group (found from the config, so a new governed collection appears with no edit), **with the signed-in user's own access**, so a person only counts what they may read. One query per queue and collection, in parallel; a failing collection marks the queue "may be too low" instead of hiding the failure.
- Contributors and editors see My drafts and Expiring soon; approvers, site managers and platform admins see all five; the auditor sees none.
- Titles come from the CMS and are rendered as text (tested with a script tag title).

## Decisions for the owner
1. "Expiring soon" = 14 days (PROPOSED, one constant `EXPIRING_SOON_DAYS`).
2. "Needs a fresh check" lists live items whose review date has passed or that the sweep marked Stale.
3. The generated import map was already out of date from earlier slices; regenerating it adds the rich-text feature clients. It is part of this diff.

## Tests
Unit 7 (role-to-queue map, filters, escaping, empty states). Integration 8 on real Postgres (own vs other drafts, contributor scope, review queue incl. importer drafts, expiring window, stale by clock, needs-alt by role, auditor none). Whole suite 307 passed on an empty database; typecheck, lint (0 errors), `next build` pass. Also run once in a real browser: production build, Playwright login as an approver, dashboard rendered with data (screenshot kept locally, not committed).
**Not run:** Neon wake-up timing, mobile layout, usability test with real staff (CMS-15), Urdu admin, the "stale pages" report beyond this list (CMS-14 is tier P).

## Gate
CI green; main agent review; user approves before merge.
