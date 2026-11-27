# Brief P3an: do the screens and the server agree?

**Objective.** Prove, for every role and stage, that the buttons a person sees are the ones the server will accept, and that the server does not allow useful things the screen hides without a reason.

**Paths touched (apps/web).** `tests/unit/uiServerMatrix.unit.spec.ts` (new), `tests/unit/governanceControls.unit.spec.ts` (new), `tests/int/media.auditorAccess.int.spec.ts` (new), `src/governance/fields.ts` (one override).

**What the matrix does.** 8 roles x 5 kinds of page x 5 stages x verified or not x 3 authors x 2 risk classes = 2,400 cases. For each, `workflowView` (the screen) says what is offered; `evaluateSave` (the server's check) says what happens when it is pressed. Fails if a visible button is refused for a role reason, or if the server allows something the screen hides and it is not on the written list of reasons.

**What it cannot see.** Controls Payload draws itself. The browser found one: Payload's Unpublish control showed to every role on every live page, and the server refuses it for most. It is now replaced (`UnpublishButton` override); the status box already offers Take offline to exactly the people allowed it.

**Risks.** The list of hidden-on-purpose cases is a decision record; adding to it needs the owner's reasoning. Branch is based on the combined scratch branch (`p3/combined-check-3aj-3al`) because #135, #136, #138 and #140 are not merged yet; rebase after they are.

**Schema.** No change.

**Gate.** Unit and integration tests, typecheck, lint, three deliberate breaks caught, browser check as head, coordinator and admin.
