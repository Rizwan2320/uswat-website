# Brief for the P3 agent: build Academics fully in the CMS

Date: 2026-11-21. From agent 4 (lanes P4 content and P5 public templates), at the owner's request. Branch `p4/real-departments`, PR #116. Nothing in this brief has been run or merged.

## The owner's instruction
An administrator must be able to create **any department and every programme (discipline) in it, with everything the public pages show, in the admin panel alone, with no developer and no code change.** Partly is not enough. A department created in the CMS must get the same rich page as DCST, and each of its programmes the same rich page as the five DCST disciplines.

## Where we are
- `departments` has name, slug, facultyGroup, summary, vision, mission, head, documents, emails. `programmes` has name, slug, department, campus, level, duration, eligibility, curriculumUrl, feeLink (collections in `src/collections/`, your lane).
- Everything else on the rich pages (hero, labs, research, careers, curriculum by semester, FAQ, pictures) is typed code in `apps/web/src/site/academics/profiles/` (`dcst.ts`, `cs.ts`, `se.ts`, `it.ts`, `ds.ts`, `ai.ts`). The exact shape is `apps/web/src/site/academics/types.ts` (`DepartmentProfile`, `DisciplineProfile`). A new department today needs a developer to copy a profile file. That is what has to go.
- The pages: `RichDepartmentPage.tsx` and `RichDisciplinePage.tsx`, chosen in `src/site/organisation/routes.tsx` by slug. Live check: the preview of branch `p4/real-departments` (PR #116).

## What to add (proposal, you own the final field design)
One migration, additive only. Fields go on the existing collections, not new ones, so the delete guard, governance, workflow, audit log and drafts keep working unchanged.

**Departments**, new group "Page content" (all `localized: true` where text, so Urdu works):
- `shortName`, `tagline`, `intro` (text)
- `heroImage`, `campusPhoto` (upload to Media; `alt` required, see rules)
- `about` (array of paragraphs, 2 to 4)
- `highlights`, `careers`, `studentLife` (arrays of `{icon, title, text}`)
- `labs` (array of `{title, text, image, tools[]}`)
- `researchAreas` (array of `{icon, title, text, tags[]}`)
- `faq` (array of `{question, answer}`)
- `location`, `officeHours` (text)
- Disciplines are not stored here: they are the programmes that point at this department, ordered by a new `order` number on the programme.

**Programmes**, new group "Page content":
- `shortName`, `tagline`, `summary` (one or two sentences for the card on the department page)
- `heroImage`, `tileImage`, `figureImage` (upload; `alt` required)
- `about` (array of paragraphs), `outcomes` (array of text)
- `whyStudy`, `tracks`, `careers` (arrays of `{icon, title, text}`)
- `skills` (array of `{group, items[]}`)
- `curriculum`: array of years, each with two semesters, each semester an array of course names. Four years by two semesters is the norm but allow 1 to 6 years so MS and PhD programmes fit.
- `faq`, `order`

**Shared:** `icon` is a select limited to the 20 names in `IconName` (`types.ts`). A `pageStatus` of draft or reviewed (draft prints one quiet line at the foot of the page); better still, derive it from the governance state so it is not a second thing to remember. Your call.

**People** (for the department's faculty section; today it is code in `profiles/dcst.ts` `team`): `designation`, `qualifications` (array of text), `photo` (Media, alt required), and which department role they hold (head, or coordinator of one or more programmes). Photos are public only when the person's visibility setting says so (3e already hides photo by default).

## Rules the fields must enforce (so an editor cannot break the layout or the policy)
1. Every image has alt text, required, and is a `media` upload; no external image URLs.
2. Maximums per list (the layout is tested up to these): highlights 6, labs 6, research areas 6, careers 8, FAQ 12, tracks 6, courses per semester 8, tags 6 per item. Minimums only where a section would look empty; empty lists hide their section, which the renderer already does not guarantee, so tell me and I will handle it.
3. Plain text only. No HTML, no Markdown, no raw links inside these fields. Any link field goes through `isSafeHref`.
4. Governance applies as for other records: source and `verifiedAt`, or the record is a draft and shows the draft line. No invented facts.
5. Delete guard and per-field access as in 3e. Departments and programmes stay editable by the roles the plan gives them; the head of a department is a Person, not free text.
6. Pictures: the generated SVGs under `public/images/academics/` should become seeded Media records so the seed can fill the new fields for DCST. Editors upload their own.

## Hand-off (the seam, rule 8)
1. You add the fields and the migration, with tests (up, down, up; one test that creates a department and two programmes with only the new fields through the Local API and reads them back).
2. You tell me the final field names (a short comment on PR #116 or a note under this brief). I do not edit `src/collections/**`.
3. I change `profileForDepartment` and `profileForDiscipline` to read the CMS fields first, and map them to the existing `DepartmentProfile` and `DisciplineProfile` types so the two templates do not change. I also update the seeds so DCST and its five programmes are filled **in the CMS records**, then delete the six profile files (three in, two out: the CMS fields replace the code profiles and the "register in index.ts" step).
4. Order of work: Departments first (one PR), Programmes second (one PR), or both in one if you prefer; say which.

## Definition of done (the gate)
- Using only the admin panel on a seeded preview, an editor creates "Department of X" and two programmes with all sections, saves, publishes, and the public pages `/academics/departments/x` and `/academics/programmes/y` render the full layout, with no code change and no redeploy.
- A department or programme with only the old fields still renders (the plain page), so nothing already live breaks.
- Typecheck, lint, migrations, integration tests and build are green; the accessibility check I ran (axe, no horizontal overflow at 320, 390, 768, 1280) is re-run on a page built from CMS fields.
- Predictions written before the migration drill, with the actual result after.

## Related smaller requests to the same lane
- Department news and events: let a Notice, Event or Post point at a department so the department page can list its own. Not part of the gate above.
- Academics landing page: an `order` on departments (and a faculty group grouping) so DCST can be shown first instead of by the old Sample faculty groups.
- Urdu: every text field above is localized; the rich pages are not yet tested in Urdu (RTL) and that is on my side.

## Not asked
No change to the home page, tokens, or routes. No real applicant or student data.
