# P3 slice 3k: plain-language labels

**Branch:** `p3/labels-3k`, stacked on `p3/admin-flows-3j`. **Plan refs:** risk table ("Payload admin too technical for office staff", mitigation: plain labels), CMS-15.

## Objective
An office clerk should be able to read every field name and help line without knowing web-developer words. No behaviour change except where noted. **No migration:** labels, help text, option text, menu groups and validators do not change the schema (prediction P3k-a, confirmed).

## What changed
- **Ownership and approval panel** (was "Governance"): Stage (was Workflow status), Source of the facts, Fact-check (Not verified yet / Verified / Needs a new check), Verified on, Check again by, How sensitive is it? (was Risk class), Go live on, Take down on, Keep in current lists. Help text says when each applies (Go live on works once the Stage is Approved).
- **Internal fields hidden from editors:** the two content fingerprints. "Where this came from" and "Collected on" show only for imported records.
- **Content types** (notices, events, jobs, tenders, posts): Main image, Main text, Short summary, Date shown to readers (it does not publish; the help says so), Text status (was a second field called "Body"), Link text, Web address, Address on the old site.
- **Web address ending** replaces "Slug" on all 11 collections that have one (`src/fields/plainSlug.ts`).
- **Media:** Alt text (describes the picture), Photo credit, Permission to use, File fingerprint.
- **Audit log:** every column has a readable name; action and who-did-it options are words, not codes.
- **Links and blocks:** Link to, Web address, Link text, What to list, How many to show, Introduction.
- **Search and sharing** replaces the tabs called SEO and Meta. `plainMetaImage.ts` replaces the plugin's picture field because its help text said "12MB" while our limit is 8 MB.
- **Menu:** Pages, Posts, Media and Categories now sit under Content; Users and the audit log under Administration.
- **Guard test** `tests/int/labels.int.spec.ts`: every visible field has a written label, no developer words, no duplicate sibling labels, no raw option codes, every collection in a menu group.

## Also changed, for the reviewer
1. **Link safety gap closed:** the document links on departments and offices, and the CV and publication links on people, had no check that a link starts with https, mailto, tel or a path (the other collections did). They use `safeHrefValidate` now. Validator only; existing rows are not rewritten.
2. **SEO title generator** said "| Payload Website Template" when an editor pressed Generate; it now says "| University of Swat".
3. `src/blocks/ArchiveBlock/config.ts` and `src/blocks/Form/config.ts` (labels only) are outside the list of P3 paths; I judged them part of the CMS schema. Revert them if you disagree.

## Slip to disclose
I ran a repo-wide formatter once and it reformatted about 80 files outside my lane (`(site)`, `src/design`, components). I noticed before committing and restored them all; the diff contains only the files listed above.

## Tests
Typecheck, lint (0 errors), 369 tests on a fresh empty database, `next build`, and the 4 browser flows all pass. Screenshot of the editor's notice form checked at 1440 px.

## Not run / open
- **Urdu admin labels:** the labels are English only; no Urdu admin wording was written or checked.
- **Real editors:** CMS-15 still needs two staff; these words are my judgement, not tested on anyone.
- **Error messages** (for example "Only a reviewer can mark a record as verified") were not rewritten; they match the new field words. A message audit is a separate item.
- **Left unchanged template leftovers (main agent):** the public pages' title and OpenGraph still say "Payload Website Template" (`src/utilities/generateMeta.ts`, `mergeOpenGraph.ts`, seed files, and `tests/e2e/frontend.e2e.spec.ts` expects it).
- **Office names show lower-case** (stored lower-case); still open.
