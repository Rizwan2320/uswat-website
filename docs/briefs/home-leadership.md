# Brief: Vice Chancellor's message from the CMS, and a fixed look for its window (landing page, step 3)

**Branch:** `feat/home-leadership`. **Owner request 2026-11-27:** the Vice Chancellor's section must be controlled from the admin, and the text in the "Read Full Message" window must be plain: a simple font and black, written in the code so nothing can change it.

## Objective
- Admin, Globals, Home page content gains **Vice Chancellor's message**: name, title, the opening shown on the page, the full message (one paragraph per row, up to 40) and the closing words. A field left empty keeps the standard (sourced) text, as for the other parts.
- The window opened by "Read Full Message" uses Arial (system sans), 16 px, plain black for the title, the message, the closing words and the name. The values are written out in `LeadershipDialog.module.css`, not read from the colour variables, so the landing page's colour picker cannot reach them. The on-page section is unchanged.

## Paths
- CMS lane (one migration, `20261127_130022_home_leadership`, additive and reversible: 1 table and 4 columns on each of the main and versions tables): `globals/HomeContent/index.ts`, `i18n/urWords.ts`.
- Main lane: `site/home/homeMap.ts` (`toLeadership`), `site/lib/content.ts` (`getLeadership`), `components/LeadershipDialog.module.css`.

## Rules
- Only the published version reaches visitors; drafts never do.
- Paragraphs the editor writes count as the complete message, so the "read the rest on the university website" line is not shown for them.
- The message is stored once, not per language. The home page reads the default language only, and the window sets the message in English (`lang="en"`) until a reviewed Urdu text exists. Per-language storage would need a later migration.
- The photograph stays in the code for now (an upload needs the hosted Blob store, ADR-0014).
- Source and `verifiedAt` of the sourced file stay in `content/leadership.ts`. What an editor enters in the admin is the university's own text and carries no source line; the admin's version history records who changed it.

## Tests and gate
Unit (`toLeadership`): nothing entered keeps the file, only filled fields replace, paragraphs in order with empty ones dropped. Integration: the getter returns the published message and never the draft; clearing the fields returns the standard text. Urdu coverage for the new labels. Typecheck, lint, integration tests, build, 12 visual checks (the window is not in the baseline, so it is also looked at once by hand).
