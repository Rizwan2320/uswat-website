# P3 slice 3ak: one press to publish, and one way to move a page

**Branch:** `p3/one-click-publish-3ak`, on `main`. **Lane:** `src/admin/workflow` (WorkflowBar, rules, new StageField), `src/governance/fields.ts` (Stage field component), tests, docs. No schema change. It touches `rules.ts`, as #135 (3aj) and #136 (3ai) do in other places; if they merge first, `rules.ts` and `docs/predictions.md` need a trivial merge.

## Why
- The owner asked that a head of department, who needs no review, should not have to press Verify, Approve and Publish separately. (Owner, 2026-11-22.)
- The Stage box let anyone move a page by hand, so there were two ways to do each step. It is the part of "same screen for every role" that was still ambiguous.

## What changed
1. **"Approve and publish"**: one button for the owner of the page: the platform admin on their own draft, a head of department on a department page or a programme page they started. It marks the facts verified, approves and publishes, each through the same save as the separate buttons, so the policy decides every step. A head looking at a coordinator's unsent programme draft keeps separate steps, so a coordinator's work is never published by accident.
2. **It checks "Source of the facts" first** and says what to fill in. Found in the browser check: with the source empty the page was left Approved but not published and nothing said why. If the publish is refused for another reason the banner says it was not published and to read the message.
3. **The Stage box is read-only for everyone except the platform admin**, with a line saying to use the buttons above. The buttons still set it from the form state. The server rules are unchanged, so this is a screen change only; nothing here lets anyone do more.

## Not done
- **Archive and Restore buttons.** The server wants a publishing-style save for them (NEEDS_PUBLISH_ACTION), so they need their own work.
- Accessibility check (axe) on the status box and the Stage box.
- An automated browser test for the one-press button; it was checked by hand in a browser (three runs), recorded in `docs/predictions.md` (P3ak-a).
