# P3 slice 3aj: the coordinator publishes what the head approved

**Branch:** `p3/coordinator-publishes-3aj`, stacked on `p3/academic-scope-3ah` (#134). **Lane:** `src/governance/policy.ts`, `src/admin/workflow/rules.ts` (screen mirrors policy), tests, docs. No schema change, no migration.

## Owner request (2026-11-22)
The head of department (HOD) writes the department page and publishes it without review. A programme coordinator writes a draft and sends it to the HOD; when the HOD approves and verifies it, the Publish button on the coordinator's screen becomes clickable and **the coordinator publishes**.

## Decisions
1. **One new step for one kind of person.** `mayPublishApproved(actor, target)`: a coordinator (an Editor with programmes) may take `approved > published` on a programme in their own list. Nothing else: never approve, verify, send back, archive or take offline. Those stay with the head (reviewer).
2. **The step is checked in `checkTransition`**, so the server enforces it whichever way the save arrives; the screen (`rules.ts`) only mirrors it.
3. **The coordinator publishes exactly what the head approved.** If the publishing save also changes content, it is refused with `PUBLISH_CHANGED_CONTENT` (400): without this a coordinator could add text in the same click and publish it unreviewed. Tested by removing the guard and watching the test fail.
4. **Verification is still the head's.** Publishing needs Fact-check = Verified (VER-01). If the head approved but has not verified, the coordinator's screen says so and shows no Publish; the server answers `NOT_VERIFIED`.
5. **Editing after approval** already sends the page back to Draft (existing rule); the coordinator must send it to the head again. A draft cannot jump to Published at all.
6. **Not changed:** an Editor with an office and no programmes, a contributor, a coordinator on a sibling programme or on the department page: none can publish. The department page stays the head's.

## Open questions left to the owner
- After a page is live, should a coordinator be able to take it offline? Default: no (head only).
