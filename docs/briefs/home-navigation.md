# Brief: the navigation menu from the CMS (landing page, step 6)

**Branch:** `feat/home-navigation`. **Owner request 2026-11-28:** be able to add more menu items, remove existing ones, reshuffle their positions, and change the colour.

## Objective
Admin, Globals, Home page content gains **Navigation menu**:
- **Menu items:** a list you can add to, delete from and drag to reorder. Each item has a text, an address, a "Hide the Explore All row" tick, and its own **sub-links** (the dropdown), each with a text, an address and an icon (22 to choose from).
- **Colours:** the bar colour, the menu text colour (words, icons, lines, hover shades are worked out from it), and the highlight colour (the line under the current page). No readability check, as for the landing page colours (owner decision 2026-11-27).
- **Apply button:** its text and where it goes.
Nothing entered keeps the standard menu, colours and button, pixel for pixel.

## How it behaves
- The list in the admin **is** the whole menu once it has one complete item; the standard menu is only the fallback. Removing an item removes it; moving a row moves it. 3 to 12 items, up to 12 sub-links each.
- One list feeds the desktop bar, the dropdowns and the phone drawer, so they cannot disagree.
- An address that does not start with `/` is marked external (opens as a plain link). A row needs a text and an address that passes `isSafeHref`; the admin refuses a bad one at publish and the page ignores it as well.
- Colours are style variables on the header only (`--nav-bg`, `--nav-text`, `--nav-hover`, `--nav-hover-strong`, `--nav-accent`); a colour left empty emits nothing. The phone drawer keeps its own look.
- The header is in the shared layout, so a change shows on every page.

## Paths
- CMS lane (one migration, `home_navigation`, additive and reversible: 5 columns on each of the main and versions tables, four tables for items and sub-links): `globals/HomeContent/index.ts`, `governance/homeContent.ts`, `i18n/urWords.ts`.
- Main lane: `site/home/homeMap.ts` (`toNav`, `toApply`, `navStyle`), `site/lib/content.ts` (`getNav`, `getNavBar`), `components/Header.tsx`, `components/Header.module.css`, `components/NavMenu.module.css`.

## Known limits
- A link typed to a page that does not exist on this site opens the site's not-found page. The test that checks the standard menu against the real routes still covers the file menu only; the admin cannot check a typed address against the routes.
- Sub-link and item texts are stored once, not translated. Standard items keep their Urdu words; new ones show their English text in Urdu mode.
- Stored once, not per language; the standard `Explore All` wording is unchanged.

## Tests and gate
Unit: order, removal, fallback, sub-links, icons, external marking, Apply button, colours (none, invalid, valid). Integration: the getters return the published menu, order and colours and never the draft; clearing returns the standard menu; publishing refuses a `javascript:` item or sub-link, an `ftp:` sub-link, 2 or 13 items, a colour that is not a code and a bad Apply address. Urdu coverage for the 35 new strings. Typecheck, lint, integration tests, build, 12 visual checks (default look unchanged).
