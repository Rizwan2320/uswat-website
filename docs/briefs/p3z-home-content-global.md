# P3 slice 3z: the `home-content` global (P3 side of the main agent's brief)

**Branch:** `p3/home-content-3z`, from `main`. **Source:** `docs/briefs/p3z-home-content.md` (main agent, owner request 2026-11-20: "the photos in slider should be changeable, also the statistics bar"). That brief names this slice P3z; my team-management slice was renamed 3hod to make room. **Lane:** `src/globals/HomeContent`, `src/governance` (pure rules, staff access), `src/migrations` (generated), tests, docs. **Schema change: one new global, one generated migration. No new dependency.** The site getters (`site/lib/content.ts`) and the sample pack are the main agent's and agent 4's.

## What I build
A global `home-content` ("Home page content"), with drafts and versions, holding:
- **`slides`**, 3 to 8 rows. Each: `image` (a Media item, required), `primary` and `secondary` (each: `label` required and translated, `href` required, `icon` optional from `cap`, `document`, `book`, `calendar`, `people`, `badge`, the names `hero.ts` already uses).
- **`stats`**, 3 to 6 rows. Each: `value` (number, 0 or more), `suffix` (short text, for example `+`), `label` (translated), `icon` (`cap`, `people`, `person`, `trophy`), `sample` (tick), `source` and `verifiedAt`.
- The headline and sub line are **not** fields (owner decision 2026-11-07).

## Rules (all checked at publish; drafts may be incomplete, as everywhere in the CMS)
1. **Who:** editors, approvers, site managers and platform admins can save drafts; **only approvers, site managers and platform admins publish** (same as Pages). Contributors and auditors cannot change it; auditors can read. A refused publish says why in plain words and writes nothing.
2. **Counts:** 3 to 8 slides, 3 to 6 statistics.
3. **Links:** a path starting with `/` (not `//`) or an `https://` address. `javascript:`, `data:`, `http://`, `mailto:` and the rest are refused. This is stricter than the attached-files rule on purpose (the brief says so). The 3y apply-link check is not merged, so I do not reuse it; both end at the same `isSafeHref` family.
4. **Pictures:** each slide's Media item must have alt text and a recorded rights status, by the same rule as every page (`mediaPublishProblem`, slice 3d). A missing picture row is refused.
5. **Statistics:** a statistic needs a `source` and a `verifiedAt` date **unless** `sample` is ticked (repo rule 3: a fact has a source and a date, or it is labelled Sample). The brief asked for the source only; I also require the date, because that is the repo rule.
6. **Audit:** every change is audited by the existing global hook (the plugin adds it to every global).
7. **Public refresh:** a global is not a governed collection, so slice 3w's hook does not cover it. A change refreshes the cache tag `global_home-content` (same family as `global_header`) and the home path `/`. **The tag name is the contract with the site getters:** the main agent reads the global through a cache that carries that tag. A draft save also refreshes (harmless and cheap); a failed refresh never blocks a save.

## Not doing
- No change to `site/lib/content.ts`, `hero.ts`, `stats.ts` or any component, no fallback code (the main agent's, brief item 3), no sample pack rows (agent 4).
- No crop-focus field (the code files carry an optional `focus`); easy to add later by migration if the owner wants per-photo crops. Reported, not built.
- No "verified, stale" workflow on this global: it is not a governed collection (no owner office, no review date). The roles above are the gate.

## Hosted use needs a Vercel Blob store
ADR-0014: until the owner creates the store and sets `BLOB_READ_WRITE_TOKEN`, uploads fail on Vercel. Not worked around. Uploads are tested locally; a hosted preview run is "not run".

## Risks
1. **A new global's read access.** Header and Footer are public to read. This one holds unpublished drafts, so a signed-out reader must only ever get the published version. Tested as an anonymous reader, an editor and an auditor.
2. **Drafts of a global** behave differently from collection drafts (one row, versions beside it). Predicted and tested: publish, then draft edit, the public still sees the published version.
3. **A generated `down` that fails.** Drilled up, down, up on a populated copy and an empty database.
4. **Urdu coverage test** will flag new labels; the dictionary gets draft lines (unreviewed, like the rest).

## Gate
Typecheck, lint, unit, integration (access matrix updated), build, no drift, migration drilled, admin screenshots in light mode at 1440 and 390 px (the brief's gate), refresh test. Hosted preview: not run (no Blob store).
