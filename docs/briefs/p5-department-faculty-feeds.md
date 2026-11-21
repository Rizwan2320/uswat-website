# Brief: DCST pages, round two (hero size, department feeds, faculty)

Date: 2026-11-21. Agent 4 (P4/P5), branch `p4/real-departments`, after the owner's review of PR #116 and its preview.

## Objective
1. The hero card on the department page and the five programme pages is 30% smaller in width and height (wide screens; on phones it keeps the full width and loses 30% of its height).
2. The Contact block goes. The department page and each programme page show the department's **news, events and notices**. Programme pages no longer list the other programmes of the department.
3. The Faculty section is redesigned with real names (owner-supplied 2026-11-21): the Head of Department, and one coordinator each for Software Engineering, Computer Science, Information Technology, and both Artificial Intelligence and Data Science. Each person has an empty photo slot that shows initials until the owner sends a picture. Each programme page shows its coordinator.

## Design decisions
- Department feeds need no schema change: an article tag whose slug equals the department's slug (`dcst`) selects what the department shows. News, Events and Notices already have `tags`. An editor tags an item in the CMS and it appears. The P3 agent may later add a proper department relation (see `p3-academics-full-cms.md`); the page reads through one function, so the switch is small.
- Sample items for the preview: three seeded records per type are tagged `dcst`, titled "Sample ...", as every other article seed is.
- Faculty content lives in the department profile (`team`), not in the People collection, because the preview database already holds published Sample people that seeds never rewrite. The P3 brief now asks for People fields (designation, qualifications, photo, coordinator-of) so this moves into the CMS later.
- Names, titles and qualifications are owner-supplied, with no public source URL yet; the page keeps its "draft, being reviewed by the department" foot line. No e-mail or phone is shown.
- Removed with the contact block: location, office hours, campus photo, department e-mail on the page. The closing "Ready to apply?" call to action stays (apply, programmes); it is not contact information.

## Paths touched
`src/site/academics/**` (blocks, both Rich pages, CSS, types, profiles), `src/site/organisation/routes.tsx`, new `src/site/academics/feed.ts`, `scripts/import/seeds/articles.ts`, tests. No `src/collections/**`, no migration, no new dependency (rule 9: nothing added; the campus photo field, its helper and the location and hours fields are removed).

## Risks
Narrower hero may crowd the text (check 1280, 1024, 768, 390); feed query by tag may not work through Payload (check on local database); seeds create the new records only when missing, so a database that already ran the seed gets them on the next seed run.

## Tests and gate
Unit: profiles (team, coordinators resolve to real programmes, no e-mail), feed mapping. Integration: seeded `dcst` tag selects exactly its items. Browser: 0 px overflow, 0 axe at 1440, 1024, 390; screenshots opened. Gate: owner looks at the preview.
