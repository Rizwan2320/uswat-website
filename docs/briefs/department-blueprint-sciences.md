# Brief: departments in the DCST blueprint layout, batch 1 (Physics, Chemistry, Mathematics and Statistics)

Written 2026-11-26 by agent 4 (lanes P4, P5), branch `p4/real-departments`, PR #116. (Written with the first files, not before: the scope was settled by reading the route map and the Drive copies first.) Read first: `docs/briefs/department-blueprint-allied-health.md`.

**Objective.** The owner asked (2026-11-24) for every department and programme to follow the DCST pages, with sample content and images later; "go ahead" on 2026-11-26 started the rest. About 30 departments and 30 programmes remain, so this is batch 1 of several: three departments and four programmes.

**Facts and sample content.** From the saved department pages (read 2026-11-06): introductions, vision or mission text, the programmes each department lists, the eligibility for BS Physics and BS Chemistry, and the named staff with titles and qualifications. No page names programme coordinators, so none are shown. The three programme pages on the old site are empty (62 to 75 bytes), so the programme pages carry only the name and department as facts. All other text (highlights, laboratories, research areas, careers, student life, study plans, alumni) is illustrative and marked `draft`. Personal e-mail addresses on the old pages are not shown.

**Paths touched.**
- NEW `src/site/academics/profiles/sciences/{core,physics,chemistry,mathematics}.ts`; registered in `profiles/index.ts`.
- `src/site/organisation/routes.tsx`: a department or programme with a profile renders even when the CMS has no record (as offices already do); the faculty route shares the programme-card helper.
- `src/site/academics/{types.ts,RichDisciplinePage.tsx}`: optional `eligibility` on a programme profile, used when the CMS record has none.
- `src/site/academics/alumni.ts`: 12 sample entries (three per programme, stand-in portraits).
- `scripts/import/seeds/data.ts`: the sample Physics, Chemistry and Mathematics departments and their sample programmes are replaced by real rows (same counts).
- `apps/web/scripts/make-office-banners.mjs`, `make-academic-art.mjs`: seven keys; tests updated.

**Slugs.** Follow the route map: `/academics/departments/{physics,chemistry,mathematics-and-statistics}`, `/academics/programmes/{bs-physics-2,bs-chemistry-2,bs-mathematics-2}`. BS Statistics (`bs-statistics`) is listed on the department page but has no page in the route map.

**Risks.** (1) DCST and Allied Health regress: compare rendered text before and after. (2) Real staff shown with illustrative text around them: draft line and "still to be confirmed" on each page. (3) Faculty of each department not on the pages: kept in the placeholder faculty group, as DCST is.

**Gate.** tsc, eslint, unit tests; axe, overflow and broken-image at 1440, 1024 and 390 px on the seven pages; DCST text identical. The lead merges PR #116.
