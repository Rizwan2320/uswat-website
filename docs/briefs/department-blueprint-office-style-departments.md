# Brief: the six office-style departments in the DCST blueprint layout (batch 3)

Written 2026-11-27 by agent 4 (lanes P4, P5), branch `p4/real-departments`, PR #116. Same method as `docs/briefs/department-blueprint-sciences.md` and `docs/briefs/department-blueprint-life-sciences.md`. The owner said "go ahead" (2026-11-27) to the departments I listed as next.

**Objective.** Geology, Archaeology, Environmental Sciences, Economics and Development Studies, English and Foreign Languages, and Management and Commerce were built on 2026-11-25 as office-style pages. They now use the DCST department layout, each with its programme pages: BS Geology, BS Archaeology, BS Environmental Sciences, BS Economics, BS Development Studies, BS English, and BBA (Hons).

**Facts and sample content.** Every fact comes from the saved department pages (read 2026-11-06) through the profiles built on 2026-11-25: introductions, vision and mission, objectives and outcomes, the Geology elective groups and eligibility, the Archaeology museum and eligibility, the Environmental Sciences research groups, the English core values, the Board of Studies item, 44 named staff with titles, and the department mailboxes (not personal addresses). Everything else is illustrative and `draft`. The seven programme pages on the old site hold only a name and links, so their text is illustrative apart from the two eligibility statements. No coordinators are named.

**Not built here.** The other ten degrees of Management and Commerce, BS Disaster Preparedness and Climate Change and the Geomatics diploma have no page in the route map; they are named in the text.

**Paths touched.**
- NEW `src/site/academics/profiles/departments/{geology,archaeology,environmental-sciences,economics,english,management}.ts`; registered in `profiles/index.ts`.
- REMOVED: the six office profiles in `src/site/offices/profiles/`, their six static route files under `academics/departments/`, and their six entries in the sitemap list (the department route renders the profile; the sitemap lists the departments from the CMS records). Menu addresses are unchanged.
- `alumni.ts`: 21 sample entries. `scripts/import/seeds/data.ts`: six department rows and seven programme rows (15 to 21 and 27 to 34). Seven banners and chips at the end of the art lists. `RichDisciplinePage.tsx`: the alumni line uses the programme badge, so a BBA does not read "BS BBA".
- Tests: seed counts and labels, alumni list and count, concurrency counts, and the page-profile tests that named the six pages.

**Risks.** (1) A department page whose static route file I delete must still resolve: the dynamic route uses the profile when the CMS has no record. (2) Regenerating banners rewrites nine existing SVGs: revert them. (3) The old pages' unit tests asserted on the removed profiles; they move, they are not weakened. (4) The sample English, History, Economics and Business rows in the seeds remain; they are now redundant next to the real rows.

**Gate.** tsc, eslint, unit tests; axe, overflow and broken-image at 1440, 1024 and 390 px on the thirteen pages; the six menu addresses still return 200; the DCST page unchanged. The lead merges PR #116.
