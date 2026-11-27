# FP-19 evidence: publications intake

Date 2026-11-27. Branch `fp/publications-intake`. Scratch PostgreSQL (port 5544, database `fp19`), Sample account `ayesha.sample@example.invalid`, local `next dev` on port 3040. Nothing touched the live portal, the university site or Odoo.

- Script: `scripts/publications-run.mjs` (Chromium, virtual passkey). Results: `results/publications-run.json` (24 of 24 pass). Screens: `shots/`. Export files from the run: `results/export-publications.*`.
- Not run: the DOI lookup success path and the OpenAlex source against the real services (no outbound access here). Both are covered by hand-written fixtures only.
- Defects the run found and fixed: only the first wrong box was reported on the add form; the "Edit details" row was 24 px tall at 390 px.
- Harness notes: the dev overlay's "1 issue" badge is a hydration warning caused by Playwright adding `caret-color` to inputs; it is not in the page code.
