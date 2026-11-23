# Brief: Faculty of Allied Health Sciences and its programmes, agent 4 (P4 content, P5 templates), 2026-11-22

Owner request (2026-11-22): "go for Faculty Allied Health Sciences and their programmes, but can this department and programmes not be created in CMS by admin?" Read first: `CLAUDE.md`, `docs/STATUS.md`, `docs/briefs/p5-about.md`, `docs/briefs/p3-academics-full-cms.md`.

## Objective
A faculty landing page and four programme pages in the DCST style, from the register copy of the old site's `/faculty/` page (Drive folder `faculty`, crawled 2026-11-06 from https://uswat.edu.pk/faculty/) and the QEC list of programmes (https://uswat.edu.pk/ , PDF `List-of-FacultiesPrograms`, QEC letter UoS/QEC/2025/X-8, dated 26 Aug 2025). Answer the owner's question: can an admin create such departments and programmes in the CMS?

## Facts rule
Only what the two sources say, with source URL and `verifiedAt` 2026-11-06. Not in any source, so shown as "Still to be confirmed" and never filled in: curriculum, semester courses, duration, eligibility, fee, seats, intake dates, which centre runs Radiography & Imaging Technology, what Nursing and Food & Nutrition offer. Known conflict: the faculty page lists four centres and four programmes; the QEC letter (Aug 2025) lists two centres and three programmes and says the faculty "launched admission w.e.f. Fall 2025". Both are shown with their sources. Staff e-mails stay out of the page (names, titles and the office telephone only).

## Paths touched
NEW `apps/web/src/site/faculties/` (types, profile, two templates), NEW route `(cms)/faculties/allied-health-sciences/page.tsx`, `site/organisation/routes.tsx` (programme route reads the faculty profile), `site/content/nav.ts`, seeds (1 faculty group, 2 centres as departments, 4 programmes; head optional), route map row for old `/faculty/`, banners and hero chips in `public/images/offices/` via the existing generators.

## Risks
Seed counts in three tests move (faculties 4, departments 10, programmes 20, organisation 64, published 109). The seed policy forbids real e-mails and phones in seeds, so the contact lives in the profile. Programme pages need a published CMS record; the preview needs `SEED_SAMPLE_ON_PREVIEW` true for one build. The two plain centre pages use the existing generic department template (no rich profile).

## CMS answer (to be given to the owner)
Admins can create Department and Programme records today. The rich page layout for a new department still comes from a code profile until the P3 page-content fields and the profile-reads-CMS step land (brief p3-academics-full-cms.md); Programmes have no page-content fields yet.

## Tests and gate
tsc, eslint, all unit tests, page loads at 1440/1024/390 and RTL 390 (overflow, axe, broken images). Not run: production build, e2e, pack integrity (#94). Gate: lead review of PR #116.
