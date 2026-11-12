# Design notes: the taste of the landing page

Approved by the owner on 2026-11-09 as the design going forward ("unless DCST asks for massive changes"). The landing page took about 26 rounds of section-by-section feedback; inner pages will not get that treatment, so they must follow these rules by default. Tokens: `src/design/tokens.css`. Shared utilities: `src/design/site.css`.

## Colour
- Three brand colours: ivory `#FCFAF4`, forest `#003B17`, gold `#F2B705`, plus tints and maroon `#7A1F26` for rules, quote marks and message text. Gold is an accent (buttons, wave, small marks), never a large fill or body text.
- Page background is ivory; section bands run `ivory -> ivory-deep -> ivory`. Cards are pure white.
- Every text and background pair in use is in `tests/unit/tokens.contrast.unit.spec.ts` (21 tests). Add a pair there when you add one.

## Type
- Playfair Display for headings and display text; Inter for body and UI; Noto Nastaliq Urdu only for translated text under `[dir=rtl]`.
- Section headings are centred with thin maroon rules either side (`.section-title`). Eyebrow labels are small forest pills with wide tracking.
- Long reading text may use the serif (the Vice Chancellor's full message does); UI text stays sans.

## Shape and depth
- Cards: white, 1px border `rgb(0 59 23 / .07)`, soft resting shadow `0 12px 16px -10px rgb(0 42 16 / .34), 0 3px 6px rgb(0 42 16 / .07)`. Use the `.pop` class for cards that may lift on hover (gold ring); the stats bar and other bars do **not** pop.
- Navigation is a flat, full-width white bar directly under the forest top bar, no gap. Dropdowns are small rounded panels with a notch, icons and two columns.
- Buttons are compact pills (about 40 px tall, 0.9 rem): gold for the main action, forest for secondary, outline for dark backgrounds. Hero buttons are slightly smaller. Do not enlarge them.

## Images
- Photos fade into the page with CSS masks (`mask-image` with `mask-composite: intersect`) instead of hard boxes. Mostly-white photos use `mix-blend-mode: multiply` so the white disappears into the ivory. Merge on every side that touches the page.
- A replaced image needs a new filename (the Next image optimizer caches by URL).
- Decorative images have empty alt text; real photos need real alt text.
- Never blur a photo into a dark bar (tried on the admissions bar and rejected).

## Layout
- One container, max 1200 px (`.container`); only backgrounds are full width. Tight vertical rhythm: use `--section-y`, keep headings close to the content above and below.
- Mobile first; no horizontal scroll at 360 px. Phone variants are slimmer (smaller name plate, stacked bars), not just scaled.

## Motion and behaviour
- Autoplay 7 s, pause button visible, never pause on mouse hover (it stalled the slideshow after a click); keyboard focus pause is cleared by a manual change. Respect `prefers-reduced-motion`.
- Counters count 1 to N in about 2 s and render the final value on the server.

## Right-to-left
- Use logical properties (`inline-start`, `margin-inline`). Mirror decorative images with `[dir=rtl] ... scaleX(-1)` only when the fade direction depends on it.

## Content rules on screen
- No invented facts. Anything unverified carries a visible **Sample** label or is left out.
- Tagline everywhere: "Aspiring for Quality Education with Relevance".

## Dark theme (2026-11-12)
Brief: `docs/briefs/dark-mode.md`. Rules for anyone writing CSS for the site:
- Use the role tokens in `tokens.css`, not the brand colours, for page surfaces, text, lines and accents: `--surface`, `--surface-alt`, `--surface-raised`, `--surface-card`, `--ink`, `--ink-hover`, `--text`, `--mark` (dates, rules, quote marks; maroon in light, gold in dark), `--cta` (the main button), `--sel` (selected tab, current page), `--fill` (icon circles, badges), `--hairline`, `--line-green`, `--line-input`, `--tint`, and `rgb(var(--line-rgb) / a)` and `rgb(var(--shadow-rgb) / a)` for tinted borders and shadows.
- Brand bands (top bar, hero, page header, footer, admissions banner, the VC name plate) keep `--forest*`, `--ivory` and `--gold` in both themes.
- Maroon never appears on a dark surface. If you need a coloured accent on dark, use `--mark`.
- A page-specific dark override is written twice, once under `:root[data-theme='dark']` and once inside `@media (prefers-color-scheme: dark)` with `:root:not([data-theme='light'])`. See `LeadershipMessage.module.css`.
- The CMS stock colour names in `cms.css` (`--background`, `--primary`, ...) point at the role tokens, so CMS pages follow the theme.
- Known gap, not caused by dark mode: in light mode the search box border (`--line-input`, #b4d0a9) is about 1.6:1 against white, below the 3:1 WCAG 2.2 asks for on control boundaries. Dark mode meets 3:1 and the test asserts it.
