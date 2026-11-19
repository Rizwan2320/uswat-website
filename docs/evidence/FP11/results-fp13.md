# FP-13 results: courses taught on sample data (FP-30)

Date 2026-11-19. Branch `fp/courses-sample`. Predictions FP13-a, FP13-b.

## What was run
- Unit: `tests/unit/portal/courseRules.unit.spec.ts` (12 tests): code, title (characters not bytes, Urdu kept), semester and year range, extra keys refused, control characters stripped, id shape, and the service (no session reaches nothing, invalid input never reaches the store, duplicate and limit answers).
- Integration (real PostgreSQL 16, local): 7 new tests in `tests/int/identity/identity.int.spec.ts`: round trip with Urdu, ordering, duplicate rule, limit with three simultaneous adds at 59, cross-account list and remove, a feed course cannot be removed by hand, cascade and table checks. 76 of 76 in the file.
- Mutation checks: 10 logic mutations (remove the advisory lock, off-by-one limit, drop the account or source condition on remove, season order reversed, no conflict clause, shorter code check, wider year range, allow other keys, skip the id check): all 10 caught at once.
- Browser (`scripts/courses-run.mjs`, Chromium with a virtual authenticator, production build): 14 of 14 (`results/courses-run.json`): redirect when signed out; Sample badge; add; duplicate refused; bad code and bad year refused with linked messages; newest-first list with an Urdu title; second account sees its own list; remove by labelled button; crafted add with another account's id refused; crafted remove of another account's course refused and the row unchanged; malformed id refused; add by keyboard alone; 60 courses without horizontal scroll at 390 px; the 61st refused. The profile run was re-run after the CSS change: 22 of 22. The publications run was not re-run after the field-grid CSS change (that page has no `.portal-field`), so that is not run.

## Import step (added the same day, owner decision 2026-11-19)
- `pnpm identity:courses-import <file.json> [--dry-run]` and `src/modules/portal/courses/importer.ts`; dummy dataset `scripts/sample-data/courses.sample.json`. Source value renamed from `odoo` to `import` in migration 0009 (not yet merged).
- Integration (9 new tests, real PostgreSQL): mixed fixture (4 expected loads, 1 repeat, bad code, unknown account, extra key, non-object row reported with row numbers); same file twice adds nothing; dry run leaves nothing and holds no lock; email matched ignoring case and spaces; imports count toward the 60 limit; imported courses cannot be removed by hand; non-array and over-5000-row files refused; a database failure part-way rolls the whole file back; the shipped sample file passes every rule. 85 of 85 in the file; 405 identity and portal tests in all.
- Mutations: 10 run; 9 caught at once; 1 equivalent (committing instead of rolling back when the outcome is `limit` changes nothing, since nothing was written).
- Browser (R14, R15): the real command run three times against the running app's database: dry run counted 7 and stored nothing (the real run then also added 7), second real run added 0 and found 7 repeats; the signed-in sample faculty sees 2 imported courses, each with an Imported tag and no Remove button. 16 of 16 in the courses run.
- Not built: CSV input, holding rows for people who have not signed up yet (needs People and `claimedBy`).

## Defects found by running it
- The Year input overflowed 21 px at 390 px width (grid cell sized to the input's intrinsic width). Fixed for every form field with `grid-template-columns: minmax(0, 1fr)` on `.portal-field`.
- Semester select and year input had different heights; aligned.

## Not run, and why
- A live connection to Odoo: not planned. By the owner's decision the portal is independent and real data will be uploaded from a file through the import step below. Getting the real export from the university is a separate step (their data, their agreement) and was not attempted.
- Course outline publishing (FP-31, production tier), editing in place, real devices, https, screen reader, Urdu for the interface words, a populated-database migration.
- `tests/unit/env.unit.spec.ts` fails here without CMS secrets, the same on main.

## Not invented
No course codes, programmes or semester calendar of the university are shipped. The four season names are generic and the person types everything else.
