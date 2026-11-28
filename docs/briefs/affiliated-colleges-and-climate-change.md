# Brief: Affiliated Colleges page and the Climate Change and Disaster Management department

Written 2026-11-28 by agent 4 (lanes P4, P5), branch `p4/real-departments`, PR #116. The owner replied (2026-11-28) to my questions after batch 4: "no dont add computer programms in dcst also invent the climate chmahe and disaster mangemnt and do a web search for afilliated colleges".

**What the owner decided.**
1. Nothing computer-related is added to DCST. The Shangla "Department of Computer and Software Technology" page stays unbuilt, and no computer programme is added to the DCST pages.
2. The Climate Change and Disaster Management department is to be written as illustrative content. It follows the standing decision that this is a competition entry with dummy data. The old page holds only its title (and the route map files it as an empty shell), so every other line is invented text for the template, marked `draft` and listed as "still to be confirmed". Real parts: the department's name, and the programme name "BS Disaster Preparedness and Climate Change", which the Environmental Sciences page lists. No staff are named and no eligibility is given.
3. A web search for Affiliated Colleges, so the page can have a real source.

**Web search result (2026-11-28).** Two standard searches returned the university's own pages "Public Sector Affiliated Colleges" (`uswat.edu.pk/public-sector-affiliated-colleges/`) and the private-sector page, a "Malakand Division Universities" page, the HEC university page and wiki and directory sites; nothing independent lists the colleges. I did not fetch the live university site (rule 5). The content is read from the saved copies on the owner's Drive (read 2026-11-28; the copies date from 2026-11-06): the two sector pages, the associate degree press release (Urdu), and the two-part "Details List of Affiliated Colleges" PDF from the Office of the Deputy Registrar Academics, which names 30 colleges.

**Personal data rule.** The list also gives principals' names and mobile numbers and the names and numbers of BS coordinators, controllers of examinations and QEC focal persons. None of that is shown, stored or committed.

**Objective.** (a) `/academics/affiliated-colleges`: one office-style page with the 30 college names as the list gives them, the programme names the two sector pages carry, and an English summary of the associate degree press release; the route map already sends the three old pages here. (b) `/academics/departments/climate-change-and-disaster-management` in the DCST layout, with `/academics/programmes/bs-disaster-preparedness-and-climate-change`.

**Paths touched.**
- NEW `src/site/offices/profiles/affiliated-colleges.ts`, registered in `PAGE_PROFILES`; route file `src/app/(site)/(cms)/academics/affiliated-colleges/page.tsx`; sitemap list and header menu entry. The home page's slide link stays as the owner wrote it.
- NEW `src/site/academics/profiles/departments/climate-change.ts`, registered in `profiles/index.ts`; three alumni works; seed rows (departments 31 to 32, programmes 46 to 47); banners and chips; the Environmental Sciences open point that said the programme has no page.
- Tests: page-profile list (fourteen), alumni list and count, seed counts.

**Risks.** (1) The list's wrapped lines (names split from districts) could be joined wrongly: I check each of the 30 names against the PDF text. (2) The list does not say which sector a college belongs to, so none is stated. (3) A department with no named staff must render (the faculty band should hide). (4) Banner regeneration rewrites nine existing SVGs: revert them.

**Gate.** tsc, eslint, unit tests; axe, overflow and broken-image checks at 1440, 1024 and 390 px on the three new pages; DCST unchanged. The lead merges PR #116.
