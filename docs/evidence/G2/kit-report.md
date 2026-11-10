# G2 evidence: inner-page kit (branch p2/templates, 2026-11-09)

Run locally against a production build (`pnpm build`, `pnpm start`) with a throwaway Postgres. Not run against the Vercel preview.

| Check | Result |
| --- | --- |
| `pnpm exec tsc --noEmit`, eslint on `src/site`, `src/app/(site)` and the new spec | clean |
| `tests/e2e/kit.e2e.spec.ts` (4 tests: one h1 and current crumb; accordion Enter, arrows, Home, End; tabs arrows, Home, End, roving tabindex; pagination current page) | 4 passed |
| `tests/unit/tokens.contrast.unit.spec.ts` | 21 passed |
| axe (wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice) on `/design` at 1440, 768, 390 LTR and 1440, 390 RTL | 0 violations after fixing one (two nav landmarks with the same name; the demo breadcrumb now has its own label) |
| Horizontal overflow on `/design` at the five widths above | none |
| Console errors or warnings | none |
| Home page `/` axe at 1440 and 390, overflow at 1440, 1024, 768, 390, 360 | clean, none |

Found and fixed while checking: list bullets were missing in article text (global list reset); breadcrumb separators were misplaced in RTL (global `unicode-bidi: plaintext` on list items).

Still not run for G2: committed screenshot baselines at three widths in both directions; the same checks on the Vercel preview; a manual keyboard-only pass of the drawer; native-speaker Urdu review. The owner approved the landing design on 2026-11-09 (stated in chat).
