# Brief FP-13: courses taught, entered by hand (FP-30, competition tier)

Branch `fp/courses-sample`, stacked on `fp/publications-sample` (PR #79) which is stacked on `fp/profile-sample` (PR #76). Neither is merged yet; merge #76, then #79, then this. Date 2026-11-18.

## Objective
A signed-in faculty member can list the courses they teach: course code, title, semester, programme. Add and remove. Spec FP-30 (tier C): entered by hand in the competition build. Owner decision 2026-11-19: the portal is an independent system with its own design and database; real data will be migrated or uploaded from a file, never read live from Odoo. Nothing is public (publishing outlines is FP-31, production).

## Design
- Seam `CourseStore` (list, add, remove). Today: PostgreSQL in the portal's own schema (migration 0009, `identity.course_taught`). Each record carries `source`: 'manual' (typed) or 'import' (loaded from a file by `pnpm identity:courses-import`); imported records cannot be removed by hand. Real data later = a real file through the same import, same rules.
- Strict rules in one place: code 2 to 20 characters of letters, digits, space, hyphen; title 1 to 200; semester = one of Spring, Summer, Fall, Winter plus a year (2000 to this year + 2); programme 0 to 120; at most 60 courses per account; the same code in the same semester cannot be added twice (database unique, not only code).
- Account from the session only; every query carries it; removal is by id and account in one statement (FPR-03).
- Not invented: no list of real course codes or programmes is shipped; the person types them. The semester names are generic seasons, not a claim about the university's calendar.

## Tests before code
Unit: code, title, semester, programme validation; limits; text cleaning; service (no session, invalid input never reaches the store, limit, duplicate answer). Integration: add and list round trip with Urdu title; ordering (newest semester first, then code); same code and semester refused, same code in another semester allowed; limit enforced inside one transaction; cross-account list and remove; cascade; migration up/down. Browser: add, duplicate refused with message, invalid refused with linked message, remove, keyboard only, 390 px, second account empty, crafted remove of another account's id refused.

## Import step (added 2026-11-19)
JSON rows `{email, code, title, season, year, programme}` matched to existing accounts by email (case and spaces ignored), each row checked by the same rules as a typed course, written in one transaction, `--dry-run` rolls back, at most 5000 rows, same 60-course limit. Bad rows are reported (row number and reason), never loaded. A dummy dataset (`scripts/sample-data/courses.sample.json`, 7 rows, three sample faculty on `example.invalid`) is the demo data. Not built: CSV, holding rows for faculty who have not signed up yet (needs People and `claimedBy`).

## Not in this slice
A live connection to Odoo (not planned: data is migrated in), course outline publishing, editing a course in place (remove and add again), student-facing display, per-course visibility.
