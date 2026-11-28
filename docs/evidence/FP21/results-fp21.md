# FP-21 results: bridge stage 2

Run 2026-11-28 on one local server (portal scratch database `fp20`, CMS scratch database `cmsdemo` migrated to the new schema, Sample people). Nothing touched the live site, the live CMS or portal databases, or real people.

| Check | Result |
| --- | --- |
| Unit (contract, sender, service, policy) | `tests/unit/portal/publicBridge.unit.spec.ts` 20 passed; whole unit run 1304 passed |
| Integration, fresh migrated CMS database | whole `tests/int`: 551 passed, 233 skipped (identity, run separately), 1 failed: `homeFromCms` date (not touched by this work, see predictions FP21-a) |
| Integration, portal database | identity suite 233 of 233 |
| Migration | applies, rolls back (4 columns and 2 tables gone), applies again on a fresh database |
| Browser, end to end | `results/bridge-run.json`: 23 of 23 (first run 20 of 22; the two failures were my script reading the work title with the new detail line, fixed in the script) |
| Phone width | 390 px wide, no sideways scroll (`shots/05b-public-phone.png`) |
| Typecheck, eslint | tsc clean; eslint 0 errors (3 warnings, `any` in tests) |

Findings that changed the work:
1. A migration file made before main's own two migrations would have mis-seeded the next generated one; regenerated after the merge.
2. CMS wording guard: "ORCID iD" becomes "ORCID number" in the admin (the public page and the portal keep "ORCID iD").
3. CMS Urdu coverage: 19 draft Urdu strings added to `urWords.ts` (unreviewed, same status as the rest of that file).

Not run: live deployment, applying the migration to the live CMS database, Crossref and OpenAlex live calls, a 300-character venue on a phone.
