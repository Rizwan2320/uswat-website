# Brief: sitemaps for the new content types, agent 4, 2026-11-18

- **Objective.** A crawler finds every published public page: Notices, Events, Jobs, Tenders, Departments, Programmes, Offices and the list pages (new `content-sitemap.xml`), News at its real address `/news/{slug}`, and Pages. CMS-07 and FF-08 (drafts never in a sitemap).
- **Paths touched.** `apps/web/src/site/sitemap/*` (new), `app/(frontend)/(sitemaps)/content-sitemap.xml/route.ts` (new), `posts-sitemap.xml/route.ts` and `pages-sitemap.xml/route.ts` (small fixes), `apps/web/next-sitemap.config.cjs` (lists the new sitemap in robots.txt), tests, docs.
- **Fixes found on the way.**
  1. `posts-sitemap.xml` listed `/posts/{slug}`, which is not a public address (News is `/news/{slug}`). Now `/news/{slug}`.
  2. Both stock sitemaps built the site address from `VERCEL_PROJECT_PRODUCTION_URL`, a bare host name with no `https://`, so on a deployed site every `<loc>` would have been invalid. They now use `getServerSideURL()` (the same function the rest of the site uses).
  3. `pages-sitemap.xml` listed `/posts`, the stock blog index. Removed; `/news` is in the content sitemap.
- **Sample records.** A record whose source is on `sample.invalid` is left out of every sitemap, so a demo database never advertises invented pages.
- **Risks.** (1) The site is `noindex` for now (site layout), so this changes nothing for search engines until launch; robots.txt is written by `next-sitemap` after the build and was not run here. (2) Cached 300 s (no revalidation hooks on these types yet). (3) A real News story would also be reachable at `/posts/{slug}` until the main agent redirects it.
- **Tests.** Unit: address joining, escaping, last-change fallback, Sample and slugless records left out, coverage of every type. Integration: a published notice and news listed at their public addresses; a draft and a Sample record not listed; no `/posts/` in the News sitemap. Dev server: all three sitemaps return 200 and parse as XML with `http(s)` addresses.
- **Not run:** `next-sitemap` post-build (robots.txt), a production build, search-engine submission.
