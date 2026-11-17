# Brief: landing page fonts and News & Events layout

Date: 2026-11-12. Main agent (design system and shell lane). Requested by the owner.

**Objective.** (1) Headings Playfair Display, navigation Poppins, body Lato. (2) Smaller text on the header "Apply Online" button. (3) News & Events as in the owner's mockup: first card one item ("Latest News"), second card two items, events card three items, with the same gap above "View All News & Events".
**Paths.** `src/app/(site)/layout.tsx`, `src/design/{site,tokens}.css`, `NavMenu`, `MobileDrawer`, `TopBar`, `Header`, `FeedCards`, `PortalsGrid`, `NewsEvents` (css and tsx), `src/site/content/events.ts`, `package.json`, ADR 0025, visual baselines.
**Risks.** Poppins is wider than Inter, so the nav bar may not fit at 1280 to 1440 px; Lato has no 500 or 600 weight (they render as 400 or 700); Urdu must not change; the third event is not read from the page; screenshot baselines change on purpose.
**Tests.** Typecheck, lint, unit, build, screenshots at 1440, 1280 and 390 (English and Urdu), baselines updated and reviewed, nav-fit e2e.
**Gate.** Owner looks at the preview; main agent merges after CI is green on the exact result.

## Round 2 (2026-11-13)
**Objective.** One shared height for the three News & Events cards (a little shorter than the first card was); second card with no gap between its rows, filled with a third story; events card the same height as the news cards with the "View All" gap kept, filled with a fourth event.
**Paths.** `NewsEvents` (css and tsx), `content/news.ts`, `content/events.ts`, home baselines.
**Risks.** Four events and three stories in 360 px may clip at 1024; the new wording is inferred from addresses; stories without a photo need a tile that is not a story photo.
**Tests.** Measure card heights at 1440, 1024 and 390; screenshots; typecheck, lint, unit; home baselines.
**Gate.** Owner looks at the preview.
