# Brief P3z: home slider and statistics editable in the CMS (main agent, 2026-11-20)

Owner request (2026-11-20): "the photos in slider should be changeable, also the statistics bar".
Today both are code files (`apps/web/src/site/content/hero.ts` `heroSlides`, `stats.ts`), read through the async getters in
`site/lib/content.ts`. The types file already says the CMS can replace the data files with no component change. This slice does that.

## Owner (lead) decisions
1. **Schema work is P3's.** One new global `home-content` and one migration (with a working down step). No other collection changes.
2. **The headline and the sub line stay fixed** (owner decision 2026-11-07, "sticky, not changing"). Only the slides and the statistics are editable.
3. **Fallback, not a rewrite.** If the global has no published version, or a read fails, the home page uses today's code files exactly as now. Production has no record at first, so its home page must look identical until someone publishes.
4. **Prerequisite for real use on the hosted site: a Vercel Blob store** (ADR-0014, no store exists yet; creating one is an owner action). Until then uploads fail on Vercel. Do not work around it; test uploads locally and on a preview only after the token exists, otherwise write "not run".

## Shape (P3 may refine; write an ADR if it differs)
- `slides`: array, 3 to 8 items. Each: `image` (relation to Media, required), `primary` and `secondary` (each: `label` required, `href` required, `icon` select from the existing icon names). Alt text comes from the Media record and is required to publish (existing needs-alt rule). Urdu labels localised.
- `stats`: array, 3 to 6 items. Each: `value` (number, 0 or more), `suffix` (short text), `label` (localised), `icon` (select: cap, people, person, trophy), `source` (text, required unless `sample` is ticked), `verifiedAt` (date), `sample` (checkbox).
- `href` rule: a path starting with `/`, or an `https://` address. Reject `javascript:`, `data:` and anything else (reuse the unsafe-address check from the programme apply link, slice 3y, if merged).
- Drafts and publishing follow the same roles as Pages (editor drafts, approver and platform admin publish). Audit log entry on every change. Public refresh on publish: the revalidation hook of slice 3w covers governed collections only, so a global needs its own call (tags for the home page); test it.
- Order of slides is the array order. Each slide shows its photograph and its two buttons together, as today.

## Agent split
- P3: global, access, migration, admin screen (label the fields in plain words, help text on image size and alt), Urdu labels, tests, drill.
- Agent 5 (public site): `lib/content.ts` getters read the global with the fallback above; no visual change when it is empty. The 12 visual baselines must pass unchanged on an empty database.
- Agent 4: Sample pack gets 6 slides (generated placeholder images under `public/sample-media/`, labelled Sample) and 4 statistics (`sample: true`, fictional numbers) for the preview database only. Real photos and the real numbers stay in the code files for production.

## Gate
Predictions in `docs/predictions.md` before any run (migration up and down on a scratch database; publish then home refresh; unsafe address rejected; empty global falls back). Typecheck, lint, tests, type drift, build, visual baselines, admin screenshots in light mode at 1440 and 390 px including a crop of the top bar. Preview run: edit a statistic as an editor, publish as an admin, see it on the home page, say how long it took. Anything not run: write "not run" and why.

## Not in this slice
Hero headline, sub line, the Vice Chancellor's message, admissions banner, portals block, header and footer menus and footer contacts (separate slices if the owner asks).
