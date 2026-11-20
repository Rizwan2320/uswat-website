# FP-14 results: one-click CV on sample data (FP-20)

Date 2026-11-20. Branch `fp/cv-sample` (stacked on `fp/courses-sample`, PR #84). Predictions FP14-a, FP14-b.

## What was built
- `/portal/cv`: two layouts, University and a generic HEC-style layout. Print or save as PDF uses the browser (tagged PDF). `/portal/cv/word` serves the same content as a `.doc` that Word opens; it says on screen that it is not a native `.docx`.
- The CV is built from the signed-in account only (profile draft, claimed publications, courses). Pending, rejected and duplicate works are left out. The email is shown only if the profile marks it Public.
- Each section has a trust note (set by the university, entered by you, or claimed by you) because department verification (FP-03) is not built. The cover note says parts are not yet verified.
- No new dependency. The HEC-style layout is labelled "not the official HEC form. Sample layout only." on screen, in the PDF and in the Word file.

## What was run
- Unit (`tests/unit/portal/cv.unit.spec.ts`, 14 tests): email visibility matrix, ordering, date in UTC, trust labels, Sample flag, empty sections, both layouts carry the same facts, layout allow-list, hostile text escaped, Urdu tagged `lang=ur dir=rtl`, one h1 and labelled sections, Word file shape, and the Word markup identical to the page markup for both layouts across full, empty, hostile and public-email inputs.
- Integration (real PostgreSQL 16, local): 1 new test in `tests/int/identity/identity.int.spec.ts`: a CV holds the account's claimed works and courses and never pending, rejected, duplicate or another account's records. 86 of 86 in the file; 420 of 420 across identity and portal unit and integration tests.
- Mutation checks: 6 on `build.ts` and `CvDocument.tsx` (email rule, publication order, course order, trust label, layout switch, Sample label) plus the time zone (run under `TZ=Asia/Karachi`): all caught. 2 on `data.ts` (include pending works, wrong account for courses): both caught by a real test failure (the first attempt looked caught only because the database was down; redone against a passing baseline of 86). 5 on the Word renderer (unescaped title, no apostrophe escaping, empty email row, wrong trust note, wrong layout condition): 4 caught at once; 1 was equivalent (courses and bio share the same trust level) and the repeat with the publications level was caught.
- Browser (`scripts/cv-run.mjs`, Chromium with a virtual authenticator, production build): 21 of 21 (`results/cv-run.json`): signed-out redirect; Word route answers 401 with no CV content when signed out; one h1; Sample label; default layout; claimed works newest first with pending and rejected absent; courses newest first; email hidden then shown after the profile is set to Public; trust notes on every section; HEC layout with numbered works and a table with column headers; unknown layout value falls back; Word file headers (200, `application/msword`, attachment `cv-hec.doc`, no-store, nosniff) and body; 400 for an unknown layout; download link saves `cv-hec.doc`; PDFs from the print view are tagged, text extractable, hide the banner, header and tools, and run 1 page (university) and 2 pages (HEC-style); no sideways scroll at 390 px in both layouts; a second account sees only its own works, courses and Word file; empty account shows "No claimed publications yet." and "No courses listed yet."
- Screenshots in `shots/` (`cv-university.png`, `cv-hec.png`, and both at 390 px); PDFs in `pdf/`.

## Defects found
- Next.js refuses `react-dom/server` in a route handler (and its Node entry point is unavailable there). The Word file is now written by a small string renderer, kept identical to the page by a unit test.
- Two h1 elements on the page (page title and the CV's name): found before the run, the tools heading is now an h2.
- The Download for Word link was underlined and taller than the Print button at 390 px (found in a screenshot): fixed with `a.portal-btn`.
- One check of my own was wrong (R6) and was corrected.

## Not run, and why
- A real `.docx`: needs a library or hand-built package; Word-readable HTML is enough for the competition tier and is labelled as such.
- The official HEC proforma: not available to me; the HEC-style layout is generic.
- Opening the `.doc` in Word itself: no Word here. The file is checked as HTML only.
- A screen reader, real devices, https, the PDF in other browsers, a CV with 200 or more works (page count beyond the two sample cases).
- Real People data: the profile comes from the sample store until P3's People fields exist.

## Not invented
No institutional facts are shipped. The designation, department and Urdu name are sample values labelled Sample on screen.
