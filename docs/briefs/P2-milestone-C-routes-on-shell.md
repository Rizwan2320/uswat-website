# Brief P2 milestone C, step 2: template routes on the site shell, Geist removed

Branch `p2/templates` (after the kit, `11b8f93`). Date 2026-11-09. Plan v2 sections 5 and 11 (P2); gate G2.

## Objective
Every public page uses one header, footer, font set and palette. Today `/` and `/design` use the `(site)` shell, while `/[slug]`, `/posts`, `/posts/[slug]`, `/search` and the 404 page use the stock template shell (Geist fonts, dark mode, Tailwind reset, its own header and footer).

## Paths touched (main-agent lane)
- Moved into `src/app/(site)/(cms)/`: `[slug]`, `posts`, `search` (URLs do not change; route groups are invisible).
- New: `src/design/cms.css` (Tailwind utilities for the stock blocks, no reset, colours mapped to site tokens), `src/app/(site)/(cms)/layout.tsx`, `src/app/(site)/not-found.tsx`.
- Removed: `src/app/(frontend)/layout.tsx` and `globals.css` (route handlers stay in `(frontend)`), stock `Header/Component*` and `Header/Nav`, `Footer/Component.tsx`, `providers/Theme`, `providers/HeaderTheme`, the `geist` dependency, the per-page `page.client.tsx` files that only set the header theme.
- Not touched: `collections`, `globals` config (`Header/config.ts`, `Footer/config.ts`), `access`, `hooks`, `payload.config.ts`, migrations (P3 lane).

## Risks
1. Tailwind preflight would restyle the shell. Mitigation: import theme and utilities only; a small scoped base inside `@layer base` under `.cms`.
2. Unlayered `site.css` beats layered Tailwind rules. Wanted for `.container`; unwanted if a stock block relies on a utility the site also defines.
3. Stock blocks and heroes assumed a dark header and a theme switch; removing them may leave dead markup (`data-theme`, negative margins).
4. The demo database has no pages or posts, so rendering has to be checked with throwaway local content.
5. The admin bar for signed-in staff is dropped from public pages (Payload's own admin and live preview stay).

## Tests
- Existing: typecheck, lint, 21 contrast tests, kit e2e (4), unit and integration suites unchanged.
- New: e2e that `/posts`, `/search`, a seeded `/[slug]` and an unknown slug use the site header, footer and Inter/Playfair (no Geist in the network log); axe on those pages LTR and RTL; no horizontal overflow at 360, 768, 1280.

## Gate (slice)
Build passes; no `geist` in the lockfile or the built CSS; axe 0 violations on the migrated pages; screenshots of the migrated pages shown to the user. Anything not run is reported as "not run".
