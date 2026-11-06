# uswat-website

Competition prototype of the University of Swat website and CMS (TypeScript, Next.js, Payload CMS, PostgreSQL).

**Not the official University of Swat website.** Content marked Sample is unverified.

- Plan: [docs/plan/IMPLEMENTATION_PLAN_v2.md](docs/plan/IMPLEMENTATION_PLAN_v2.md)
- Status: [docs/STATUS.md](docs/STATUS.md)
- Predictions log: [docs/predictions.md](docs/predictions.md)

## Run it locally (about 15 minutes)

Needs Node 22.23.4 (see `.nvmrc`), pnpm 11 (`corepack enable`), and a PostgreSQL 17 you can reach.

```bash
corepack enable
pnpm install
docker compose -f ops/docker-compose.yml up -d      # or any Postgres 17; create a database named uswat
cp apps/web/.env.example apps/web/.env              # then replace the three secrets (openssl rand -hex 32)
pnpm db:migrate                                     # apply migrations; the app never changes the schema by itself
pnpm dev                                            # http://localhost:3000, admin at /admin
```

Check it is alive: `curl localhost:3000/healthz` (process up) and `curl localhost:3000/readyz` (database reachable; 503 if not).

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test:int && pnpm build
```

`test:int` needs the database from the steps above. CI runs the same sequence against a Postgres service.

## Layout

- `apps/web` Next.js app with the embedded Payload CMS
- `docs/` plan, ADRs, evidence, predictions, status
- `ops/` Docker files (not yet run, see `docs/evidence/G1`)
