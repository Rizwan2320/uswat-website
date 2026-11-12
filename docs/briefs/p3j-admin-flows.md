# P3 slice 3j: the admin in a real browser

**Branch:** `p3/admin-flows-3j`, stacked on `p3/rest-access-3i`. **Plan refs:** CMS-15 task flows, CMS-01, the open "Playwright admin flows" item.

## What happened
I opened the notice create page in a real browser as an editor. It was blank, and the server log showed `OWNER_OUT_OF_SCOPE`. Drafts autosave, so the admin creates the draft the moment the page opens, with no owner office; an editor may only create for their own office, so the first save was refused. Every integration test had passed because none of them used the browser, and the earlier browser tests only used a platform admin, who has no office limit. Any editor or approver would have hit this on the first click.

## Fix
`Owner office` now defaults to the first office of the person creating the record (`governance/fields.ts`). A person with several offices can change it. A person with no office still cannot create (by design). Test: `governance.defaults.int.spec.ts`.

## New: browser flows (not in CI yet)
`tests/e2e/editor-flows.e2e.spec.ts`, 4 flows in Chromium against a production build: write a notice and send it for review, approve and publish it as an approver (found on their dashboard), upload an image (refused without alt text, then saved with rights `unknown`), edit a live page (public text unchanged, draft changed), schedule publish and expiry dates. The spec imports no application code; setup is `tests/e2e/support/setup.ts` run with the Payload CLI (see `docs/runbook.md`). `next/cache` cannot be imported by Playwright's own loader, which is why.

## Findings for the usability test (not fixed)
- Editors and contributors see the blue **Publish changes** button; pressing it is refused with a clear message. Hiding it needs a custom admin component.
- Pages and notices autosave; the guide wrongly said "Save draft". Corrected.
- Owner office shows lower-case (offices are stored lower-case).
- A person with several offices gets the first one as the default.

## Results
4 e2e flows pass; 366 integration and unit tests pass on an empty database; typecheck, lint (0 errors) and `next build` pass. **Not run:** e2e in CI, Urdu admin, mobile layout, the CMS-15 usability test with real staff, the schedule actually firing (date entry only).
