# DCST layout as the blueprint for every department: Allied Health first

Written 2026-11-24 by agent 4 (lanes P4, P5), branch `p4/real-departments`, PR #116.

**Objective.** The owner asked (2026-11-24) that the DCST department page and its programme pages be the blueprint for all other departments and programmes, with sample content written for each department and programme (images come later). Allied Health Sciences goes first: the faculty page and its four programmes (BS MLT, BS Dental Technology, DPT, BS Radiography & Imaging) get the same bands, in the same order, as DCST.

**Decision recorded.** Until now the Allied Health pages were source-only (no curriculum, duration or eligibility, because no university page gives them). The owner now wants sample content like DCST's. So: facts from the university's own pages stay (faculty page, QEC list, three named staff, phone, e-mail, vision text) with their source address and `verifiedAt`, and everything else is illustrative text on a page marked `status: 'draft'` (the same quiet draft line DCST shows). No eligibility, fee or seat number is invented; those stay with the CMS record.

**Paths touched.**
- `src/site/academics/{types.ts, RichDepartmentPage.tsx, RichDisciplinePage.tsx, blocks.tsx, Academics.module.css, alumni.ts}` (DCST-only constants become profile fields; DCST output must not change).
- `src/site/academics/profiles/` (new Allied Health department and four programme profiles; register in `index.ts`).
- `src/site/organisation/routes.tsx` (the faculty route renders the department layout; programme route falls through to the discipline layout).
- `src/site/faculties/` (old source-only page, programme page and types removed once the profiles carry their facts: two components out for none in).
- Tests: `facultyProfiles.unit.spec.ts` replaced, `alumni.unit.spec.ts`, `academicsProfiles.unit.spec.ts` extended.
- No Payload schema, tokens or route addresses change (`/faculties/allied-health-sciences` and `/academics/programmes/<slug>` stay).

**Risks.** (1) Shared pages regress for DCST: compare the rendered HTML of three DCST pages before and after. (2) Sample curriculum read as fact: draft line on every page, no eligibility, fee or seats. (3) DPT is a longer programme than a BS: its page uses its own year count and does not borrow "4 years". (4) Stand-in pictures: the existing office-style art is reused until the owner supplies photographs.

**Tests / gate.** tsc, eslint, unit tests; axe, overflow and broken-image at 1440, 1024, 390 px on the faculty page, four programme pages and a work page; DCST pages byte-identical in text to the saved copies; sitemap and old `/faculty/` redirect unchanged. Gate: lead merges PR #116.
