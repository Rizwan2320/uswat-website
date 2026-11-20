# P3 slice 3x: News gets its missing fields, and a link to a department

**Branch:** `p3/post-fields-3x`, from `main`. **Lane:** `src/collections/Posts`, `src/migrations` (generated), tests, docs. **Schema change: yes, one generated migration. No new dependency.** Source: two notes to the P3 agent, from the importer (docs/briefs/p4-importer.md: "`posts` has no `legacyUrl`, `excerpt` or `attachments`") and from the site (docs/briefs/p5-organisation.md: "no field links a post to a department"). The owner said "implement them" on 2026-11-20.

## Problem
1. News (`posts`) is the one announcement type without `legacyUrl`, `excerpt` and `attachments`. The importer therefore keeps the old address in `governance.source` only and drops the summary and the attached files for News. The site cannot show a summary in the News list or the files under an article.
2. Nothing links a post to a department, so a department page cannot show its own news, and a department's IT team has no way to say "this news belongs to us".

## Decision
1. Add to `posts`, with the same names, labels and checks as Notices, Events, Jobs and Tenders (so one importer path and one site reader work for all five):
   - `legacyUrl` (text, indexed): "Address on the old site".
   - `excerpt` (textarea): "Short summary".
   - `attachments` (list of link text + web address; the address passes `safeHrefValidate`, as elsewhere).
2. Add `department` (one department, indexed) to the Details tab. One, not many: a news item has one owner department; a university-wide item leaves it empty and uses the owner office as today.
3. **Not localized**, unlike the other four types. News keeps one title and one body in all languages (the `title` and `content` fields of `posts` are not localized); a summary that changed language while the title did not would be half-translated. If News is localized later, all of these change together by one migration.
4. All four count as content edits (governance/hooks.ts), so editing a published post's summary or files sends it back for review like any other content change.
5. **Deleting a department that posts still point at is refused**, with the count, with no new code: the integrity check (slice 3s) finds links from the finished config. A test shows it.
6. The department link is a pointer only. It does not decide who may edit the post: that stays the post's owner office (`governance.ownerOffice`), as in the access policy.

## Not doing
- No change to the site queries: `src/site/articles/config.ts` says News has no excerpt or attachments (`hasExcerpt`), which the main agent flips when they read the new fields. Reported, not edited.
- No importer change: the writer already fills `legacyUrl` "where the collection has it" (p4-importer.md) and is agent 4's.
- No backfill of existing rows: production has Sample content only, and `legacyUrl` is filled by the importer.

## Risks
1. A generated `down` that does not run (found twice in earlier slices). Mitigation: up, down, up on a populated copy and on an empty database, predicted first.
2. Versions tables: each field also needs a column in `_posts_v`. The generator adds them; I check by reading the SQL.
3. The Urdu coverage test may flag a new admin label. Mitigation: reuse existing labels.

## Gate
Typecheck, lint, unit, integration, build, no drift (`migrate:create` finds nothing after the migration), migration drilled on a populated copy and a fresh database, `generate:types` clean.
