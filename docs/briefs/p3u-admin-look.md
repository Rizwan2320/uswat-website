# P3 slice 3u: the admin looks like the website

**Branch:** `p3/admin-theme-3u`, from `main`. Source: `docs/briefs/p3t-admin-theme-and-media.md` (main agent). **Lane:** `src/app/(payload)/custom.scss`, `src/components/BeforeLogin`, `src/admin/**`, `admin.components.graphics`, `admin.meta` in `payload.config.ts`, tests. **Not touched:** `src/design/**`, `src/app/(site)/**`, `next.config.ts`, the public pages. No schema change, no migration, no new dependency (the four font packages are already installed for the site).

## Objective
`/admin` reads as part of the same website: the same type families (Playfair Display headings, Poppins for buttons and navigation, Lato for body text), the same brand colours (forest green, ivory, gold; maroon only as a small accent on light surfaces), and the university name and crest on the login page, the dashboard header and the browser tab.

## How
1. **Values come from `src/design/tokens.css`**, imported into the admin styles. No hex code is copied. If a token is missing I ask in the PR instead of adding it (that folder is the main agent's).
2. **Fonts** are the site's four self-hosted fontsource packages, loaded by CSS imports in the admin styles (no Google, no new font). The Urdu face is loaded the same way the site loads it, so the Urdu admin keeps its typeface.
3. **Payload's own CSS variables are overridden** (page, text, borders, primary button, focus ring, links) in light mode. Dark mode keeps Payload's dark surfaces and takes only the fonts and the gold accent, because the website has no dark theme (#30 on hold).
4. **Four documented slots** carry the identity: the logo and icon graphics (crest and name), the login message (`BeforeLogin`, replacing the stock template text), and `admin.meta` (tab title and icon).
5. Payload's internals are not forked. Where a rule would fight the framework I leave it and say so in the PR.

## Must keep working
Urdu admin (right to left, no sideways scroll: the two Urdu browser tests), Payload's light and dark themes (contrast in both), keyboard focus rings, the editor dashboard and the Operations panel, and all existing browser tests. The public pages must not change: the visual baselines must still pass unchanged.

## Risks
1. A rule that lowers contrast or hides a focus ring (checked with axe in both themes on four screens).
2. Importing the tokens pulls site-only rules into the admin (the file is plain `:root` variables, so I expect not).
3. Fonts add page weight to the admin (measured).
4. Urdu right to left regressing.

## Gate
Typecheck, lint, unit, integration, build, all browser tests, axe with 0 serious or critical on login, dashboard, a list and an edit screen in light and dark, and screenshots of those four screens at 1440 px and 390 px in both themes, kept in `docs/evidence/3u-admin-look/`.
