# Brief FP-13: courses taught, entered by hand (FP-30, competition tier)

Branch `fp/courses-sample`, stacked on `fp/publications-sample` (PR #79) which is stacked on `fp/profile-sample` (PR #76). Neither is merged yet; merge #76, then #79, then this. Date 2026-11-18.

## Objective
A signed-in faculty member can list the courses they teach: course code, title, semester, programme. Add and remove. Spec FP-30 (tier C): entered by hand in the competition build; read from Odoo in production only after approval (ADR-0006). Nothing is public (publishing outlines is FP-31, production).

## Design
- Seam `CourseStore` (list, add, remove). Today: PostgreSQL in the portal's own schema (migration 0009, `identity.course_taught`). Later: a read-only adapter over Odoo after approval; screens do not change. Each record carries `source` ('manual' now) so a later Odoo record is told apart and cannot be removed by hand.
- Strict rules in one place: code 2 to 20 characters of letters, digits, space, hyphen; title 1 to 200; semester = one of Spring, Summer, Fall, Winter plus a year (2000 to this year + 2); programme 0 to 120; at most 60 courses per account; the same code in the same semester cannot be added twice (database unique, not only code).
- Account from the session only; every query carries it; removal is by id and account in one statement (FPR-03).
- Not invented: no list of real course codes or programmes is shipped; the person types them. The semester names are generic seasons, not a claim about the university's calendar.

## Tests before code
Unit: code, title, semester, programme validation; limits; text cleaning; service (no session, invalid input never reaches the store, limit, duplicate answer). Integration: add and list round trip with Urdu title; ordering (newest semester first, then code); same code and semester refused, same code in another semester allowed; limit enforced inside one transaction; cross-account list and remove; cascade; migration up/down. Browser: add, duplicate refused with message, invalid refused with linked message, remove, keyboard only, 390 px, second account empty, crafted remove of another account's id refused.

## Not in this slice
Odoo read, course outline publishing, editing a course in place (remove and add again), student-facing display, per-course visibility.
