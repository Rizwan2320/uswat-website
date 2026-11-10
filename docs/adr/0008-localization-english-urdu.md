# ADR-0008 English and Urdu: a client toggle for the shell now, CMS locales later

- Status: Accepted 2026-11-10 (describes what is built and verified; the CMS part is deliberately not built)
- Context: The site must work in English (left-to-right) and Urdu (right-to-left). The shell, landing page and kit are built. Almost all body copy is still English because no reviewed Urdu text exists; inventing Urdu would break the no-invented-facts rule. CMS content has no locale yet.
- Decision:
  1. **Shell language is a client choice** held in `I18nProvider` and written to `<html lang dir>`; the toggle is the `Eng | اردو` control. Chrome strings come from one dictionary through `<T>`, which wraps Urdu in `<span lang="ur">`. A string with no Urdu entry stays English; nothing is machine-translated.
  2. **Logical CSS everywhere** (`inline-start/end`, `margin-inline`, `text-align: start`); the few mirrored decorations use `[dir='rtl']` selectors. Directional icons flip with `scaleX(-1)` under `[dir='rtl']`.
  3. **Mixed-language text uses `unicode-bidi: plaintext`** on headings, paragraphs, list items, quotes, buttons and code (`design/site.css`), so an English paragraph on an Urdu page stays left-to-right and an Urdu one is right-to-left, each aligned from its own first strong character. Not applied to inline spans inside headings: an isolated span hides the strong character from the heading and flips its alignment (fault 1 in prediction P2-c). Rich text uses `dir="auto"` (`Prose`).
  4. **Typefaces:** Noto Nastaliq Urdu for Urdu strings only (by `lang`, not by `dir`), so English text on an RTL page keeps Playfair/Inter.
  5. **CMS content** gets real locales (`en`, `ur`) with a locale segment or cookie in P4, when there is reviewed Urdu to put in them. Until then CMS pages render in English with the shell in either direction.
- Alternatives considered: (a) Locale in the URL for the shell now (`/ur/...`): better for sharing and search engines but doubles every route before content exists. (b) A machine-translated Urdu draft: fast, but unreviewed Urdu on an official university site is worse than English. (c) Per-component `dir` handling: what the first pass did; it missed the global bidi cause.
- Evidence: prediction P2-c; `docs/evidence/G2/rtl-report.md`; `tests/e2e/visual.e2e.spec.ts` (baselines for 4 pages, 3 widths, both directions); `tests/e2e/drawer.e2e.spec.ts` (keyboard, both directions).
- Consequences: Urdu readers can use the whole shell today; the page text is English until the owner supplies reviewed Urdu. A shared link cannot carry the language (the choice is per browser). Search engines see English only.
- Cost of reversal: Low for the toggle; medium for moving to URL locales (routes and sitemaps).
- Reversal trigger: the owner wants Urdu pages indexed, or CMS Urdu content exists (P4).
- Owner: Lead (main agent). Review date: start of P4.
- Prediction: `docs/predictions.md` P2-c.
