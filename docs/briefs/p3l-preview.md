# P3 slice 3l: preview reads use the viewer's own access

> **Update 2026-11-13:** the main agent applied the fix in PR #35 (`6797d49`) using the same `governance/preview.ts` and tests, and `main` now has it, so the leak is closed there. This slice's duplicate commit was dropped when the stack was rebased onto `main`. The handover patch described below was removed; what remains of 3l is the improved label guard and the four label fixes. The sections below are the record of what was found at the time.


**Branch:** `p3/preview-3l`, stacked on `p3/labels-3k`. **Plan refs:** CMS-01 (drafts, autosave, preview, restore), CMS-02 (roles), rule 5 (nothing private leaks).

## What I found
Preview already existed from the template (an eye button for Live Preview and an arrow button for Preview on Pages and Posts). I checked it with real requests before building anything, and it leaks:
- The public page route reads with `overrideAccess: draft`. Draft mode is only a browser cookie, so anyone holding the cookie sees the newest draft of **any** page.
- A **logged-out** request that still had the cookie saw the draft (the cookie outlives the login; an office PC that is shared would show drafts to the next person).
- A **Finance editor** who opened a preview link for a Registrar page saw the Registrar draft that the CMS would never let them read.
Both were predicted (P3l-a, P3l-b) and confirmed. The same code is in `posts/[slug]` as well as `[slug]`.

## What this PR adds (my lane only)
- `src/governance/preview.ts`: `previewReadOptions` (who the person is comes from the login on **this** request; draft mode only says "they asked for a preview"; never `overrideAccess`) and `findForPreview` (the newest draft the person may read, else the live page, so turning preview on never hides a page).
- `tests/int/preview.int.spec.ts`: 10 tests (public, stale cookie, bad token, owner editor, approver, auditor, another office, never-published page, contributor own vs someone else's). Mutation check: with the old behaviour put back, 5 of them fail.
- Guard test improved: it now also catches labels Payload makes from a field name ("Published At", "Related Posts", "Enable Link"), which my first version could not see. Four such labels fixed (`publishedAt` on pages and posts, `relatedPosts`, `enableLink`). This corrects an overstatement in PR #28: the guard did not detect unwritten labels until now.

## What this PR does NOT do (hand-over to the main agent)
The two lines that cause the leak are in `src/app/(site)/(cms)/[slug]/page.tsx` and `posts/[slug]/page.tsx`, which I must not edit. The fix is `docs/handover/p3l-preview-read.patch` (about 12 lines each: replace the `payload.find({... draft, overrideAccess: draft})` with `findForPreview(payload, 'pages', { slug, draftModeOn: draft, headers: await headers() })`). It applies cleanly to current `origin/main` once this branch has merged (it imports `@/governance/preview`). **Until the main agent applies it, the leak is still live on `main`.**
I applied it temporarily, rebuilt, ran the HTTP probe and a real-browser Live Preview check, then reverted it; it is not in this PR's commits.

## Findings, not fixed
- The admin's Preview link carries `PREVIEW_SECRET` in its address, visible to every signed-in staff member. With the patch the secret is no longer what protects drafts (per-page access is), but rotate it if it was ever shared.
- Notices, events, jobs and tenders have no preview: they have no public pages yet (main agent). The `generatePreviewPath` map also needs those routes.
- The admin menu still shows plugin collections ungrouped (Redirects, Forms, Search Results) and the Header and Footer globals; their wording was not audited (the guard skips plugin collections).
- Signed, expiring share links for non-staff reviewers (CMS-11) are a later phase.

## Tests
Typecheck, lint (0 errors), 379 tests on a freshly migrated empty database, `next build` and the 4 browser flows pass. **Not run:** the browser leak probe against `main` after the main agent applies the patch (it needs their change); Urdu; mobile.
