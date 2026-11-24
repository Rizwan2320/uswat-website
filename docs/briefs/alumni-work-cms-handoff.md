# Alumni work: CMS hand-off for the lead / P3

Written 2026-11-24 by agent 4 (lanes P4, P5). Agent 4 did not touch the Payload schema (rule 8); this is what the schema owner needs.

## What exists now

- "Our alumni" band: three cards on the DCST department page and on each of the five DCST programme pages (`src/site/academics/Alumni.tsx`).
- Each card is one link to `/academics/alumni-work/<slug>` (`AlumniWorkPage.tsx`): summary, tags, and a "Read the full work" button when the entry has a public link.
- Data is a plain list in `src/site/academics/alumni.ts`: 15 made-up sample entries, three per programme. The band shows one "Sample" tag. Portraits show initials until a photograph is supplied.
- The 15 work pages are in the sitemap. Unit tests: `tests/unit/alumni.unit.spec.ts`.

## Proposed CMS collection `alumni-work`

| Field | Type | Notes |
|---|---|---|
| `slug` | text, unique | Address part; same rule as other collections |
| `name` | text | Alumnus |
| `classOf` | number | Graduation year |
| `programme` | relationship to `programmes` | Decides which programme page shows it |
| `department` | relationship to `departments` | For the department page |
| `kind` | select | Thesis, Final-year project, Research paper |
| `headline` | text | One line on the card |
| `summary` | textarea | Two or three sentences |
| `tags` | array of text | |
| `photo` | upload (media) | Portrait, about 4:5, with alt text; only with the alumnus's consent |
| `workUrl` | text (https only) | Repository, thesis or paper; optional |
| `featured` | checkbox | Department page shows the three newest featured entries |
| `_status` | draft / published | Department admin publishes; same access rules as news |

Access: a Department Admin edits only entries of their own department (see `FP-department-portal-gap.md`, where alumni are already listed as a Department-Admin section).

## Switching the pages over

1. Replace `ALUMNI_WORKS` with a query (`alumniForProgramme`, `alumniBySlugs`, `alumniWork` keep their signatures); keep `revalidate = 300`.
2. Make `generateStaticParams` in the work route read published slugs (and drop `dynamicParams = false`).
3. Build the sitemap entries from the collection instead of the `ALUMNI_WORKS` import in `src/site/sitemap/entries.ts`.
4. Show the "Sample" tag only on entries marked sample (seed data), not on real ones.

## Open points for the owner

- Real alumni, their consent for name and photograph, and the public address of each work.
- Whether other departments want the band (the component takes any list, so it is one line per page).
