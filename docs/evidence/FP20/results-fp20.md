# FP-20 results: portal to public website bridge (stage 1)

Run 2026-11-27 and 2026-11-28 on one local server (portal scratch database `fp20`, CMS scratch database `cmsdemo`, Sample people, `example.invalid` addresses). Nothing here touched the live site, the live portal database or real people.

| Check | Result |
| --- | --- |
| Unit: signing, message build, allow-list, sender, sync service, policy flag | `tests/unit/portal/publicBridge.unit.spec.ts` and `tests/unit/policy.unit.spec.ts`; full unit run 1203 passed (`env.unit.spec.ts` needs env vars and passes when they are set) |
| Integration: People written through the real hooks (clean CMS database after `db:migrate`) | `tests/int/portalBridge.int.spec.ts` 7 passed; whole `tests/int` 529 passed, 231 skipped (identity, run separately) |
| Integration: portal database, migration 0018 up, down, up, store | identity suite 233 of 233 on a clean database |
| Browser, end to end | `results/bridge-run.json`: 16 of 16 (run 2). `results/bridge-run-1-cold.json`: 13 of 16, kept because it shows the first automatic send timing out on the dev server's cold compile, the "Waiting" state, and the button recovering it |
| Typecheck, eslint | tsc clean; eslint 0 errors (warnings are `any` in the new tests) |

Findings that changed the code:
1. Payload applies an update on top of the latest saved version. A live row changed by SQL (the Sample data fill) lost its name and designation on the first bridge write. The writer now carries the live values of every field the portal does not own. Production People are written only through Payload, so this is a safety net there and a visible fix on preview data.
2. A Urdu save needs the person's Urdu name. Without one the Urdu bio is skipped (everything else goes through) and the result says so. Registrar adds the Urdu name.
3. Sample copy on two portal screens said nothing is sent or published; both now describe the bridge.

Not run: the live deployment, the live portal database migration, the shared secret and site address in either Vercel project, a first send from the live portal to the live site, Crossref and OpenAlex live calls (FP-19 note). The FP19 browser script's first check (P1) quotes the old Publications note and would now fail on that sentence; its recorded results stand.
