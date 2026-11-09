# ADR-0006 Landing in a `(site)` route group with its own root layout; self-hosted fonts

- Status: Accepted 2026-11-07
- Context: The user chose the mockup look (redesign, not re-implementation) and supplied the `swat-homepage-nextjs` skill. The Payload template pages in `(frontend)` use Tailwind, Geist and a different layout. The skill asks for Playfair Display, Inter and Noto Nastaliq Urdu, three brand colours, `.pop` hover cards and a language toggle that sets `<html lang dir>`.
- Decision: Build the redesigned pages in `apps/web/src/app/(site)` with their own root layout (own `<html>`), leaving `(frontend)` and `(payload)` untouched. `/` is served by `(site)/page.tsx` (ISR, 1 h). Tokens are plain `:root` custom properties (`src/design/tokens.css`) read by the contrast unit test. Fonts are self-hosted with `@fontsource-variable/*`, not `next/font/google`, so the build makes no network call.
- Alternatives considered: restyle `(frontend)` in place (couples the redesign to template components and Tailwind); `next/font/google` (build-time download, fails offline CI).
- Three-in, two-out: added `@fontsource-variable/playfair-display` and `@fontsource-variable/noto-nastaliq-urdu`; removed `@fontsource-variable/source-serif-4` and the `(frontend)/page.tsx` stock home page. The `geist` package and the Tailwind pages go when the design is applied to the template routes (milestone C).
- Evidence: production build passes; axe clean at 1440 and 390 px; no horizontal overflow at 1440, 1024, 768, 390 and 360 px in LTR, and at 1440 and 390 px in RTL (see `docs/STATUS.md`).
- Consequences: two root layouts until milestone C; template routes keep the old look until then; `/search` still renders in the old shell.
- Cost of reversal: Low to medium (move files back into `(frontend)`).
- Reversal trigger: the template routes are fully restyled, at which point merge the groups.
- Owner: user / Claude. Review date: end of milestone C.
- Prediction: P2-a in `docs/predictions.md`.
