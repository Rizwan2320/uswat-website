# Brief: department and programme pages, T3 and T4 (agent 4, 2026-11-14)

- **Objective.** `/academics/departments` (index grouped by faculty group), `/academics/departments/{slug}` (T3), `/academics/programmes` (index grouped by department), `/academics/programmes/{slug}` (T4). These are the addresses the route map already sends the old department and programme pages to (40 and 31 rows). Reads published records from the CMS; the Sample seeds (PR #51) give it data until the pack arrives.
- **Paths touched.** `apps/web/src/site/organisation/*` (new), four route files under `apps/web/src/app/(site)/(cms)/academics/`, tests, this brief, `docs/predictions.md`, `docs/STATUS.md`. Nothing under `src/collections`, `src/governance`, `src/migrations`, `src/site/components`, tokens or the route map.
- **Risks.**
  1. Drafts must never reach the public: every list read has no user and `draft: false`; the single-record read uses `previewReadOptions`, so draft mode without a login serves nothing (tested).
  2. Personal data: a person's email is shown only when the CMS field rule returns it (visibility Public). The page never reads it any other way (tested: hidden email is null).
  3. Invented data taken for fact: a record whose `governance.source` is on `sample.invalid` shows a "Sample" pill and a one-line note on its page.
  4. No revalidation hooks on these types yet, so lists are cached 300 s under `list:{collection}` (same bound as the articles).
  5. A `/academics/...` folder next to the Pages catch-all `[slug]`: static segments win, and `/academics` itself is still served by Pages (checked in the browser).
- **Not in this PR.** News on a department page (no field links a post to a department), an apply link on T4 (no such field in the CMS), person pages (plan non-goal), offices and people directory (T7) and documents (T8, next PR), faculty-group pages, search and sitemap entries, Urdu strings for the new interface words (they show in English until the owner supplies them; ADR 0008).
- **Tests.** Unit: Sample detection, paragraphs, grouping and ordering, cards. Integration on a real PostgreSQL: published only, draft not served with draft mode and no login, programmes of one department, current people only, public vs hidden email. Manual: screenshots at 1440, 1024 and 390 px, left-to-right and right-to-left; axe (WCAG 2 A, AA) on the four pages and a 404.
- **Gate.** Typecheck, lint, unit and integration green; no axe violations; no horizontal scroll at 390 px; right-to-left renders.
