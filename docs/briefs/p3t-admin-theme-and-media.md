# Brief: P3 slices 3t (media storage) and 3u (admin look and feel), 2026-11-18

Written by the main agent for the P3 agent. Read first: `CLAUDE.md`, `docs/STATUS.md` (newest section), `docs/briefs/P3-coordination.md`, `docs/briefs/p3p-urdu-admin.md`, `src/design/tokens.css`.

## Why now
The owner will test the CMS end to end only after (1) the admin looks like the website and (2) Sample content is installed. Real data is not coming: for the competition everything is dummy and labelled Sample. Testing is on the Neon `previews` branch first. These two slices are what stand between us and that test.

## Slice 3t: images must survive (do this first)
- **Finding (by reading code, not run):** `src/collections/Media.ts` sets `upload.staticDir` to `public/media` and no storage adapter is configured (`grep` finds no `storage-*` package or plugin). On Vercel the deployed filesystem is read-only, so an editor's image upload will fail or vanish. I could not confirm by running it: production has no users yet.
- **Objective:** an image uploaded in the admin on a Vercel deployment is still there after the next request and the next deploy, and the public pages can show it.
- **Proposal, not a decision:** Payload's Vercel Blob storage adapter, with `BLOB_READ_WRITE_TOKEN`. It needs a Blob store created by the owner or the main agent and the token set in Vercel by the main agent. **Do not create stores, set variables or commit tokens.** Write an ADR (CLAUDE.md rule 9: name two things it lets us remove, or justify it) and ask in your PR before adding the dependency. If you find a way with no new dependency, say so.
- **Paths:** `src/collections/Media.ts`, `src/plugins/index.ts`, `payload.config.ts`, `docs/adr/`, tests. A schema change is not expected; if one appears, stop and say so.
- **Also decide and write down:** how local development and CI keep working without a token (local disk when the variable is unset), and what happens to files already in `public/media`.

## Slice 3u: admin look and feel
- **Objective:** `/admin` looks like part of the same website: same type families (Playfair Display headings, Poppins buttons and navigation, Lato body), same brand colours (forest green, ivory, gold; maroon for small accents on light surfaces), the university name and crest on the login page, the dashboard header and the browser tab.
- **Source of truth:** read the values from `src/design/tokens.css`; do not copy hex codes into the admin styles. If a token is missing, ask in a PR comment: `src/design/**` is the main agent's lane (rule 8).
- **Paths (P3 lane):** `src/app/(payload)/custom.scss`, `src/components/BeforeLogin`, `src/admin/**`, `src/components/Logo` or Payload's `admin.components.graphics`, `admin.meta` in `payload.config.ts`, tests. Not `src/design/**`, `src/app/(site)/**`, `next.config.ts`.
- **Approach:** override Payload's CSS variables and the few components Payload documents as replaceable (logo, icon, login message, dashboard). Do not fork Payload's internals. Where a rule would fight the framework, say what you left alone.
- **Must keep working:** Urdu admin (the `lang="ur"` rule and its two browser tests), the Payload light and dark admin themes (contrast must hold in both), keyboard focus rings, the editor dashboard (CMS-09), and the 16 existing browser tests.
- **Fonts:** load them the way the public site does (`next/font`), not from a third-party stylesheet link. Do not add a font that is not already on the site.

## Predict first (rule 2)
Write predictions in `docs/predictions.md` before running anything: for example, whether the Blob adapter changes any generated type or migration (I expect no migration), and how many existing tests touch the media path.

## Risks
1. A theme rule that hides a focus ring or lowers contrast. Check both themes with axe.
2. A storage change that breaks `payload generate:types` or the import map. Run the drift check.
3. Urdu right-to-left regressing (the 10,793 px sideways-scroll bug in 3p came from editor menus). Keep the two Urdu tests.
4. Scope creep into the public site. The public pages must not change: the 12 home and style-guide visual baselines must still pass unchanged.

## Gate
Typecheck, lint, unit, integration, `generate:types` drift check, build, all browser tests (existing 16 plus any new). Screenshots of login, dashboard, a list and an edit screen at 1440 px and 390 px, in light and dark, attached to the PR. Axe: 0 serious or critical on those four screens. Image upload on a Vercel preview: **run it and show the evidence, or write "not run" and why**. Merge is the main agent's.

## Not in this brief
Public dark mode (#30 stays on hold). More Urdu translation. Any change to roles, access rules or the schema other than the storage adapter's own fields.
