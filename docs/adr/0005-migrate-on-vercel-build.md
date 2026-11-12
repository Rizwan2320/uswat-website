# ADR-0005 Apply migrations during the Vercel build

- Status: Proposed (demo only; see ADR-0004)
- Context: `push: false` means the database only gets tables from migrations. The Vercel build ran `next build` alone, so a first deploy against an empty Neon database would have `/healthz` 200 and `/readyz` 503. The build sandbox used for development cannot reach Neon, so migrations cannot be applied from there.
- Decision: Add a `vercel-build` script (`apps/web/scripts/vercel-build.sh`). Vercel runs it instead of `build`. It runs `payload migrate` against the direct (non-pooler) Neon host, then `pnpm build`. A failed migration fails the deploy.
- Alternatives considered: (1) Run `pnpm db:migrate` by hand from a developer machine: works but is easy to forget and leaves deploys broken. (2) Apply the SQL through the Neon MCP connector: bypasses the migration table and drifts from the repo. (3) A separate CI job with a Neon secret: more moving parts for a demo.
- Evidence: Prediction P1-d (sandbox blocked) and P1-e in `docs/predictions.md`.
- Consequences: Preview and production deploys share one demo database, so a migration runs on whichever deploy happens first. Acceptable for a demo; not acceptable for a real site. The host rewrite (`-pooler` removed) is Neon-specific and harmless elsewhere.
- Cost of reversal: Low. Delete the script and the `vercel-build` entry.
- Reversal trigger: Any move to a real host, or a second environment that needs its own database (use Neon branches then).
- Owner: Lead
- Review date: At P8 or when the real hosting decision is made.
- Prediction: P1-e

## Update 2026-11-12: previews have their own Neon branch
- Why: the shared database was already affected. On 2026-11-12 the production database listed migrations `p3e_organisation`, `p3f_media_rules` and `p3h_seo_search_redirects`, all applied by preview builds of branches that had not merged. Production tables therefore ran ahead of `main`.
- What changed: Neon project `uswat-website` has a branch `previews` (copied from `main` at 2026-11-12 02:13 UTC, so it carries the same three migrations). In Vercel, `DATABASE_URL` is now two variables: the original, set to Production only, points at the `main` branch; a second, set to Preview only, points at the `previews` branch. Both are the pooled host; `vercel-build.sh` still rewrites it to the direct host for migrations. Neither value is in the repository.
- Consequence: a preview build migrates and serves only the `previews` branch. Production changes only when `main` deploys. The `previews` branch is shared by all preview deployments, so two previews of different branches still share it; the rule of one migration per PR, never edited after a preview built it, still applies.
- Not changed: the production database keeps the three extra migrations. They are recorded as applied, so when their PRs merge Payload skips them. Do not rewrite those migration files.
- Reset: `previews` can be reset from `main` in the Neon console or with the Neon tools when it drifts too far (this discards what previews wrote, which is the point). Do that only after the main agent has confirmed no open preview needs the data.
- Compute: Neon does not let this account change the suspend interval, so the `previews` compute follows the project default.
- Credentials: a Neon branch inherits the parent's roles, so `previews` uses the same role and password as `main`. Rotating the Neon password (an open owner item) must be followed by updating both Vercel variables.
