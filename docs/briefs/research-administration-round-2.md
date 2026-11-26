# Brief: Research and Administration pages, round 2 (agent 4, P4 content and P5 templates), 2026-11-25

Owner request (2026-11-25): "move to research pages and then administration". Read first: `CLAUDE.md`, `docs/STATUS.md`, `docs/briefs/p5-research-administration.md` (round 1).

## Objective
Build every Research and Administration page whose old page has real text, in the same office template as round 1 (ORIC, DASR, DIT and the others). Pages whose old page is an empty stub are not invented; they are listed for the owner.

## Source
The saved copies of the old pages on the owner's Drive (folder `1auDaqiaKicI9JVziLYnsvC9lBse2WnGA`, `page.txt` per page, copies made 2026-11-06). Each page cites the old address from the route map.

## Pages
- Research: the Ecological Risk Assessment and Environmental Management Group (`/research-group`, a static page like the Quality Enhancement Cell) and the Directorate of Research and Technological Development (`/administration/directorate-of-research-and-technological-development`, one function and a name are all the old page holds).
- Administration, with real text: Admissions, Administration, Planning and Development, Registrar, Treasurer, Provost, Vice Chancellor's Office, Pro Vice Chancellor's Office, University Advancement and Financial Aid, E-Office, Dean's Office (Faculty of Chemical Sciences), and, once their saved copies were read, Election (administrative officers and faculty members), Press Releases (headlines) and Developmental Projects (three captions).
- Not built (old page is empty or a name only; nothing to show): Dean Office (1, 2, 4), Office of the Deans, Digital Library, Directorate of Sports, Office 365, Directorate of Advance Studies and Research (duplicate of DASR), QEC (duplicate of the Quality Enhancement Cell).

## Paths touched
- NEW `apps/web/src/site/offices/profiles/*.ts` (twelve profiles and the research group), registered in `profiles/index.ts`
- `apps/web/src/site/organisation/routes.tsx` (an office with a profile still renders when its CMS record is missing), `src/site/offices/RichResearchPage.tsx` (research group card), `landings.ts`
- NEW route `apps/web/src/app/(site)/(cms)/research-group/page.tsx`; `src/site/sitemap/entries.ts`
- `scripts/import/seeds/data.ts` (eleven office records), `apps/web/scripts/make-office-banners.mjs` and `make-academic-art.mjs` (banners and chips), tests

## Facts rule
Names, titles, phones, hours and role mailboxes only as the page states them, each with the source and `verifiedAt`. Personal mailboxes are not shown. Conflicts and gaps go to "open points" on the page. The Vice Chancellor's message page (already built under About) is signed by a former Vice Chancellor; the old office pages name the current one. Not repeated here.

## Risks
- Sixteen new banners and chips must fit the 21.7vw band.
- Seed counts (offices 13 to 28) and the research list test change.
- Not run: production build, e2e, pack integrity (#94).

## Gate
tsc, eslint, all unit tests, page loads at 1440, 1024 and 390 (overflow, axe, broken images). Lead merges PR #116.
