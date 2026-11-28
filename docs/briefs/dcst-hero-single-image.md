# DCST hero: one photograph, no slider (2026-11-28, prediction A4-z21)

**Objective.** The owner sent a picture of how the top of the DCST department page should look and said: remove the slider, take just one image. Build that layout: a dark green hero with the department title as real text on the left, the line "Learn, Develop, Innovate", two buttons, ONE photograph on the right that fades into the green, and the statistics in a strip that overlaps the bottom of the hero.

**Paths touched.** `apps/web/src/site/academics/` (`blocks.tsx` a new `HeroBanner`, `RichDepartmentPage.tsx`, `types.ts` a new optional `heroImage`, `Academics.module.css`, `profiles/dcst.ts`), `apps/web/public/images/academics/dcst-hero-main.webp` (new), tests, docs.

**Decisions.**
- The owner's picture is a mock-up with its words baked in (4 Programs, 4,500+ Students, 5 Research Centers, 4 Ranked Programs). Those numbers are not in any source and "4 programmes" is wrong for DCST (five), so the picture is NOT used whole. Only its photograph (the laptop, right side) is cropped out and used; the title, buttons and statistics are real text. The statistics are the ones the page already had.
- The crop is small (about 360 x 246 px, enlarged 4x), so it is soft. It stands in until the original photograph is supplied; replacing the file `dcst-hero-main.webp` is the only change needed.
- Only the DCST department page changes (opt-in through `heroImage`). The other departments keep their banner. The five DCST programme pages keep their banner and its photo rotation, because the owner asked about the DCST page.
- Three in, two out: one new component in; out go the rotating banner band, the separate green card and the separate statistics row on this page (three blocks become one) and no new dependency.

**Risks.** Text contrast over the photograph (axe); the strip overlapping the hero on phones; the DCST page losing its crumbs or its section menu.

**Tests.** tsc, eslint, unit suite, axe/overflow/broken-image at 1440, 1024, 390 on `/academics/departments/dcst` and the other pages that use the same components (Physics department, BS Computer Science), screenshots.

**Gate.** The lead merges after the owner has seen the screenshots.
