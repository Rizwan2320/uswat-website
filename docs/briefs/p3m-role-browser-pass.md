# P3 slice 3m: the admin in a browser as every role

**Branch:** `p3/role-browser-3m`, stacked on `p3/preview-3l`. **Plan refs:** CMS-02 (roles), CMS-09, CMS-15. **No migration** (checked: `migrate:create` reports no schema changes).

## Why
Slice 3j found a blank create page because I had only ever opened the admin as a platform admin. I signed in as all seven roles (contributor, editor, approver, auditor, site manager, platform admin, and an editor of a second office) and checked the menu, the notice list, the create page, someone else's draft, and the dashboard. Predictions P3m-a to f were written first.

## Findings and fixes
| Finding | Fix |
|---|---|
| Contributors, editors and approvers saw Users, Redirects, Forms, Search Results, Header and Footer in the menu and on the dashboard (none usable). | `governance/adminMenu.ts` hides them unless the role is platform admin, site manager or auditor. Tidiness only: access was already locked by the access matrix test (my prediction that it was open was wrong). |
| Opening any create form saves an empty draft immediately, and "My drafts" listed it as a bare `#43`. | Shown as "Untitled (started 2026-11-12, #43)". The empty draft itself still exists (Payload autosave). |
| An auditor opening a create address saw "Unauthorized, you must be logged in" although signed in. | Replaced with "Not allowed. You are signed out, or your role does not let you do this. Sign in again, or ask the site manager if you think it should." |
| All roles: dashboards load, no page errors, no failed requests. A Finance editor and a contributor cannot open another person's draft and get a clear message. | Nothing to fix; now covered by tests. |

## Tests
- `tests/e2e/role-views.e2e.spec.ts`: 10 browser tests (menu by role, auditor has no Create button and sees the plain message, other office and other contributor blocked, untitled draft label).
- `tests/int/adminMenu.int.spec.ts`: 9 tests (menu hiding per role and slug, daily areas stay visible, hiding is not the security).
- Typecheck, lint (0 errors), 388 tests on a freshly migrated empty database, `next build`, and 14 browser tests (these 10 plus the 4 flows) pass.

## Not fixed or not run
- Empty drafts from opening a create form still pile up in lists. A cleanup would delete records, so I did not add one. Option: a scheduled report for the site manager.
- The auditor still sees a "+" on Form Submissions (the plugin lets the public create submissions; the API is correct).
- Site manager's real workflow (inviting users, changing roles) is not browser-tested.
- Urdu admin, mobile layout and CMS-15 with real staff: not run.
