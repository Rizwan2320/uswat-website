# P3 slice 3ac: the send-back note is enforced on the server, not only on the screen

**Branch:** `p3/review-note-server-3ac`, from `main` (after the main agent's 3aa phases 1 and 2). **Lane:** `src/governance/fields.ts`, `src/governance/hooks.ts`, tests, docs. **Schema change: none** (a length limit on a text column does not change the database). **No new dependency.**

## Why
The main agent's Send back stores the reviewer's reason in `governance.reviewNote` and clears it in the browser when the editor sends the item again. Two things hold only because the browser behaves:
1. **Anyone who can save can write the note.** An editor can PATCH `governance.reviewNote` with any text over REST, so a "message from the reviewer" can be forged. The banner shows it as the reviewer's words.
2. **A stale note survives anything that is not the Send for review button.** Approving through the Stage list, an importer move, or a script leaves the old note on the record.
(I built the same screen in parallel on a branch that was never pushed; main's version is the one in use, so only this server-side part is carried over.)

## Decision
1. Field access: only a platform admin, site manager or approver (and the system actor) can write `governance.reviewNote`. For anyone else the value is dropped silently, like other field-level access in this repo.
2. Policy hook: the note is kept only while the record's stage is Draft; any other stage stores nothing. So moving to In review, Approved or Published clears it whoever or whatever moved it.
3. A limit of 500 characters (the screen's textarea has the same limit in my build; main's does not), checked on publish like other text limits.
4. The server still does not **require** a note when sending back: existing policy tests move In review to Draft without one. Reported as a limit, not changed.

## Not doing
No change to main's screen, buttons or dashboard (main agent's lane). No change to `policy.ts` rules.

## Risks
1. Main's screen clears the note by saving `''` as the editor: with the field closed to editors that value is dropped, but the stage move clears it anyway (decision 2). A test covers it.
2. A reviewer saving unrelated edits to a sent-back draft could overwrite the note with the form's copy of it. The form sends back the value it loaded, so the value is unchanged; the test "an editor editing a sent-back draft keeps seeing the note" covers the editor side.

## Gate
Predictions first. Typecheck, lint, the full suite, build, no drift; browser: main's `role-workflow.e2e.spec.ts` still passes unchanged (it is the proof that closing the field to editors does not break Send for review).
