# FP-13 results: courses taught on sample data (FP-30)

Date 2026-11-19. Branch `fp/courses-sample`. Predictions FP13-a, FP13-b.

## What was run
- Unit: `tests/unit/portal/courseRules.unit.spec.ts` (12 tests): code, title (characters not bytes, Urdu kept), semester and year range, extra keys refused, control characters stripped, id shape, and the service (no session reaches nothing, invalid input never reaches the store, duplicate and limit answers).
- Integration (real PostgreSQL 16, local): 7 new tests in `tests/int/identity/identity.int.spec.ts`: round trip with Urdu, ordering, duplicate rule, limit with three simultaneous adds at 59, cross-account list and remove, a feed course cannot be removed by hand, cascade and table checks. 76 of 76 in the file.
- Mutation checks: 10 logic mutations (remove the advisory lock, off-by-one limit, drop the account or source condition on remove, season order reversed, no conflict clause, shorter code check, wider year range, allow other keys, skip the id check): all 10 caught at once.
- Browser (`scripts/courses-run.mjs`, Chromium with a virtual authenticator, production build): 14 of 14 (`results/courses-run.json`): redirect when signed out; Sample badge; add; duplicate refused; bad code and bad year refused with linked messages; newest-first list with an Urdu title; second account sees its own list; remove by labelled button; crafted add with another account's id refused; crafted remove of another account's course refused and the row unchanged; malformed id refused; add by keyboard alone; 60 courses without horizontal scroll at 390 px; the 61st refused. The profile run was re-run after the CSS change: 22 of 22. The publications run was not re-run after the field-grid CSS change (that page has no `.portal-field`), so that is not run.

## Defects found by running it
- The Year input overflowed 21 px at 390 px width (grid cell sized to the input's intrinsic width). Fixed for every form field with `grid-template-columns: minmax(0, 1fr)` on `.portal-field`.
- Semester select and year input had different heights; aligned.

## Not run, and why
- Odoo read of real timetables: needs written approval (ADR-0006); `source = 'odoo'` is reserved so such records are told apart and cannot be removed by hand.
- Course outline publishing (FP-31, production tier), editing in place, real devices, https, screen reader, Urdu for the interface words, a populated-database migration.
- `tests/unit/env.unit.spec.ts` fails here without CMS secrets, the same on main.

## Not invented
No course codes, programmes or semester calendar of the university are shipped. The four season names are generic and the person types everything else.
