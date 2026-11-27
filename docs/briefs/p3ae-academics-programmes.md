# P3 slice 3ae: a programme can carry its whole public page in the CMS

**Branch:** `p3/academics-programmes-3ae`, stacked on `p3/academics-departments-3ad` (PR #124), which is stacked on `p3/academics-create-admin-only` (PR #120). **Lane:** `src/collections` (Programmes, `academics/pageFields.ts`), `src/migrations`, Urdu lines, tests, docs. Request: `docs/briefs/p3-academics-full-cms.md` (agent 4, PR #116). Owner rule: only a platform admin creates programmes (slice 3ab, already in force).

## Decisions
1. **Same pattern as 3ad:** one group `pageContent` ("Page content") on the existing `programmes` collection, so governance, drafts, versions, audit and the delete guard apply unchanged. Top-level `order` (number, sorts the disciplines on the department page).
2. **Fields:** `shortName`, `tagline`, `summary` (card text); `heroImage`, `tileImage`, `figureImage` (Media uploads, alt and rights checked at publish by the existing guard); `about` (paragraphs, up to 4); `outcomes` (up to 8 short lines); `whyStudy` (6), `tracks` (6), `careers` (8) as icon, title, text rows; `skills` (up to 6 groups of a name and up to 8 short items); `curriculum`; `faq` (12).
3. **Curriculum is a flat list of semesters**, each `{year 1 to 6, term 1 or 2, courses up to 8}`, not a list of years holding a list of semesters. A flat list avoids an array inside an array (the table-name length trap from 3ad), still allows MS and PhD programmes (1 to 6 years, so up to 12 rows), and the site groups rows by year. A validator refuses two rows for the same year and term. Course names are not translated (they are course titles, usually English); items are plain text, up to 80 characters.
4. **Skills:** the brief gave no maximums for skills; I chose 6 groups of 8 items. Say if the layout needs other numbers.
5. **Plain text only, no minimums, no `pageStatus`, icons from the 20 names:** all as in 3ad (same helpers).
6. **Programme text already in the record is untouched** (name, level, duration, eligibility, links). A programme with none of the new fields renders as before.

## Not doing
- No change to `src/site`, templates or seeds (agent 4). No link from programme to a "track" collection; tracks are rows here.
- No migration of the code profiles into data (agent 4's seed once names are final).

## Risks
1. Wider migration: arrays with localized text create per-locale tables, again in `_programmes_v`. Mitigation: predicted first, read not trusted, drilled up, down, up on a populated copy and an empty database.
2. 63-character names (`_programmes_v_version_page_content_curriculum_courses_...`). Mitigation: `dbName` on curriculum, skills and the lists; read the generator warnings.
3. A hasMany text field inside an array (courses, items) adds one table each; accepted.

## Gate
Predictions first. Typecheck, lint, unit, integration, Urdu coverage, build, no drift, migration drilled. One test creates a programme from only the new fields and reads it back; picture rights; list limits; duplicate semester refused; plain programme still publishes.
