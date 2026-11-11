# G2 evidence: right-to-left pass, baselines, keyboard and colour guard (branch p2/g2-closeout, 2026-11-10)

ADR-0008, brief `docs/briefs/P2-g2-closeout.md`, prediction P2-c (actuals recorded there). Run locally on a production build with a throwaway Postgres holding clearly labelled test content. Not run against a Vercel preview.

## What was rendered
Landing, `/design`, `/posts` and the 404 at 1440, 1024 and 390 px, left-to-right and right-to-left; the nav dropdowns open in Urdu; the VC message window; the search overlay; the mobile drawer with a section open.

## Faults found and fixed (6, five root causes)
| # | Fault | Cause | Fix |
| --- | --- | --- | --- |
| 1 | Urdu headings sat at the left edge (VC title, footer column titles) | `unicode-bidi: plaintext` also applied to spans inside headings; an isolated span hides its strong character from the heading, so the line resolved as LTR | removed the span selector from the rule (`design/site.css`) |
| 2 | Footer phone note broke its parentheses: `(Office of the Vice` / `Chancellor)` | neutral characters took the RTL base direction | wrapped in `<bdi>` (`Footer.tsx`) |
| 3 | VC message window set English text in the Nastaliq face, with cramped word spacing | the window used `[dir='rtl']` instead of language to choose the face | rule removed; body marked `lang="en"` (`LeadershipDialog`) |
| 4 | `/design` swatches showed `FFD84D#` and `gold-light--` | Latin tokens and hex values inside an RTL line | `unicode-bidi: plaintext` on the swatch labels |
| 5 | Article text: bullets and quote rule on the right, English text on the left | block took the page direction while its text was English | `dir="auto"` on `Prose` |
| 6 | Accordion questions put `?` at the start | punctuation at a direction boundary | `unicode-bidi: plaintext` on the heading text in RTL |

Also measured: no horizontal overflow at any width or direction; the header Apply button grows 36 to 40 px in Nastaliq (+11%); the landing page is 1.5% taller in Urdu; nothing clipped. Directional arrows and chevrons flip; the nav dropdown stays inside the viewport with its notch under the trigger.

Screenshots (after the fixes): `docs/evidence/G2/rtl/`.

## New checks
| Check | Result |
| --- | --- |
| `tests/e2e/drawer.e2e.spec.ts` (open with Enter, focus moves in, Tab and Shift+Tab never reach the page behind, accordion with Enter and Space, Escape closes and returns focus, body scroll locked; LTR and RTL) | 10 passed |
| `tests/e2e/visual.e2e.spec.ts`: 4 pages x 3 widths x 2 directions, `pnpm test:visual` | 24 baselines written; re-run twice without updating: 24 passed, 24 passed |
| `tests/unit/stray-colours.unit.spec.ts` (runs in CI with `test:int`) | passes; proved to fail when a stray `#123abc` was added, then reverted. 5 legacy colours recorded in `stray-colours.allow.json`; the list can only shrink |
| `pnpm test:int` (unit plus P3 governance) | 167 passed |
| `tsc --noEmit`, `pnpm lint` | clean; 0 errors, 18 warnings (the extra five are unused-argument warnings in the merged P3 migrations, not in changed files) |
| drawer + kit + shell e2e together on the final build | 22 passed (10 drawer, 12 kit and shell). A first attempt failed because the local server and database had stopped, not because of the code; restarted and re-run |

## Not run, and limits
- Native-speaker Urdu review. Most body text is still English, so how real Urdu paragraphs set (line length, spacing, Nastaliq clipping) is unknown.
- The baselines are tied to this machine's fonts and are kept out of the default e2e run and out of CI. They need regenerating in the environment that will check them, then a review of the diff.
- Baselines contain test content ("LOCAL TEST" posts), not real content.
- Keyboard: the drawer, accordion, tabs and navigation are covered. Screen-reader announcement is not tested.
- Vercel preview of this branch.
- The VC message window's position in RTL was inspected in one screenshot at 1440 only.
