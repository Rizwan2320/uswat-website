# Brief: agent 4 start-up (P4 content and real data, P5 public site), step 0

Date: 2026-11-12. Written by agent 4. Docs only: no code, no migration, no data change, no seed step.

## Objective
Get real, sourced content into the CMS (P4) and serve it through templates T1 to T9 in English and Urdu (P5), inside the lane in `docs/briefs/p4p5-agent4.md`. This PR does step 0 only: read the brief and the documents it lists, record predictions before any drill, and say plainly what blocks the work.

## Paths touched
- `docs/briefs/p4-startup.md` (this file)
- `docs/predictions.md` (rows A4-a to A4-f, appended)
- `docs/STATUS.md` (own section at the end, appended)

Nothing under `apps/web`, `scripts/import/data/` or `src/migrations/`.

## Risks
- Reading the route map before writing predictions: I counted its rows by collection, template and address shape first (read-only, public paths, counts only). Predictions A4-a to A4-f are about things I had not measured; the facts I did measure are listed below as findings, not predicted.
- Treating the preview database as separated before the main agent has confirmed it. Not a risk in this PR (no data changes), recorded so later PRs keep the rule.

## Tests
None: docs only. Not run: typecheck, lint, test:int, build (no code changed).

## Gate for this PR
Brief and predictions are on the branch before any drill; STATUS names every blocker with who must supply it.

## What I read (all on `main` at a318f03)
`CLAUDE.md`; `docs/briefs/p4p5-agent4.md`; `docs/briefs/P3-coordination.md` (including the 2026-11-12 notice); `docs/STATUS.md`; `docs/predictions.md`; ADR 0008, 0010, 0011, 0012; `docs/design-notes.md`; `docs/briefs/p4-redirects.md`; `src/site/lib/content.ts`; `src/governance/lifecycle.ts`; the collection and revalidation hooks on `main`; the plan v2 and Addendum text supplied with the session (plan sections 0 to 9, 11, 4; Addendum sections 3 to 9, 17). Not read in depth yet: ADR 0005 (the preview database split; its update is on `main` as 9414103), `docs/plan/official-data-raw-2026-11-05.md`.

## Findings that change the work (counts and addresses only)
1. **Data pack absent.** Not in this session's uploads, not in the repo. The importer can only be built against invented fixtures labelled Sample until the owner supplies it.
2. **Organisation collections not on `main`.** Departments, Programmes, Offices, People and Campuses arrive with PR #7 (slice 3e). Its base is `p3/post-types-3d` (already merged) and it is not retargeted or rebased. The article-type collections (Posts as News, Notices, Events, Jobs, Tenders, MeritLists, AffiliatedColleges, ContactDirectory, ArticleTags) are on `main`.
3. **Cache revalidation exists only for Pages, Posts, Header, Footer and Redirects.** The post types and organisation collections have no `afterChange` hook, and the lifecycle sweep deliberately revalidates nothing. These hooks live in the P3 lane (`src/collections/**`, `src/hooks/**`, `src/governance/**`).
4. **Route map defects (my lane, but they move public addresses, so I will not change them without the main agent):**
   - 32 News rows have an old address of the form `/YYYY/MM/DD/slug/`. The day was read as the slug: both `old_slug` and the proposed address end in two digits (for example `/news/29/`). They map to 21 distinct targets; 6 targets are shared by 17 rows, so 11 articles would merge into others. The real slug is the last segment of the old address, so the fix is mechanical (1,198 other dated rows already have target slug equal to `old_slug`).
   - 15 rows for what look like WordPress date-archive pages (`/2026/`, `/2026/11/`, `/2026/page/N/`) are classed Pages and "migrate", with root-level targets such as `/2026-page-10`. They belong with the 150 generated-listing rows (301 to the news listing).
   - The 33 "hold as draft" rows (26 near-empty, 7 empty shell) redirect to targets that will answer 404. Addendum section 9 says held and duplicate pages `301` to the nearest parent. Recommendation: do that; the main agent and the owner decide.
   - The 5 dead links stay 410 (ADR-0012), as decided.
5. **Rendering conflict to watch:** 86 Pages and the generic `/{slug}` route share a namespace with single-segment targets; section landings must take precedence in routing. To check when T2 is built.

## Plan after step 0 (small PRs, `p4/<topic>` or `p5/<topic>`)
1. `p4/importer`: ADR 0009, importer core (dry run by default, local database only, keyed by `legacyUrl`, `origin: import`, skipped-records report with a reason per skip, contact details withheld), invented Sample fixtures, tests. Pack path from `SWAT_IMPORT_PACK_DIR` (name proposed; the pack stays out of the repo).
2. `p4/seeds`: register-only seeds. Waits for #7 on `main`.
3. `p5/listings-articles` (T6, T5), then `p5/departments-programmes` (T3, T4, T7, T8), then section landings, utility pages and home (T2, T9, T1), then search, sitemap, robots, metadata and the language switch, then evidence.
4. Route-map corrections go in their own PR, only after the main agent agrees the new addresses.

## What I need (also in STATUS)
- Owner: the organized data pack; the answer on the 33 held rows; written DCST confirmation (Sample labels stay until then).
- Main agent: confirm the preview database reads the new Neon branch (until then I push no migration or seed step); agree the route-map corrections.
- P3 agent (via PR comment on #7 or a new one): rebase #7 onto `main`; revalidation hooks for the post types and organisation collections with tags `item:{type}:{id}` and `list:{type}`; whether the lifecycle sweep should revalidate list tags when it archives.

## ADR numbers
Mine: 0009 and 0013 to 0019. None used yet.
