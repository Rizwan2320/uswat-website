# Status

Updated: 2026-11-06 (Fri) PKT

| Phase | State | Gate |
| --- | --- | --- |
| P0 Decide and verify | Spike S-1 done; waiting on user inputs | G0 pending (see below) |
| P1 Foundation | Code done and checked locally; CI and live URL pending | G1 partly met, see `docs/evidence/G1/g1-report.md` |
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

## G1 checklist
- [x] App skeleton in `apps/web`: Payload on Postgres, EN/UR localization, migrations, env validation
- [x] `/healthz` and `/readyz` (200 and 503 both observed)
- [x] Typecheck, lint, 6 tests, production build pass locally; fresh clone green in 25 s (warm store)
- [ ] CI result on GitHub (workflow pushed; result not yet seen)
- [ ] Docker path (`ops/`) run: no Docker daemon in the sandbox
- [ ] Skeleton URL live: needs the user's Vercel and Neon accounts

## Next step
1. Confirm the first CI run is green after the push; fix if not.
2. User: Chairman DCST confirmation (Q2), content export or PDFs (Q3), paid-builder answer, brand assets. G0 stays open until Q2 and Q3 arrive.
3. Then P2 (content model and verified data) per plan section 11. Facts without a source stay labelled Sample.
