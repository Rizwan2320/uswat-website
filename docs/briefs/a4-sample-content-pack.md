# Brief: Sample content pack for the end-to-end test, agent 4, 2026-11-18

Written by the main agent. Read first: `CLAUDE.md`, `docs/briefs/p4-seeds.md` (what exists), `docs/briefs/p4p5-agent4.md` (lanes), `docs/STATUS.md` (newest section).

## Owner decision (2026-11-18)
Real data will not be used for now because this is a competition. **Everything is dummy: names, numbers, emails, phone numbers, images.** The owner will test the CMS end to end only after the admin theme (P3 slice 3u) and this pack are installed. This replaces the wait for the data pack and the two news photos: drop those from your open items.

## Objective
Every public template, list, feed, the home sections, `/search` and the sitemap show something, and the CMS has enough in every state for an editor, an approver and an admin to walk through the real workflow. Everything is clearly Sample.

## What exists, what is missing
Exists (`scripts/import/seeds`): 3 faculty groups, 2 campuses, 4 offices, 10 people, 8 departments, 14 programmes, contact entries.
Missing: News posts, Notices, Events, Jobs, Tenders, Merit lists, article tags, a few static pages, home-section content, media (images and one placeholder PDF), and the third campus. `/campuses/[slug]` expects the slugs `main`, `sangota` and `women`; the seeds have two campuses, so check which slugs they use and fill the gap.

## Rules for dummy data (all binding)
1. Every row's `governance.source` is `https://sample.invalid/seed/<collection>/<slug>`, which is what shows the Sample pill on screen. A test fails if any seeded row lacks it.
2. Names are fictional. No real staff, officials, students or applicants. Existing convention: titles and names carry "Sample".
3. Emails only on `sample.invalid` (or `example.com` / `.test` where a form needs a valid shape). Phone numbers obviously fake (`000-0000000`). No real postal address.
4. Images are generated placeholders (neutral shapes with the word SAMPLE; no photographs, no real people, no logos you do not own). Every image has English and Urdu alt text. Attachments are one small generated placeholder PDF.
5. Numbers (counts, fees, dates) are invented and carry the Sample label. Do not copy a real figure from the university's site.
6. Urdu text is a draft and says so wherever it shows (ADR-0008).

## Spread of states (this is the point of the pack)
For each of News, Notices, Events, Jobs and Tenders include at least: published and current; published and **closed or past** (shows the closed state and drops out of "latest"); one with an attachment; one with a very long title; one in Urdu; and, **left unpublished on purpose**, two in draft and two in review, so the approver and editor have real work in the test. Events also need one in the future and one today. Add one item that is linked to a department and one to an office. Keep the existing rule that seeds publish through the real workflow (draft, review, approved, verified, published by a `platformAdmin` actor), except the deliberately unpublished ones.

## Install path (important constraint)
The sandbox cannot reach Neon over the network (DNS does not resolve), and `assertLocalDatabase` correctly refuses hosted databases. So:
- You build and run the pack **locally** (guard unchanged) and keep `pnpm seed:sample` idempotent (second run creates 0).
- Add `pnpm seed:export`: writes a **data-only SQL file** of the Sample rows and their versions, relations and locales, **excluding `users`, sessions, preferences, jobs and anything secret**, to a path outside the repo (print the path). The main agent installs it on the Neon `previews` branch through the database tool and the three test accounts separately. Do not commit the SQL file.
- Images: Payload stores the file on disk (`public/media`) and, on Vercel, that disk is read-only (see `docs/briefs/p3t-admin-theme-and-media.md`). Spike this and tell me what works on a **Vercel preview**, with a real request as evidence: (a) committed placeholder files under `public/` referenced by their static address, or (b) the storage adapter from slice 3t. My guess is (a) for seeded images and (b) for editor uploads. Write the guess in `docs/predictions.md` before you test it.

## Paths
`scripts/import/seeds/**`, `apps/web/scripts/seed-sample.ts`, `apps/web/scripts/seed-export.ts` (new), `apps/web/package.json` (two scripts), generated placeholder files under `apps/web/public/` only if the spike says so, tests, `docs/predictions.md`, `docs/STATUS.md`. Nothing under `src/collections`, `src/governance`, `src/migrations` (ask in a PR comment if a field is missing).

## Risks
1. Sample rows reaching production by accident. Production install is a separate owner approval; the export file name must say `previews`.
2. A real-looking number or name slipping in. The data-integrity test checks the prefix, hosts and source key; review the prose by eye as well.
3. Rows linked in the wrong order (a published page pointing at a draft). Keep the draft-link-then-publish order from the existing applier.
4. Home sections read published rows through a 300 s cache. After install, wait or revalidate before judging the home page.

## Tests and gate
Unit: integrity (every row has the Sample source key, hosts, no empty alt text, unique slugs, every reference resolves). Integration on local PostgreSQL: first run creates and publishes the expected set, second run creates 0 and adds no version rows; anonymous reads show only published rows; the unpublished ones are invisible publicly; feeds, sitemap and `/search` list only published, current rows; the export file loads into an empty migrated database and the row counts match. Gate: all of that run, results in `docs/STATUS.md`; anything not run says "not run" and why. Merge is the main agent's.
