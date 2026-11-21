# P3 slice 3ad: a department can carry its whole public page in the CMS

**Branch:** `p3/academics-departments-3ad`, stacked on `p3/academics-create-admin-only` (PR #120, "only a platform admin creates departments and programmes"). **Lane:** `src/collections` (Departments, a shared page-content field module), `src/governance` (a plain-text check), `src/i18n`, one generated migration, tests, docs. **Schema change: yes, additive only, one generated migration. No new dependency.** Source: agent 4's brief `docs/briefs/p3-academics-full-cms.md` (PR #116), the owner's instruction "an administrator must be able to create any department and every programme in it, with everything the public pages show, in the admin panel alone". This slice is the Departments half; Programmes is the next slice (3ae).

## Decisions
1. **Fields go on the existing `departments` collection**, in one named group `pageContent` ("Page content"), so governance, workflow, audit, drafts, versions and the delete guard apply unchanged. No new collection.
2. **Fields:** `shortName`, `tagline`, `intro`; `heroImage`, `campusPhoto` (Media uploads); `about` (paragraphs, up to 4); `highlights` (up to 6), `careers` (up to 8), `studentLife` (up to 6), each row an icon, a title and a text; `labs` (up to 6: title, text, picture, up to 6 tools); `researchAreas` (up to 6: icon, title, text, up to 6 tags); `faq` (up to 12 question and answer); `location`, `officeHours`. Top level: `order` (a number, so DCST can be shown first).
3. **Localization is on the text inside each row, not on the list.** A list that is localized as a whole makes the Urdu editor rebuild every row, icon and picture. Here the rows (and their icon and picture) are shared and only the words change language; an untranslated word falls back to English, as everywhere else.
4. **Disciplines are not stored on the department.** They are the programmes that point at it, ordered by `order` on the programme (slice 3ae).
5. **Plain text only** (agent 4's rule 3): one pure check rejects HTML tags, Markdown links and web addresses in every text field of the group. It runs on publish like other validators; a draft may hold anything while it is being written.
6. **Pictures:** every picture is a Media upload. The publish guard already scans nested groups and lists (`mediaGuard.scanFields`), so alt text and rights are checked at publish with no new code; a test shows it for a picture inside a lab row.
7. **Icons:** one select of the 20 names the site draws (`IconName`, `src/site/academics/types.ts`, main agent's lane). If the site adds a name, one constant here is edited; a unit test pins the list so a silent drift shows.
8. **Status line:** no `pageStatus` field. The "draft" line at the foot of the page is derived by the site from the governance stage (agent 4 said that was better; their change).
9. **Empty is allowed.** No minimums: an empty list is a department with that section left out. Hiding an empty section is the renderer's job (agent 4 said they handle it).
10. **Create stays platform admin only** (slice 3ab). Tests create departments as an admin or the system.

## Not doing
- No change to `src/site`, the templates or the seeds (agent 4's lane). The seed that fills DCST in these fields, and deleting the code profiles, are theirs once the field names are final (below).
- No Programmes fields (slice 3ae). No faculty-group ordering and no Notice or Event link to a department (listed as related requests; Post already links, slice 3x).
- No Urdu review: the Urdu lines are drafts like every other.

## Final field names (the hand-off)
`departments.order`; `departments.pageContent.{shortName, tagline, intro, heroImage, campusPhoto, about[].text, highlights[].{icon,title,text}, careers[]…, studentLife[]…, labs[].{title,text,image,tools[]}, researchAreas[].{icon,title,text,tags[]}, faq[].{question,answer}, location, officeHours}`.

## Risks
1. A localized text field inside an array creates a per-locale table for the array: more tables, one wide migration. Mitigation: up, down, up on a populated copy and an empty database, predicted first.
2. Validators run on publish only, so a draft can contain a web address. Mitigation: documented; the publish check is the gate, and the test shows a refusal and a control.
3. Admin form length: about 15 sections on one screen. Mitigation: the group is collapsible with the lists closed by default; screenshots at 1440 and 390 px.
4. Postgres identifier length (63): long array-in-array names. Mitigation: `dbName` on the nested lists if the generator truncates; the migration is read, not trusted.

## Gate
Predictions first. Typecheck, lint, unit, integration, build, no drift, migration drilled. One test creates a department with only the new fields through the Local API and reads it back; one shows a publish refused for a web address in a text field, an unknown-rights picture inside a lab, and a list over its maximum. Light-mode screenshots at 1440 and 390 px. Anything not run: say "not run" and why.
