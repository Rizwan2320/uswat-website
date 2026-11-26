# P3 slice 3ar: who controls what on a department and programme page (pilot: DCST)

**Objective.** Make the CMS fields that slices 3ad and 3ae added actually drive the public department and programme pages, prove it on one department (DCST and its five BS programmes), and show every head and coordinator, on their dashboard, which parts of their page they control and where each stands. The pattern is generic: nothing in it names DCST.

**Finding that started this (2026-11-26).** The rich pages read their text from typed code profiles (`site/academics/profiles/*.ts`, agent 4). The CMS group `pageContent` exists on both collections but nothing in `src/site` reads it. Only `vision`, `mission` (department) and `name`, `level`, `duration`, `eligibility` (programme) reach the page. So today a head who edits the labs in the CMS changes nothing public.

## Control matrix (the proposal for the owner to confirm)

| Part of the page | Who changes it | Where it lives | Rule |
|---|---|---|---|
| Layout, section order, section headings, colours, icon set, banner artwork, Urdu interface words, the "draft" line | Nobody in the CMS | Template and tokens | Same on every department, so the university looks like one place |
| Department name, address (slug), faculty group, show order, owner office, creating or archiving a department | Platform admin | CMS | Identity and structure |
| Programmes of a department and their order; creating a programme; creating coordinator accounts | Head of department | CMS | Slice 3ap |
| Introduction, tagline, about, vision, mission, highlights, labs, research areas, careers, student life, questions, location, office hours | Head of department | CMS `departments.pageContent` | Plain text; approval before publish |
| Level, duration, eligibility, fee and apply links | Head or coordinator, with a source link and a review | CMS programme fields | Institutional facts need a source (rule 3); candidates to come from Odoo later |
| Programme introduction, tagline, summary, about, outcomes, why study, tracks, skills, curriculum by semester, careers, questions | Coordinator of that programme (the head too) | CMS `programmes.pageContent` | Plain text; approval before publish |
| Pictures | Head (department) and coordinator (programme), from the media library | CMS upload | Alt text and rights checked at publish; until a picture is chosen the template's artwork shows |
| Programme cards, counts, people band, news and notices feed, alumni | Nobody: derived | Other CMS records | A head changes the source record, not the page |

**Rule for mixing:** a section the CMS has filled replaces the code profile's version of that section; an empty section falls back to the profile. So an untouched page looks exactly as before, and the first edit to a section is an edit of the whole section. The CMS is seeded with the profile's current text so the head starts from what is live, not from a blank list.

## What heads and coordinators see
Their dashboard card for each page gets: a link to the live page, a link to preview the draft, and a checklist of the sections they control (filled or empty, and how many rows), plus one line naming what the template fixes. A coordinator sees only their own programmes; a head sees the department, its programmes and each programme's coordinators.

## Paths touched
- **CMS lane (mine):** `src/governance` (section checklist, board fields), `src/admin/EditorDashboard`, `src/collections/academics` (the profile-to-CMS converter and seed), tests, docs.
- **Site lane (agent 4; draft PR, lead decides):** one new pure module `src/site/academics/cmsContent.ts` and two lines in `src/site/organisation/routes.tsx` that pass the merged profile to the existing pages. No renderer, token, schema or route file is edited.

## Not doing
Pictures are not seeded (the profile's pictures are files in `public/`, not Media uploads); seeding Sample or real DCST content into production (needs the lead's explicit go, and only the local database is touched here); Odoo; the other departments' profiles.

## Risks
1. The page changes for a visitor when a head edits a section (intended), or when the seed differs from the profile (not intended). Mitigation: a test proves that profile to CMS and back is lossless for every covered section.
2. Urdu: a section filled only in English shows English text in the Urdu page (Payload fallback). Same as the rest of the site; stated, not solved.
3. A head empties a section to remove it, and the profile text reappears. Mitigation: documented in the editor guide; hiding a section for good is a template decision.
4. Cross-lane edit. Mitigation: draft PR, lead merges.

## Tests
Unit: merge rules per section (CMS wins when filled, profile when empty, localized fallback, picture mapping, lists capped), the profile-to-CMS converter round trip, the section checklist. Integration: a department saved with the seeded content reads back and merges to the same profile. Browser (production build): as head and as coordinator, edit one section in the admin, publish, see it on the public page, and see the dashboard checklist change; axe on the dashboard card.

## Gate
Full integration suite and the CI browser specs pass on the head commit; the DCST page is unchanged for a visitor before any edit; one edit made as a head shows on the public page; the owner confirms the matrix.

## Corrections made while building (2026-11-27)
- **Tagline is not shown** by either page body, and the department's **location** and **office hours** are not shown either. The matrix above lists them as head-controlled fields; they are saved but change nothing public. They are left out of the dashboard checklist, and their form descriptions say "Not shown on the public page yet." Recommendation for the lead: either render them in the template or remove the fields.
- **Preview link:** the brief promised a link to preview the draft on the dashboard card. Not done: the page's own edit screen already has the preview, and a second route would need the preview-secret flow. The card links to the live page only.
- **Seeding is draft first.** Governance requires a change to published content to be saved as a draft and go through review, so the seed saves a draft; `--publish` walks in review, approved and published as the local platform admin and is only for a pilot database.
- **Section replace, not row merge.** Documented in the editor guide: filling a section replaces the profile's whole section.
