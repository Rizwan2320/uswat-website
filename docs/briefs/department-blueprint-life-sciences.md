# Brief: departments in the DCST blueprint layout, batch 2 (Block C life sciences)

Written 2026-11-27 by agent 4 (lanes P4, P5), branch `p4/real-departments`, PR #116. Read first: `docs/briefs/department-blueprint-sciences.md` (batch 1, same method). The owner said "yes and go ahead" (2026-11-26) to the life sciences as the next batch.

**Objective.** Five departments and seven programmes in the DCST layout: Botany, Zoology, Biotechnology, Genetics, Forensic and Microbiology, Psychological Studies, Agricultural Sciences and Forestry; programmes BS Botany, BS Zoology, BS Biotechnology, BS Genetics, BS Microbiology, BS Psychology, BS Forestry.

**Facts and sample content.** From the saved department pages (read 2026-11-06): introductions, vision and mission or aims text, the programmes each page lists, the staff with their titles, the Forestry laboratories, research groups and entry requirements (BS and MPhil), and the Botany department office line. Staff of the women's campus sections (`botany-2`, `zoology-2`, `psychological-studies-wc`) are shown on the one department page, tagged "Women Campus". Personal e-mail addresses are not shown. No page names a Botany, Zoology or Forestry programme coordinator, so none is shown; the Forestry page names no head, so none is shown. All other text (highlights, laboratories, research areas, careers, student life, study plans, alumni) is illustrative and marked `draft`. The seven programme pages on the old site hold only a name and links to scheme-of-studies PDFs, so their text is illustrative apart from the BS Forestry entry requirement.

**Not built here.** BS Forensic Sciences (listed on the Biotechnology page) and BS Fisheries (listed on the Zoology page) have no page in the route map; they are named in the department text and recorded as open points. The three women's-campus duplicate department pages and the programme duplicates (`bs-botany-wc`, `bs-zoology-wc`, `bs-psychology-3`) are left for the lead to point at the main page in the route map.

**Paths touched.**
- NEW `src/site/academics/profiles/sciences/{botany,zoology,biotechnology,psychology,forestry}.ts`; registered in `profiles/index.ts`.
- `src/site/academics/alumni.ts`: 21 sample entries (three per programme, stand-in portraits).
- `scripts/import/seeds/data.ts`: five real department rows and seven real programme rows (counts 10 to 15 and 20 to 27).
- `apps/web/scripts/make-office-banners.mjs`, `make-academic-art.mjs`: twelve keys, added at the end of the list.
- Tests: seed counts and labels, alumni programme list and count.

**Risks.** (1) Real staff next to illustrative text: draft line and "Still to be confirmed" on each page. (2) The same person is listed on two pages (Dr. Akhar Rasool: Zoology and Biotechnology; Dr. Zahid Ullah: Botany and Forestry); kept as the pages have it. (3) The pages disagree on a title (Dr. Shazia Sakhi; Ms. Roya Shahhiman Zada): the main page is used and the difference is an open point. (4) Regenerating banners rewrites existing SVGs: revert any modified existing file.

**Gate.** tsc, eslint, unit tests; axe, overflow and broken-image at 1440, 1024 and 390 px on the twelve pages; DCST and batch 1 text unchanged. The lead merges PR #116.
