# Brief: landing-page colour picker (green, yellow, maroon)

**Branch:** `feat/home-colours`, from `main`. **Owner request 2026-11-27:** a colour picker for the landing page only, to replace the green, the yellow and the maroon.

## Objective
Three pickers in Admin, Globals, Home page content, Colours. A colour left empty keeps the standard one. Only the landing page changes; every other page keeps the standard colours.

## Design
- Stored on the existing `home-content` global as `colours.green`, `colours.yellow`, `colours.maroon`: plain `#rrggbb` text (or empty). One migration (`20261127_021657_home_colours`, six nullable columns, reversible). CMS lane touched with one group and one validator; schema is not edited by anyone else in the open PRs (#171 has no migration).
- Picker: custom admin field `@/admin/ColourPicker` (browser colour chooser, a code box, "Use the standard colour"). Label and description are passed through `clientProps`.
- Derived shades (`governance/homePalette.ts`, pure): deep and soft green, light yellow, deep maroon, and the page-text colour follow the chosen base. Nothing is emitted for a family left empty.
- Landing page only: `app/(site)/page.tsx` renders `<style data-home-colours>:root{...}</style>`. React removes it when the visitor leaves the page, so other routes are untouched. It covers the top bar and footer while on the landing page.
- To make the overrides reach everything, literal brand `rgb()` values in site components (borders, shadows, backdrops, hover tints) became `color-mix(in srgb, var(--token) N%, transparent)`. Same pixels with the standard colours (visual baseline unchanged).

## Safety
1. Only exact `#rrggbb` reaches the page (`cleanHex`); anything else is ignored. No free text goes into the style block.
2. Readability: 14 reading pairs involving a changed family must keep WCAG AA (4.5:1), judged with the derived shades. A choice that fails cannot be published (clear message listing the pairs); drafts may be incomplete. The home page also ignores a failing choice defensively.
3. Drafts never show to visitors (same published-only read as the rest of the global).

## Not changed
- `themeColor` in `app/(site)/layout.tsx` (the mobile browser bar) stays standard green.
- Admin screens and other pages keep their colours. The ivory background is not editable.
- The 300 s cache bound if a refresh were missed; the tag refresh makes the normal case immediate.

## Tests and gate
Unit: `tests/unit/homePalette.unit.spec.ts`. Integration: publish refusals for pale green, dark yellow, pale maroon and bad codes; readable colours publish; the site getter returns published colours and never a draft. Typecheck, lint, unit, integration, build, visual baseline (12) unchanged.

## Decision 2026-11-27 (owner): no readability check
The owner said the colour choice must always work, with no check. The WCAG AA publish refusal (and the defensive ignore on the home page) is removed in `feat/home-colours-no-check`. What stays: only exact `#rrggbb` is accepted (a safety rule, not a design rule), and the derived shades. **Consequence, recorded on purpose:** with custom colours the landing page is no longer guaranteed to meet WCAG 2.2 AA contrast; the standard colours still do (tokens.contrast test). The owner chose this. The refused-case and defensive-ignore tests were replaced by one test that any colour publishes and is used.
