# Brief: Research and Administration pages, agent 4 (P4 content, P5 templates), 2026-11-22

Owner request (2026-11-22): "go for these two main gaps and build it like you build the dcst pages". Read first: `CLAUDE.md`, `docs/STATUS.md`, `docs/briefs/p5-department-template.md` if present.

## Objective
Two section landings (`/research`, `/administration`) and nine office pages (`/administration/{slug}`) in the same look as the DCST pages: banner band, hero card, stats, section chips, content bands, news feed, call to action.

## Paths touched
- NEW `apps/web/src/site/offices/` (types, art, nine profiles, two landings, blocks, three page templates, css)
- `apps/web/src/site/organisation/routes.tsx` (office route uses a profile when one matches; new research and administration routes)
- NEW routes `apps/web/src/app/(site)/(cms)/research/page.tsx` and `.../administration/page.tsx`; `site/sitemap/entries.ts`
- `scripts/import/seeds/{data,apply}.ts` (nine real office records so the route has a CMS record), `scripts/import/data/route_map.csv` plus the generated JSON (one row: old `/administration/` now served by the new page), tests
- NEW banner and chip art in `apps/web/public/images/offices/` and the script `apps/web/scripts/make-office-banners.mjs`

## Facts rule
Every name, title, phone, email, hours line and date comes from the university register and carries a source URL and `verifiedAt` (2026-11-05) in the profile. Where sources disagree (ORIC director) the page shows "Still to be confirmed" and no name. Nothing is invented. Seeds keep `sample.invalid` as source and carry no contacts (the seed policy test forbids real addresses); contacts live in the profile code.

## Risks
- Static `/research` and `/administration` shadow any Pages record with those slugs. Old `/administration/` was mapped to itself in the route map; changed in one row.
- The Research and Administration menus (shared chrome) still point to the old university site; not changed here (needs owner go-ahead).
- Preview seeding must be on for one build so the nine office records exist.

## Tests and gate
tsc, eslint, all unit tests, 66 local page loads (11 pages, 1440/1024/390 and RTL 390: overflow 0, axe, broken images). Not run: production build, e2e, pack integrity (#94). Gate: lead review of PR #116.
