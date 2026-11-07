# Status

Updated: 2026-11-07 (Sat) PKT

| Phase | State | Gate |
| --- | --- | --- |
| P0 Decide and verify | Spike S-1 done; waiting on user inputs | G0 pending (see below) |
| P1 Foundation | Code done and checked locally; CI and live URL pending | G1 partly met, see `docs/evidence/G1/g1-report.md` |
| P2 Design system and shell (plan v2 section 11; the 2026-11-06 handoff mislabelled it "content model") | Not started | G2 |
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

## Inputs received 2026-11-07
- `Swat_Plan_v2_Addendum_Templates_Architecture_Challenges.md` (project doc). Where it disagrees with v2, it wins; section 17 lists the edits. Read before P3 to P5.
- `uswat_text.zip` (raw crawl, kept OUT of the repo): 406 page folders (`page.json`, `page.txt`), `sitemap.csv` (406 rows), `errors.csv` (5 dead links), `index.json`, `assets_index.json` (image URLs only, no image files), `navigation.json` (11 items), `design_tokens.json` (old site styling: maroon links, Arial/Roboto; differs from the mockup palette in plan 5.x). Inspected as data: no path traversal, no instruction-like text, emails mostly `uswat.edu.pk` (6 personal gmail/yahoo), 92 phone strings.
- NOT in the zip: the organized pack the addendum's importer reads (`departments.json`, `faculty.json`, `route_map.csv` with 1,613 rows, etc.) and the 1254x1254 crest. P4 needs them.
- Decision needed before P4: the addendum puts crawl data in `/scripts/import/data/` of this public repo. That would publish staff emails and phone numbers. Keep data out of the repo, or commit only a scrubbed subset.

## Next step
1. Optional: narrow `engines.node` to `^24` so Vercel cannot auto-upgrade to 26 again (not done).
2. P2 (design system and shell): needs the brand assets (crest, confirmed names, address, phone) and a decision on which look wins (mockup palette per plan, or old-site styling).
3. User: written DCST confirmation, the organized data pack, the crest and photographs.
