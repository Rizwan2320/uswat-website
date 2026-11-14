# P3 slice 3q: delete a draft that was never published

**Branch:** `p3/delete-drafts-3q`, stacked on `p3/admin-e2e-ci-3o`. **Lane:** `src/governance` only (policy, access, hooks), plus tests and docs. **No schema change, no migration.**

## Why
The owner decided: an editor should be able to delete their own draft, because a draft is not a publication. Until now only platform admins and site managers could delete anything.

## Rule
- A draft that was never published: platform admin, site manager, an editor or approver of the owning office, and a contributor for a draft they created. Auditors never.
- Anything else (in review, approved, published, archived): platform admin; site manager unless High impact; the system for jobs. Nobody else.
- "Never published" means the stage is Draft **and** no saved version was ever published. The stage field alone is not trusted.

## What changed
`checkDelete` (policy) takes an `everPublished` flag. `governanceBeforeDelete` computes it from the record's `_status` and, if needed, from its saved versions. `governedDelete` (access) lets every signed-in role but the auditor reach the hook, which decides.

## Tests
Unit (policy, 66), integration (209 in the suite, including a published page that an editor cannot delete even when its stage field is forced back to Draft), and the browser test "editor: can delete their own empty draft, but a published page cannot be deleted". Prediction P3q-a records what I got wrong.

## Not done
The Payload screen still shows a Delete button to people whose delete will be refused. Access is the security; hiding the button is cosmetic and left for later.

## Three-in, two-out (rule 9)
Adds: one rule. Lets the team remove: the "ask an admin to delete my empty draft" request, and the contradiction between the editor guide and the code about drafts.
