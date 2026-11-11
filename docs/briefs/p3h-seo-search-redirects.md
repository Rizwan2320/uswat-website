# P3 slice 3h: SEO, search and redirects for the new content types

**Branch:** `p3/seo-3h`, stacked on `p3/dashboard-3g`. **Plan refs:** CMS-07, FR-09 and FF-08 (CMS side), MIG-02 (redirect targets).

## Objective
The public content types (Notices, Events, Jobs, Tenders) have SEO fields, appear in site search while live, can be the target of an old-address redirect, and leave search when they end.

## Paths touched (P3 lane)
`src/collections/postTypes.ts` (a `meta` group), `src/plugins/index.ts` (search and redirects lists), `src/governance/sweep.ts`, one generated migration, tests, docs. Not touched: `(site)`, `src/site`, `src/design`, tokens, routes, the portal paths.

## What changed
- **SEO group** on the four post types: title (70 characters), description (170), image. Counts as a content edit, so changing it on a live item sends it back through review. The image is held to the media rules at publish (alt text, recorded rights).
- **Search** covers Pages, News (`posts`), Notices, Events, Jobs and Tenders. Drafts are not indexed and unpublishing removes the entry (plugin behaviour, tested). People and offices are left out until P5 decides what search should show.
- **Redirects** can target the same six types.
- **Fix found by test:** the lifecycle sweep archives by writing straight to the row, which skips hooks, so an archived item stayed in search. The sweep now deletes its search entry in the same transaction.
- The pages sitemap (template code) is tested: it lists published pages and not drafts.

## Decisions and handovers
1. **Main agent (site lane):** `PayloadRedirects` builds the target as `/<collection>/<slug>` for anything that is not a page. `/notices/...`, `/events/...`, `/jobs/...` and `/tenders/...` need routes before such a redirect lands anywhere. Sitemaps for the new types are also a route job.
2. **Search needs a re-index** for content that already existed before this change (the plugin does not back-fill). Pages published earlier are not in the index until saved again or re-indexed.
3. People and offices stay out of search for now.

## Not built
Form-builder spam control and routing a submission to the owning office's mailbox (FR-10): there is no email adapter configured, and the rate limit is SEC-04 in P6. The access rules for forms and submissions are already in place (3a): only administrators write forms and only administrators and auditors read submissions. Not run: a real redirect hop, an HTTP search query, Playwright.

## Tests
Integration 5 new in `seo.search.int.spec.ts` and `sitemap.int.spec.ts`; whole suite 349 passed on an empty database; typecheck, lint (0 errors) and `next build` pass. The migration goes up, down and up on a copy and up on an empty database.
