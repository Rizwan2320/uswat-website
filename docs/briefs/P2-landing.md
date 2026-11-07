# Brief: P2 landing page first (design system grown from T1)

Date: 2026-11-07. Decision (user): the mockup wins; this is a redesign, not a re-implementation of the old site. Build the landing page thoroughly, then apply the same design across the site and the CMS.

## Update 2026-11-07 (supersedes parts of this brief)
Built under the `swat-homepage-nextjs` skill and ADR-0006. Where this brief disagrees, the skill and ADR win:
- Pages live in the `(site)` route group; components in `apps/web/src/site/components`, typed content in `src/site/content`, getters in `src/site/lib`.
- Fonts: Playfair Display (headings), Inter (body), Noto Nastaliq Urdu (translated chrome only). Source Serif 4 is removed.
- The hero IS a carousel (4 slides, 6 s autoplay, pause on hover/focus/button, reduced-motion safe), per the skill.
- Tagline everywhere: "Aspiring for Quality Education with Relevance" (user, 2026-11-07).
- The Vice Chancellor photo is the user-supplied image (`public/images/vc-husnul-amin.png`). Other photographs are still placeholders.
- Tokens: three brand colours (ivory, forest, gold) plus tints; 19 contrast tests.

## Objective
Home page (T1) and the shell (utility bar, header, mobile drawer, footer) built from tokens and reusable components, in the mockup's look. The components and tokens built here are the design system for every later template (plan 5.4).

## Paths touched
- `apps/web/src/design/tokens.css` (single source of tokens; imported by `globals.css`)
- `apps/web/src/components/shell/*`, `apps/web/src/components/landing/*`, `apps/web/src/components/ds/*`
- `apps/web/src/content/landing.ts` (typed data with provenance; replaced by CMS reads in P3)
- `apps/web/src/app/(frontend)/layout.tsx`, `page.tsx`, `globals.css`
- `apps/web/tests/unit/tokens.contrast.spec.ts`
- Dependencies: `@fontsource-variable/source-serif-4`, `@fontsource-variable/inter` (self-hosted fonts; replace the `geist` package and any build-time font download).

## Decisions made here
- Tokens live in `apps/web` until a second consumer exists; `packages/tokens` is deferred (ADR-0003 allows it). The CSS file is the only source; a unit test reads it to check contrast pairs.
- Static hero (no carousel, no autoplay), per plan 5.4. The mockup's slide dots and arrows are cut.
- The mockup's campus photograph and Vice Chancellor portrait look generated and are NOT used. Photo slots show a labelled placeholder until real, rights-cleared photographs arrive.
- Light theme only for the public site.

## Data rules on screen
- Real, from the 2026-11-06 crawl, with source URL: tagline, Vice Chancellor name and message excerpt (message-2 page, signed Prof. Dr. Husnul Amin; the older page is signed by a former VC and is not used), portal links, social links, the latest news titles (month only, exact dates unknown).
- Everything else the mockup states carries a visible **Sample** badge: statistics, admissions deadline, job and tender rows, phone, general email, the "Striving for Academic Excellence" line, the Odigram address. Not found in the crawl.
- Open conflicts, unchanged: main campus address (Odigram in the mockup, Charbagh on 52 crawled pages), ORIC director, Chancellor wording.
- The mockup's admissions deadline (30 Sep 2026) has already passed; the banner must come from an admissions record with an expiry (addendum LIF-04).

## Risks
- Nastaliq Urdu changes heights (P2-a). Urdu and right-to-left render is milestone B, after the English landing; logical CSS is used from the start.
- Template pages (`[slug]`, posts, search) inherit the new shell and body colours; some template components may look off until their phase.

## Tests and gate
- Contrast test on every token pair in use (CI), typecheck, lint, existing unit tests.
- Playwright screenshots at 375, 768 and 1280 px, keyboard test of nav, drawer and skip link, axe on `/`. Anything not run is reported as not run.
- Gate G2 (plan 11): contrast passes; keyboard test passes; the user approves the shell and landing screenshots.

## Milestones
A. English landing and shell, responsive (this brief). B. Urdu and right-to-left render with fonts. C. Apply to template routes; D. CMS and admin theming (P3).
