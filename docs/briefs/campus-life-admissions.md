# Brief: Campus Life and Admissions pages (agent 4, P4 content and P5 templates), 2026-11-26

Owner request (2026-11-25): "now move campus life page and admission pages". Read first: `CLAUDE.md`, `docs/STATUS.md`, `docs/briefs/research-administration-round-2.md`.

## Objective
Move the old Campus Life and Admissions pages that have real text into the office-style template already used for Research and Administration, with no new CSS and no invented facts.

## Source
The saved copies of the old pages on the owner's Drive (folder `1auDaqiaKicI9JVziLYnsvC9lBse2WnGA`, `page.txt` per page, copies made 2026-11-06). Each page cites its old address from the route map.

## Pages (static addresses, `PAGE_PROFILES`)
- Campus Life: Main Campus `/campuses/main`, Women Campus `/campuses/women`, Sangota Campus `/campuses/sangota`, Red Crescent building `/red-crescent-building`, Convocation 2022 `/convocation-2022`, Open Day `/open-day`.
- Admissions: hub `/admissions`, Merit lists `/admissions/merit-lists`, Downloads (rules, policies, forms, manuals) `/downloads`.
- Static routes win over the CMS `[slug]` route, so the three campus addresses now render the profile whether or not the CMS has a campus record.

## Blank old pages (4 to 17 words): not built, left to the route map
admission-rules, online-admissions, fee-structure, societies, activities, facilities, gallery and online-psychology-clinic are empty. The proxy already sends them to `/` (route map: "redirect to nearest parent"), before any route file runs, so no route files are added. A nearer target (`/admissions` for the first three, `/campuses/main` for the rest) would need the route map rows changed: left to the lead, noted in the go-live checklist.

## Not built
Upcoming Events (a list of 40 event titles, already covered by `/events`), Affiliation Rules (not read).

## Paths touched
- NEW `apps/web/src/site/offices/profiles/{main-campus,women-campus,sangota-campus,red-crescent,convocation,open-day,admissions-hub,merit-lists,downloads}.ts`, registered in `profiles/index.ts`
- NEW route files for the nine pages; `src/site/content/nav.ts` (Admissions Overview, Merit Lists, internal Downloads, Sangota Campus, Open Day); `src/site/sitemap/entries.ts`
- `src/site/offices/RichOfficePage.tsx`: renders `profile.links` (a field two existing profiles, DIT and Alumni, already fill but the page never showed)
- `apps/web/scripts/make-office-banners.mjs`, `make-academic-art.mjs` (nine banners and chips); tests

## Facts rule
Names, lists and dates only as the old page states them, each with source and `verifiedAt`. Personal mailboxes are not shown (role mailbox `womencampus@` only). The Open Day text is an Urdu newspaper report; it is summarised in English and marked as such. Gaps go to "open points".

## Risks
Nine new banners must fit the 21.7vw band. The reserved-path list in the route-map test may need the new roots. PAGE_PROFILES count test and email-regex test change. Not run: production build, e2e, pack integrity (#94).

## Gate
tsc, eslint, all unit tests, page loads at 1440, 1024 and 390 (overflow, axe, broken images). Lead merges PR #116.
