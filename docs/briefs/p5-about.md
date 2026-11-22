# Brief: About pages, agent 4 (P4 content, P5 templates), 2026-11-22

Owner request (2026-11-22): "check drive, there is an about pages html file I guess, and go ahead". Read first: `CLAUDE.md`, `docs/STATUS.md`, `docs/briefs/p5-research-administration.md`.

## Objective
`/about` (landing in the DCST style) and `/about/vice-chancellors-message`, built from the register copies on the owner's Drive (folders `about-university`, `vice-chancellors-message`, `vice-chancellors-message-2`, read 2026-11-22, crawled 2026-11-06 from https://uswat.edu.pk/about-university/ and https://uswat.edu.pk/vice-chancellors-message-2/).

## Facts rule
Only what the register copies say, each page with its source URL and `verifiedAt` 2026-11-06 (the crawl day). The About text has four objectives cut off mid-sentence in the copy: they are not shown and are listed under "Still to be confirmed". The old message by Prof. Dr. Hassan Sher (`vice-chancellors-message`) is superseded by the current one (Prof. Dr. Husnul Amin; his appointment is a news item in the register, October 2026) and is not shown. The two Affiliated Colleges copies hold only programme lists with no college names, so no Affiliated Colleges page is built: reported as a gap.

## Paths touched
NEW `apps/web/src/site/about/` (data, templates), NEW routes `(cms)/about/page.tsx` and `(cms)/about/vice-chancellors-message/page.tsx`, `site/organisation/routes.tsx`, `site/sitemap/entries.ts`, route-map reserved list (test), banners and hero chips in `public/images/offices/`, scripts `make-office-banners.mjs`, `make-academic-art.mjs`.

## Risks
Static `/about` shadows the seeded Sample About Pages record (same as Research/Administration). Old `/about-university/` stays a Pages address in the route map. Menus still point to the old site (owner go-ahead needed).

## Tests and gate
tsc, eslint, all unit tests, page loads at 1440/1024/390 and RTL 390 (overflow, axe, broken images). Not run: production build, e2e, pack integrity (#94), preview (blocked by the shared previews database migration). Gate: lead review of PR #116.
