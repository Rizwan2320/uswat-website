# Brief: home page sections from the CMS (T1), agent 4, 2026-11-18

- **Objective.** Notices, jobs, tenders, news and events on the home page come from published CMS records when there are any, through the seam the home page already has (`site/lib/content.ts`). Where the CMS has none for a section, the sourced items in `content/*.ts` stay, so the page never goes blank.
- **Paths touched.** `site/home/` (new: `map.ts` pure mapping, `cms.ts` reads), `site/lib/content.ts` (three getters), `site/components/NewsEvents.tsx` and `.module.css` (see risk 1), `app/(site)/page.tsx` (`revalidate` 3600 to 300), tests, docs. No collection, migration, token or route-map change.
- **Reads.** The same cached list reads as the list pages (`listArticles`, 300 s, tag `list:{type}`), so the home page and the lists cannot disagree. A failed read falls back to the sourced items.
- **Risks.**
  1. The first news card always showed the NIIBS photo, whatever the story. A CMS story with that photo would be wrong, so a story with no photo of its own now shows the crest on a cream tile (no alt text: it is not a picture of the story); the NIIBS story keeps its photo. This edits the main agent's component.
  2. "View all" under News & Events points at `/news` when the news come from the CMS, and at the old site's category while the sourced fallback is showing.
  3. The home page refreshes every 5 minutes instead of hourly, the same bound as the CMS lists (post types still have no revalidation hooks).
- **Not here.** The Events link in the top block and the "Upcoming Events" heading link still point at the old site. Feed items carry no provenance line (the lists read no `verifiedAt`). Sample label on the home page: none (home shows only published records; a Sample record would be a local or demo database matter).
- **Tests.** Unit: mapping, fallback, merge. Integration: a newly published news item is first, a published notice appears and a draft one never, a published event keeps its venue. Browser: home at 1440, 1024 and 390 px, both directions, axe at 1440 and 390 px.
