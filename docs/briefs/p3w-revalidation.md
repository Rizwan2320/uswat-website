# P3 slice 3w: the public site refreshes when governed content changes

**Branch:** `p3/revalidation-3w`, from `main`. **Lane:** `src/plugins`, `payload.config` (plugin list), tests, docs. **No schema change, no new dependency.** Source: the main agent's request in `docs/STATUS.md` ("[BLOCKED] Revalidation hooks (P3 lane, ask only)"): decide and answer in the PR.

## Problem
On `main` only Pages, Posts, Header, Footer and Redirects refresh the public site when they change. Notices, Events, Jobs, Tenders, MeritLists, ContactDirectory, AffiliatedColleges and the organisation collections do not, so a published notice can take up to 5 minutes to appear (the lists are cached 300 s) and an archived one can stay in a list for as long. The main agent's pages read these lists under the tags `list:{type}` (and `item:{type}:{id}` for one record).

## Decision (my answer to the question)
1. **One generic hook, added by a plugin to every collection that has the `governance` group** (so a new governed collection gets it without anyone remembering). `afterChange` and `afterDelete` refresh `list:{type}` and `item:{type}:{id}`.
2. **Only when it matters:** when the record is live now or was live before this save (an unpublish and a delete of a live record count; a draft autosave does not). A collection with no draft stage counts as always live.
3. **Names:** `{type}` is the collection slug, except posts, which the site calls `news` (the site's `TYPES` map).
4. **The lifecycle sweep needs no code of its own.** It archives and publishes through the Local API, which runs these hooks, so an archived record leaves the cached lists at once. I check this with a test rather than assume it. The 300 s time bound stays as the safety net.
5. A failed refresh must never fail a save: the call is wrapped, logs a warning and carries on. `context.disableRevalidate` (used by the importer, seeds and tests) switches it off, as for Pages and Posts.
6. Pages and the globals keep their own path-based hooks; the generic hook adds the list tag to them too (harmless).

## Not doing
No change to how the site reads or caches (main agent). No change to the revalidate time bound.

## Risks
1. A tag name that does not match what a page reads (then nothing refreshes and nothing says so). Mitigation: a test asserts every tag the site code uses has a collection that emits it (`list:` tags found in `src/site`).
2. The hook firing in a context without a Next request (a script): wrapped, so it only warns.

## Gate
Typecheck, lint, unit, integration, build, drift check (`migrate:create` finds nothing).
