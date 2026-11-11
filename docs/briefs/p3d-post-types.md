# Brief P3 slice 3d: Notices, Events, Jobs, Tenders (and the News decision)

Branch `p3/post-types-3d`, stacked on `p3/followups-3d` (PR #4), which is stacked on PRs #3 and #2. Date 2026-11-10. Plan: v2 7.2; Addendum 7 (expiry by type), 7.2 edits, 8 (field mapping).

## Objective
Add the four announcement types the Addendum names, governed like every other type, with the expiry rules of Addendum 7: Jobs, Tenders and Events cannot leave Draft without an expiry (LIF-04); Notices may have none and then leave current lists after 90 days unless pinned (LIF-02); expiry archives (LIF-01, already built in 3c).

## Paths touched (P3 lane)
New: `src/collections/{postTypes,Notices,Events,Jobs,Tenders}.ts`, one generated migration, tests, this brief. Changed: `src/payload.config.ts`, `src/collections/Posts/index.ts` (adds `bodyStatus`), `src/payload-types.ts`, `tests/int/access.matrix.int.spec.ts`, docs. Not touched: `(site)`, `src/site`, `src/design`, tokens, `lib/content.ts`.

## Design
- One factory (`postType`) so the four types cannot drift. Fields come from the Addendum mapping row "News, Notices, Events, Jobs, Tenders": title, publish date (`publishedAt`, filled in at publish if empty because current lists and age-out use it), tags (to ArticleTags), excerpt, rich-text body, hero image, attachments as links, old URL (`legacyUrl`), owner office and source (governance group), and the closing date, which **is** the governance `expireAt` (one field, not two). `bodyStatus` (full or stub) is added as Addendum 7.2 says.
- The only field not in the mapping is the Events start date (`startsAt`) and `venue`: an event needs a start. Easy to remove if the owner disagrees.
- `expiryRequired` on Jobs, Tenders and Events uses the policy option from 3c; Notices export `NOTICE_LISTING` (`{ ageOutDays: 90, dateField: 'publishedAt' }`) for the public list query (`currentWhere`). The public templates (P5) will use it; they are not built.
- Default risk class stays Standard. Admission dates, fees, leadership and legal pages are the Addendum's high-impact examples; none of these four is named, so nothing is raised by default. Editors or the importer can raise it.

## Decision for the lead: News
The Addendum counts five post types and gives News its own collection, but the repo already renders the template `posts` collection as the site's posts (milestone C). Renaming it would change routes and the main agent's templates. **Assumption: `posts` stays and is treated as News**; it gets `bodyStatus` and nothing else changes. Say so if you want a rename (a separate PR with a redirect plan).

## Not in this slice (and not run)
- Public list and item templates, revalidation and cache tags for the new types, search indexing (P5, main agent and later slice).
- Importer for these types (P4), the 90-day rule applied in any public query (no template yet), media rules, editor dashboard.
- REST-path tests for the new types (the policy is the same code path; Local API tested). Playwright.
- Schema change: 40 tables and one column. Generated; down needed `IF EXISTS` on four lines, as in 3a and 3b (disclosed).

## Tests
Integration, per type: full workflow, VER-01, audit entry; LIF-04 for Events, Jobs, Tenders (also when an approver skips review) and its absence for Notices; sweep archives an expired job and event; notice age-out with a recent, an aged, an expiring and a pinned notice; publish date fill-in; News `bodyStatus` default. Access matrix updated. On an empty database the integration run has 224 tests (it includes the 118 unit tests); typecheck, lint (0 errors) and build pass locally.
