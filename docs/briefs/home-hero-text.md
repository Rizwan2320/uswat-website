# Brief: the headline text from the CMS (landing page, step 4)

**Branch:** `feat/home-hero-text`. **Owner request 2026-11-28:** go on to the next parts of the landing page. This reverses the 2026-11-07 decision that the headline and the sentence under it are fixed; the owner now wants the whole landing page editable.

## Objective
Admin, Globals, Home page content gains **Headline text**: the small line above the headline, the headline in three lines plus a highlighted (gold) word, and the sentence under it. A field left empty keeps the standard words, as for the other parts.

## Paths
- CMS lane (one migration, `20261128_061635_home_hero_text`, additive and reversible: 6 columns on each of the main and versions tables): `globals/HomeContent/index.ts`, `i18n/urWords.ts`.
- Main lane: `site/home/homeMap.ts` (`toHeroContent`), `site/lib/content.ts` (`getHero`), `site/content/hero.ts` (comment only).

## Rules
- Only the published version reaches visitors; drafts never do.
- The headline always has three lines, and the third carries the highlighted word. An empty field keeps its standard part, so a headline is changed piece by piece. A headline of two lines is not possible from the admin.
- `site.tagline` (page title and search text) is not changed by this group. The guard in `content/hero.ts` that the file headline spells the tagline still holds for the standard words. If the headline is changed in the admin, the tagline in the page metadata stays as it is until it is changed in the Site settings step.
- Stored once, not per language; the home page reads the default language only (as the statistics do).

## Tests and gate
Unit (`toHeroContent`): nothing entered keeps the file, only filled parts replace, the third line is built from its words and the highlighted word. Integration: the getter returns the published words and never the draft; clearing returns the standard words. Urdu coverage for the new labels. Typecheck, lint, integration tests, build, 12 visual checks (default look unchanged).
