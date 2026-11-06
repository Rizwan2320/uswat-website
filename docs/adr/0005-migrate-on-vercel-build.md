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
