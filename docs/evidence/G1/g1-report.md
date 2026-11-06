# G1 evidence: Foundation (P1)

Date: 2026-11-06. Environment: the build sandbox (Linux, Node 22.23.4, pnpm 11.28.11, Postgres 17.5 run directly, not in Docker).

## What was run

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` on a fresh clone | passed, 819 packages |
| `pnpm db:migrate` on an empty database | passed, one migration, 83 tables |
| `pnpm typecheck` | passed |
| `pnpm lint` | passed with 0 errors, 13 warnings (8 existing template warnings plus 5 template-only React 19 rules downgraded on purpose, see `apps/web/eslint.config.mjs`) |
| `pnpm test:int` (3 unit tests, 3 integration tests) | 6 of 6 passed |
| `pnpm build` (production, Turbopack) | passed |
| `GET /healthz` | 200 `{"status":"ok"}` |
| `GET /readyz`, database up | 200 `{"status":"ready","database":"ok"}` |
| `GET /readyz`, database stopped | 503 `{"status":"not-ready","database":"unavailable"}` in 0.03 s; `/healthz` still 200; `/readyz` back to 200 after restart |
| Fresh clone to green tests | 25 s wall time, with dependencies already in the local pnpm store |

## Not run (and why)

- **Docker.** `ops/docker-compose.yml` and `ops/Dockerfile` were written but not run: this sandbox has no Docker daemon. The 15-minute README path that uses `docker compose` is therefore unverified; the same steps were run against a directly installed Postgres.
- **The 15-minute claim from a cold machine.** The 25 s figure had a warm package store. A cold install was not timed.
- **Skeleton URL live (Vercel and Neon).** Needs the user's accounts. Not run. Predicted Neon cold-start (P1-a) therefore remains untested.
- **Playwright end-to-end tests.** Template tests exist but were not run (no browser run in this phase).
- **Next 16.4.x, Node 24/26.** Still untested.

## Gate status

| G1 criterion | State |
| --- | --- |
| Fresh clone starts in under 15 minutes by README alone | Partly: steps run without Docker in 25 s warm; Docker path and cold timing not run |
| CI passes | Met: run 42212230542 on commit 38cd496 succeeded (Postgres 17 service, all steps) |
| Skeleton URL live | Not run (needs user's Vercel and Neon accounts) |
| Readiness endpoint reports the database | Met (200 and 503 both observed) |

## Known follow-ups

- `.env.example` placeholder secrets pass validation (16+ characters). Add a production check that rejects `change-me` values.
- Template components that trip React 19 lint rules are replaced in P3.
- `generatePreviewPath` still reads `process.env.PREVIEW_SECRET` directly (it may run in client-adjacent code); revisit when preview is tested.
