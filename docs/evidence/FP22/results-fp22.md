# FP-22 results: leaver handling

Run 2026-11-28 on one local server (portal scratch database `fp20`, CMS scratch database `cmsdemo`, Sample people). Nothing touched the live site, the live CMS or portal databases, or real people.

| Check | Result |
| --- | --- |
| Unit | whole `tests/unit`: 1313 passed (new: departure in the contract, leave input rules) |
| Integration, portal database | identity suite 238 of 238 on a clean database (new: leave transaction, refusals, log, departure read only while left) |
| Integration, fresh migrated CMS database | `portalBridge.int.spec.ts` 10 of 10 (new: departure applied, contact cleared, rest kept, public shape hides contact, repeat is a no-op) |
| Migration 0019 | applied, rolled back and applied again inside the identity suite |
| Browser, end to end | `results/leave-run.json`: 15 of 15 (empty form refused, account ended, roles and sessions gone, public page Former faculty without contact details, directory drops the person, person cannot return, Registrar sees "public page updated") |
| Phone width | 390 px, no sideways scroll (`shots/04-public-after-phone.png`) |
| Typecheck, eslint | tsc clean; eslint 0 errors (warnings are `any` in tests) |

Not run: a send to the real public site (the bridge is still off there until the lead merges and the two variables are set); the live databases.
