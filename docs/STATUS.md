# Status

Updated: 2026-11-07 (Sat) PKT

| Phase | State | Gate |
| --- | --- | --- |
| P0 Decide and verify | Spike S-1 done; waiting on user inputs | G0 pending (see below) |
| P1 Foundation | Code done and checked locally; CI and live URL pending | G1 partly met, see `docs/evidence/G1/g1-report.md` |
| P2 Design system and shell (plan v2 section 11; the 2026-11-06 handoff mislabelled it "content model") | Landing built on branch `p2/landing` (not merged); awaiting user review | G2 pending (see below) |
| P3 CMS core, P4 content and real data, P5 to P8 | Not started | Addendum edits P3 to P5 (see below) |

## G0 checklist
- [x] Spike S-1 run, results in `docs/evidence/G0/spike-report.md`
- [x] `docs/tooling.md` with exact versions
- [x] ADR-0001 to 0003 accepted; ADR-0004 proposed
- [x] Data-gap list with owners (`docs/evidence/G0/data-gaps.md`)
- [x] Vercel: demo/presentation only, not for the real site (user, 2026-11-06). User states on 2026-11-07 that nobody makes money from it (Hobby non-commercial rule; user's statement, no document).
- [~] Stack not mandatory: user reports on 2026-11-07 that the DCST confirmed it. No written confirmation seen; the addendum (section 16) asks for it in writing, together with crawl and watcher permission. Treat as reported, not evidenced.
- [ ] Spike items not run: per-version access, preview, R2/Blob, Vercel/Neon, Node 24/26, Next 16.4.x (P1 or after accounts exist)
- [x] Push to GitHub works (2026-11-06)

## G1 checklist
- [x] App skeleton in `apps/web`: Payload on Postgres, EN/UR localization, migrations, env validation
- [x] `/healthz` and `/readyz` (200 and 503 both observed)
- [x] Typecheck, lint, 6 tests, production build pass locally; fresh clone green in 25 s (warm store)
- [x] CI green on GitHub (run 42212230542, commit 38cd496: install, typecheck, lint, migrate, tests, build)
- [ ] Docker path (`ops/`) run: no Docker daemon in the sandbox
- [x] Neon project `uswat-website` (shiny-pine-02268194, Singapore) and Vercel project `uswat-website` created; env vars set; migration applied by the Vercel build (ADR-0005)
- [x] Skeleton URL live (2026-11-07): https://uswat-website.vercel.app. `/healthz` 200, `/readyz` 200 with database ok, `/` 200 (still the stock Payload template page). Needed Node 24.x in the Vercel project settings; Node 26.x gave platform 404s on every app route. Checked through the Vercel connector only. Deployment Protection (Vercel login) is ON, so the public cannot open it yet: turn it off before judges or a presentation (user decision).
- [ ] Not run: P1-a (Neon cold-start timing), Playwright, Docker path, a check from an anonymous browser.

## P2 landing checklist (branch `p2/landing`, built 2026-11-07)
- [x] Landing page `/` from the mockup under the `swat-homepage-nextjs` skill: top bar, header and dropdown nav, hero carousel, stats, Vice Chancellor message, admissions banner, portals, notices/jobs/tenders, news and events, footer; EN and a draft UR/RTL toggle. ADR-0006.
- [x] Typecheck, production build, 19 token contrast tests pass; lint 13 warnings, 0 errors (unchanged).
- [x] Playwright (local production build, local throwaway Postgres): no horizontal overflow at 1440, 1024, 768, 390, 360 (LTR) and 1440, 390 (RTL); axe clean at 1440 and 390; no console errors; counters, dropdown and keyboard use, search overlay, carousel controls, mobile drawer, hover pop, newsletter (503 without a provider, 422 on bad input) behave as specified by scripted checks.
- [ ] Not run: the same checks against the Vercel deployment (Deployment Protection is on); `next dev` hydration check; a full manual keyboard-only pass; 2560 and 1920 px; print stylesheet; broken-image fallback test; real-device check.
- [ ] `tests/unit/env.unit.spec.ts` fails without a `.env` (pre-existing, needs env vars; not a regression).
- Round 2 (2026-11-07, user feedback after seeing the preview): tighter spacing and a compact hero (page height 3600 to 3012 px at 1440), stats card with icon beside number and label in Inter lining figures, small hero controls, solid dimmer gold hover ring (`--gold-dim`), top bar and header sticky together so the tagline is always visible (also in the logo on phones), and the "Sample" note under the stats removed because the user confirmed the figures (recorded in `content/stats.ts` as confirmed by the project owner, no document seen). Re-run after the change: typecheck, 19 contrast tests, lint 13 warnings, axe clean at 1440 and 390, no overflow 1440/1024/768/390/360, RTL ok.
- Round 3 (2026-11-08): the hero headline is now the tagline and is static (the user read the rotating hero text as the tagline). Only background photos rotate, and only once two or more real photos are set in `content/images.ts`; until then no slideshow controls. Header nav tightened so it fits inside the 1200 px container (it spilled past it at 1280 to 1440 px) and collapses to the menu button below 1280 px. Checked locally (axe clean 1440/390, no overflow); not yet checked on the Vercel preview.
- Round 4 (2026-11-08, section by section, header first): official crest from the university Drive folder (`crest_1254x1254.png`, owner confirmed permission) used as `public/images/crest.png` (256 px circular crop; the 2.4 MB original stays out of the repo); header 56 px tall; About moved to the end of the menu; logo line is now "Established 2010" (source: public home page, crawled 2026-11-06) because the tagline is in the top bar and hero; menu spacing uniform (4 px gaps) and exactly inside the container at 1280 to 1920 px; dropdowns now fade, have a 12 px hover bridge and a 220 ms grace period (they used to vanish when the pointer crossed the gap). Local checks: hover travel test, axe clean 1440/390, no overflow. Drive downloads that exceed the chat limit are saved to a file by the connector, so photos can be pulled into the repo that way.
- Placeholders on screen: hero and news photographs (Google Drive has them; commit selected files to `apps/web/public/images/` and set `src` in `src/site/content/images.ts`), statistics (labelled Sample), address (Odigram vs Charbagh unresolved, labelled Sample), Privacy and Terms (no routes yet).
- Admissions banner shows the closed state because the mockup deadline (30 Sep 2026, unverified) has passed. Set a real deadline in `src/site/content/admissions.ts` to reopen it.
- Urdu strings are a machine draft; a native speaker must review. Untranslated English inside the RTL page keeps its own direction.
- Newsletter has no provider; the route returns 503 on purpose.
- Gate G2: contrast passes (done), keyboard test (scripted only), user approves screenshots (pending).

## Inputs received 2026-11-07
- `Swat_Plan_v2_Addendum_Templates_Architecture_Challenges.md` (project doc). Where it disagrees with v2, it wins; section 17 lists the edits. Read before P3 to P5.
- `uswat_text.zip` (raw crawl, kept OUT of the repo): 406 page folders (`page.json`, `page.txt`), `sitemap.csv` (406 rows), `errors.csv` (5 dead links), `index.json`, `assets_index.json` (image URLs only, no image files), `navigation.json` (11 items), `design_tokens.json` (old site styling: maroon links, Arial/Roboto; differs from the mockup palette in plan 5.x). Inspected as data: no path traversal, no instruction-like text, emails mostly `uswat.edu.pk` (6 personal gmail/yahoo), 92 phone strings.
- NOT in the zip: the organized pack the addendum's importer reads (`departments.json`, `faculty.json`, `route_map.csv` with 1,613 rows, etc.) and the 1254x1254 crest. P4 needs them.
- Decision needed before P4: the addendum puts crawl data in `/scripts/import/data/` of this public repo. That would publish staff emails and phone numbers. Keep data out of the repo, or commit only a scrubbed subset.

## Next step
1. User: review the landing (screenshots or a preview deployment of `p2/landing`), then say go for G2 and the merge to `main` (merging redeploys the demo site).
2. User: commit the real photographs and a high-resolution crest; confirm the address; get Urdu reviewed.
3. User: turn Vercel Deployment Protection off before judges; rotate the Neon password; optional: narrow `engines.node` to `^24`.
4. Then milestone C (apply the design to template routes, remove Geist) and P3 (CMS core). Still needed: written DCST confirmation, the organized data pack, and a decision on keeping crawl data out of the public repo.
