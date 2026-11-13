# ADR-0025 Fonts: Playfair Display, Poppins, Lato

- Status: accepted (owner request, 2026-11-12)
- Context: the owner wants headings in Playfair Display, navigation in Poppins and body text in Lato. The site had Playfair Display (headings) and Inter (everything else).
- Decision: add `@fontsource/poppins` (500, 600) and `@fontsource/lato` (400, 400 italic, 700); remove `@fontsource-variable/inter`. A new role `--stack-nav` carries Poppins. Every h1 to h4 uses the serif stack by default. Urdu text is unchanged (Noto Nastaliq Urdu on `lang="ur"`).
- Alternatives considered: `next/font/google` (needs the Google font servers at build time, which the build environment cannot reach). Variable Lato does not exist; the static files are small.
- Evidence: build and screenshots in the PR.
- Consequences: three-in, two-out is met as one in, one out plus the Inter token and its `system-ui` first fallback rewritten; Lato has no 500 or 600, so those weights draw as 400 and 700. Two extra font families download on the home page (latin subsets only, about 15 KB each).
- Cost of reversal: low (two imports and two variables).
- Reversal trigger: the owner changes the typography or the page weight budget is exceeded.
- Owner: main agent. Review date: with the next design pass.
- Prediction: docs/predictions.md row L-1.
