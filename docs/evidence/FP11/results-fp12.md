# FP-12 results: publications queue on sample candidates

Date 2026-11-18. Branch `fp/publications-sample` (stacked on `fp/profile-sample`). Predictions FP12-a, FP12-b.

## What was run
- Unit: `publicationRules.unit.spec.ts` (DOI and title keys, Urdu, validation, sample list has the repeats it claims), `publicationService.unit.spec.ts` (no session, ORCID needed, invalid records dropped and counted, failing source, id checks). 18 tests.
- Integration (real PostgreSQL 16, local): 11 tests in `tests/int/identity/identity.int.spec.ts`: idempotent harvest, either arrival order of a DOI work and its no-DOI twin, same DOI under another title, same title other year, rejected and claimed works do not return, transitions only from pending, duplicate needs a claimed target of the same account, no cross-account read or decision, same work for two accounts, Urdu kept, failed batch rolls back, cascade and status check. 69 of 69 in the file; 377 identity and portal tests in all.
- Mutation checks: 14 logic mutations; 11 caught at once; 1 equivalent (self-duplicate guard), 1 no-op by my mistake, 1 real gap (accent folding) closed and caught.
- Browser (`scripts/publications-run.mjs`, Chromium, virtual authenticator, production build): 16 of 16 (`results/publications-run.json`), covering: ORCID needed first; first harvest 5 added, 2 repeats recognised, 2 broken records dropped; second harvest adds nothing; Urdu title direction-aware; claim, "not me", duplicate with its target shown; a rejected work stays away after another harvest; a second account sees only its own list; a crafted decision with another account's id is refused and leaves that row pending; a malformed id is refused; claim by keyboard alone; no horizontal scroll at 390 px. The profile run was re-run afterwards: 22 of 22.

## Defects found by running it
- The new fourth navigation link made the header 51 px wider than a phone screen on every portal page; the nav now wraps (`flex-wrap`).
- Grid min-width hardening on the work cards was added while chasing it; it was not the cause but is kept (it covers long titles).

## Not run, and why
- Real ORCID or OpenAlex: this workspace cannot reach them and the owner has not approved lookups of real people. The source is a sample list with reserved test DOIs (10.5555), so none points at a real paper. The real source replaces `sampleSource` in `actions.ts` (one line) and must keep returning raw records; the service validates every one.
- A migration run on a populated database, real devices, https, screen reader, Urdu for the interface words, HJRS category (production tier), public publication list, manual entry of a work, undo of "not me".
- `tests/unit/env.unit.spec.ts` fails here without CMS secrets, the same on main.

## Safety notes
Source text is rendered as plain text only (no links or HTML), per the repo rule that retrieved data is never instructions. Records are bounded (authors, title, venue lengths) and invalid ones are dropped, never stored.
