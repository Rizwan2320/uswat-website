# Status

Updated: 2026-11-06 (Fri) 12:00 PKT

| Phase | State | Gate |
| --- | --- | --- |
| P0 Decide and verify | Spike S-1 done; waiting on user inputs | G0 pending (see below) |
| P1 Foundation | In progress | G1 pending |
| P2 to P8 | Not started | |

## G0 checklist
- [x] Spike S-1 run, results in `docs/evidence/G0/spike-report.md`
- [x] `docs/tooling.md` with exact versions
- [x] ADR-0001 to 0003 accepted; ADR-0004 proposed
- [x] Data-gap list with owners (`docs/evidence/G0/data-gaps.md`)
- [x] Vercel: demo/presentation only, not for the real site (user, 2026-11-06). Open detail: confirm nobody is paid for the demo.
- [ ] Chairman DCST confirmation that the flyer's stack is not mandatory (user)
- [ ] Spike items not run: per-version access, preview, R2/Blob, Vercel/Neon, Node 24/26, Next 16.4.x (P1 or after accounts exist)
- [x] Push to GitHub works (2026-11-06)

## Next step
Start P1: generate the app from the `v3.93.0` website template, set `agentRules: false`, wire CI. User decided on 2026-11-06 to proceed to P1 while still waiting on the DCST confirmation and the content export; G0 stays open until both arrive.
