# Brief FP-12: publications claim/reject queue on sample candidates (FP-10, FP-11, FP-12, FPR-05)

Branch `fp/publications-sample`, stacked on `fp/profile-sample` (PR #76, not yet merged). Date 2026-11-18. Same owner decision as FP-11: sample data now, real source later.

## Objective
A signed-in faculty member with an ORCID iD saved in their profile can press "Look for new works", see harvested candidates, and claim each, mark it "not me", or mark it a duplicate of a work already claimed. Rejections are remembered. Running the harvest twice adds nothing. Nothing is published.

## Design
- Two seams. `CandidateSource.fetch(orcid)` (today a sample source with a fixed list including deliberate duplicates; later OpenAlex by ORCID, FP-11) and `PublicationStore` (today PostgreSQL in the portal's own schema; later could move to Payload). Screens and rules do not change when either is swapped.
- De-duplication (spec FP-12): by normalised DOI first, then by normalised title plus year. Both keys are stored and each is unique per account, so the database itself makes the harvest idempotent (FPR-05), not just the code.
- Rejected and duplicate rows stay, so a harvested work cannot return after a "not me".
- Candidates from any source pass strict validation (lengths, year range, DOI shape, author count); invalid ones are dropped and counted, never stored. Source text is data, never instructions (CLAUDE.md rule 4); it is rendered as plain text only.
- The account comes from the session only; every query carries it (FPR-03). A duplicate mark must point at a claimed work of the same account, checked in the same SQL statement.
- Table `identity.publication_candidate` (migration 0008). Sample rows carry `sample = true`, which drives the Sample label.

## Tests before code
Unit: DOI and title normalisation (case, `https://doi.org/` prefix, punctuation, diacritics, Urdu letters kept), validation, sample source has the duplicates it claims to have. Integration (real PostgreSQL): harvest twice adds nothing; same work with DOI written two ways stored once; no-DOI copy of a DOI work (same title and year) stored once; reject then harvest again stays rejected; claim, reject, duplicate transitions only from pending; duplicate needs a claimed target of the same account; account B cannot see or decide A's rows by any call; cascade on account delete; migration up/down. Browser: harvest, claim, not me, duplicate, harvest again (nothing new), keyboard only, 390 px width, second account sees only its own list, crafted decision on another account's id refused.

## Not in this slice
Real ORCID or OpenAlex calls (network is not allowed from this workspace and the owner has not approved lookups of real people), HJRS category (FP-13, production), public profile publication list, manual entry of a work, edit of a claimed work, undo of "not me".
