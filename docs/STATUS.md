# Status

Updated: 2026-11-06 (Fri) 12:00 PKT

| Phase | State | Gate |
| --- | --- | --- |
| P0 Decide and verify | Spike S-1 done; waiting on user inputs | G0 pending (see below) |
| P1 to P8 | Not started | |

## G0 checklist
- [x] Spike S-1 run, results in `docs/evidence/G0/spike-report.md`
- [x] `docs/tooling.md` with exact versions
- [x] ADR-0001 to 0003 accepted; ADR-0004 proposed
- [x] Data-gap list with owners (`docs/evidence/G0/data-gaps.md`)
- [ ] Vercel commercial-use answer (user)
- [ ] Chairman DCST confirmation that the flyer's stack is not mandatory (user)
- [ ] Spike items not run: per-version access, preview, R2/Blob, Vercel/Neon, Node 24/26, Next 16.4.x (P1 or after accounts exist)
- [ ] Push to GitHub: Claude GitHub App needs access to this repository

## Next step
Start P1: generate the app from the `v3.93.0` website template, set `agentRules: false`, wire CI. Do not start until the user accepts G0.
