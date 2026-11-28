# FP-22 Leaver handling: from the Registrar's "Mark as left" to the public page

Date 2026-11-28. FP agent, owner instruction "decide yourself" after the question "when the faculty leaves then what happens?". Spec: Addendum C section 5.6 (Departure) and FP-07 (former faculty, emeritus). Builds on FP-20 and FP-21 (PRs #183, #187; ADR-0029).

## Objective
When the Registrar marks a person as having left, in one action: the account ends the same moment, the decision is logged with its source document, and the person's public page becomes "Former faculty" or "Emeritus" with contact details removed, at the same address.

## Design
- **Registrar screen.** On a person's page, a card "When someone leaves": outcome (Former faculty or Emeritus), the source document (same rules as other changes), and a tick box confirming the effects. Needs the same fresh passkey check as a change. Not available for yourself or for someone already marked.
- **Account side (one transaction with the log).** Status becomes `left`; sessions deleted; delegations revoked (shared function with the operator command, so both do the same); reviewer, head and Registrar roles removed and listed in the log row. New table `account_departure` (migration 0019, insert-only log: subject, Registrar, outcome, source, roles removed, time).
- **Public side.** The bridge message gains an optional `departure` (`former` or `emeritus`). The receiver sets `facultyStatus`, clears email, office location and office hours on the People record, and ignores any profile edit in that message. The public page shows none of email, office, location or hours for a person who is not current, whatever the record holds (second guard). The page address stays alive; the directory and department lists already show current people only.
- **Failure.** Sent after the commit with `after()`. If the site cannot be reached the Registrar sees "Waiting to appear on the public site" with a "Send again" button; the account is already ended either way.
- **Not changed.** Name, designation, biography, publications and photo stay on the former page. Reinstating a person stays an operator command and does not touch the public page (stated on screen and in the ADR). How long portal data is kept after leaving is a university decision, not made here.

## Paths touched
Portal lane: `identity/accountStatus.ts`, `identity/sql/0019_*`, `identity/migrate.ts`, `portal/registrar/**`, `portal/bridge/{contract,receive,pgStore,service,wiring}.ts`, `portal/copy.ts`, `app/(portal)/portal/registrar/[id]/page.tsx`, tests, docs. Outside the lane (PR for the lead): `site/people/shape.ts` and its test.

## Risks
Ending an account is hard to undo by mistake (confirmation, source document, fresh passkey); a head leaving leaves a department without a head (listed in the log, shown on screen); the departure write is refused by governance (integration test); email cleared on a record the lead edits by hand (only on departure).

## Tests
Unit: contract (departure accepted, unknown value refused, older messages unchanged), public shape hides contact details for non-current people, rules for the leave input. Integration on a clean portal database: the leave transaction (status, sessions, delegations, roles, log row, not self, not twice, not a non-Registrar), and on a clean CMS database: receiver sets status and clears contact, keeps the rest. Browser: Registrar marks the Sample person as left, the person cannot sign in, the public page shows "Former faculty" without contact details.

## Gate
Local run green on clean databases; PR open for the lead; nothing applied to the live portal or CMS database. Prediction rows FP22-a to FP22-e.
