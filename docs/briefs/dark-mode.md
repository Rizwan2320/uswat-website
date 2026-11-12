# Brief: dark mode for the public site

Date: 2026-11-12. Owner: main agent (design system lane: `src/design/**`, shell and kit components, `(site)/layout.tsx`). Requested by the project owner.

## Objective
Give the redesigned public pages (route group `(site)`, including the CMS-backed routes that use the same shell) a dark theme that follows the visitor's system setting and can be switched by hand from the top bar. Light mode must not change at all.

## Out of scope
- The Payload admin panel and the Tailwind pages outside `(site)`.
- The faculty portal (`(portal)`), which has its own lane.
- Navigation destinations (they keep pointing at the official site).

## Design
- **Role tokens.** Colours are named by what they do (`--surface`, `--surface-alt`, `--surface-raised`, `--ink`, `--accent`, `--cta`, `--fill`, `--line*`, `--shadow-rgb`, `--line-rgb`), not by what they are. Light values are the existing brand colours, so light pixels stay identical. Dark values are defined once under `[data-theme='dark']` and repeated in `@media (prefers-color-scheme: dark)` for `:root:not([data-theme='light'])`. A unit test fails if the two copies differ.
- **Brand bands stay green** (top bar, hero, page header, footer, admissions banner): they are already dark, so they keep `--forest*`, `--ivory` and `--gold`. The page behind them becomes near-black green.
- **Maroon rule (tokens.css):** maroon is for light surfaces. In dark mode, maroon accents become gold, and the maroon buttons become gold buttons with a forest label.
- **Choice and storage.** System setting by default. The toggle stores `light` or `dark` in `localStorage` (try/catch, works without it). No cookie, no server read, so pages stay static. This is the only thing the site stores; the language choice is still memory-only (ADR-0008) and is not changed.
- **No flash.** The existing inline script in `<head>` sets `data-theme` from storage before first paint.
- **Toggle.** A button in the top bar, `aria-pressed`, label translated (English and Urdu), 44 px target, both icons in the markup with CSS choosing the visible one so the server HTML does not depend on the stored choice.
- **Images.** The two multiply-blended leadership backdrops need a dark treatment; the crest and the Vice Chancellor cut-out already have transparent backgrounds.

## Paths touched
`src/design/tokens.css`, `src/design/site.css`, 18 module CSS files under `src/site/components/**`, `src/app/(site)/layout.tsx`, `src/app/(site)/design/**` (document the dark palette), `Footer.tsx`, `Hero.tsx`, `HeroCarousel.tsx` (inline colours), new `ThemeToggle.tsx`, `TopBar.tsx`, `src/site/content/i18n.ts`. Tests: `tests/unit/tokens.contrast.unit.spec.ts` (extended), `tests/unit/stray-colours.*`, new e2e for the toggle, new dark visual baselines.

## Risks
1. Light mode drifts while hard-coded colours move to tokens. Guard: the 24 existing visual baselines must pass untouched.
2. A dark pair fails WCAG 2.2 AA. Guard: the contrast test covers every dark pair, text and non-text.
3. Visual defects that tokens cannot fix (blended photos, inline SVG fills, shadows invisible on dark). Guard: screenshots of every template in dark, English and Urdu, looked at before the PR.
4. The two token copies drift. Guard: a unit test compares them.
5. First-paint flash. Guard: an e2e that loads with a stored `dark` choice and checks the page background before any script runs.

## Tests and gate
Typecheck, lint, unit and integration, build, the 24 light baselines unchanged, new dark baselines, toggle e2e (keyboard, persistence, system preference, no flash), RTL in dark. Gate: the owner looks at the dark screenshots and says yes; the main agent merges only after CI is green on the exact result.
