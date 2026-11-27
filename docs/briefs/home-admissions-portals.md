# Brief: admissions bar and portal cards from the CMS (landing page, step 2)

**Branch:** `feat/home-admissions-portals`. **Owner request 2026-11-27:** the other parts of the landing page must be controlled from the admin, not the code.

## Objective
Two more parts of Admin, Globals, Home page content: **Admissions banner** (intake, last day to apply, Apply link, link while closed, message while closed, middle heading) and **Portal cards** (3 to 8 cards: title, one line, link, icon). Empty keeps the standard (sourced) values, as for the slides and statistics.

## Paths
- CMS lane (one migration, `20261127_065030_home_admissions_portals`, additive and reversible: 6 tables, 8 columns, 2 enums): `globals/HomeContent/index.ts`, `governance/homeContent.ts`, `i18n/urWords.ts`.
- Main lane: `site/home/homeMap.ts` (`toAdmissions`, `toPortals`), `site/lib/content.ts`, `site/lib/admissions.ts`, `components/AdmissionsBanner.tsx`.

## Rules
- Last day is a calendar date; the bar is Open to the end of that day in Pakistan time, then Closed. A filled group with an empty date means Closed (stated in the admin). A group that was never touched keeps the file's values.
- Links: a page on this site or `https://`; portal cards also accept `http://` because the university's examination system is served on `http://exam.uswat.edu.pk/` (crawled 2026-11-06). Never `javascript:` or other schemes.
- Portal cards: fewer than 3 usable rows keeps the standard cards. The admin refuses 1, 2 or more than 8 at publish.
- Only the published version reaches visitors; drafts never do (same read as the rest of the global).

## Not in this step
Leadership message, hero text, footer and top bar, navigation (next steps). Urdu text for the CMS-entered fields is stored per language but the home page reads the default language only (as the statistics do); a later step.

## Tests and gate
Unit (`homeMap`): fallbacks, mapping, empty date means closed. Integration: publish rules (counts, bad links, http allowed, empty allowed), the site getters return published and never draft. Urdu coverage for the new labels. Typecheck, lint, 1948 integration tests, build, 12 visual checks (default look unchanged).
