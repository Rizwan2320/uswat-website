# Brief: the ten remaining departments in the DCST blueprint layout (batch 4)

Written 2026-11-27 by agent 4 (lanes P4, P5), branch `p4/real-departments`, PR #116. Same method as the three earlier department briefs. The owner said "carry on" (2026-11-27) after "go ahead".

**Objective.** Education and Staff Training, Home Economics, Islamic and Arabic Studies, Law and Sharia, Media and Communication Studies, Pakistan Studies, Pashto, Social and Gender Studies, Tourism and Hospitality, and Urdu get the DCST department layout, each with its programme pages (twelve in all): B.Ed (Hons), BS Home Economics, BS Islamic Studies, BA LL.B (Law and Sharia), BS Media and Communication Studies, BS Pakistan Studies, BS Sociology, BS Criminology, BS Tourism and Hospitality, BS Culinary Arts, BS Pashto and BS Urdu.

**Facts and sample content.** Every fact comes from the department's saved page (read from the owner's Drive on 2026-11-27; the pages date from 2026-11-06): introductions, vision and mission, objectives, degrees offered, eligibility lines, the named staff with the titles and qualifications the page gives, and the department mailboxes and phone numbers. Personal e-mail addresses are not shown. Everything else (highlights, laboratories, research areas, careers, student life, questions, study plans, alumni work) is illustrative and `draft`. The programme pages on the old site hold only a name and links, so their text is illustrative apart from the eligibility statements. No coordinators are named.

**Page problems carried as open points, not fixed by guessing.**
- Urdu: the page names one person, Dr. Lala Rukh, titled Associate Professor in Finance (PhD in Management Sciences). That looks like a page error; no head is named.
- Law and Sharia, Pashto and Urdu pages are partly generic or give no eligibility.
- The Media page says the BS "intends to start this year"; the Pashto and Urdu pages state no year of founding.
- Home Economics has a second page (College of Home Sciences) with the five specialisations, objectives and careers; I fold its text into the department page and leave `home-sciences` for the lead to redirect.

**Programme slugs.** Eight come from the old site's address list (`b-ed-hons`, `bs-home-economics`, `bs-islamic-studies-2`, `ba-llb-law-and-shariah`, `bs-journalism-and-mass-communication-2`, `bs-pakistan-studies-2`, `bs-sociology`, `bs-tourism-and-hospitality-2`). Four are new because the department pages name the degree but the old list has no address: `bs-criminology`, `bs-culinary-arts`, `bs-pashto`, `bs-urdu`. The lead may want redirects for them.

**Not built here.** `home-sciences`, `pashto-and-local-languages` (a duplicate of `pashto`), `cultural-heritage-tourism-and-hospitality-management` (the institute), MPhil and PhD programmes, BS Forensic Sciences, BS Fisheries and the other ten Management and Commerce degrees.

**Paths touched.**
- NEW `src/site/academics/profiles/departments/` files for the ten departments; registered in `profiles/index.ts`.
- `alumni.ts`: 36 sample entries. `scripts/import/seeds/data.ts`: ten department rows and twelve programme rows (21 to 31 and 34 to 46). Twenty-two banners and chips at the end of the art lists.
- Tests: seed counts and labels, alumni list and count, concurrency counts, the page-profile tests if any page was named.

**Risks.** (1) A department page that has a static route file or an office profile must still resolve; I check first. (2) Regenerating banners rewrites nine existing SVGs: revert them. (3) A staff id repeated across departments (Dr. Rafi Ullah is on the Pashto and Media pages) may trip a uniqueness rule. (4) The sample-content rule: nothing invented may read as a fact.

**Gate.** tsc, eslint, unit tests; axe, overflow and broken-image at 1440, 1024 and 390 px on the 22 pages; the DCST page unchanged. The lead merges PR #116.
