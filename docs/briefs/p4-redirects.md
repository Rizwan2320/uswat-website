# Brief: old-address redirects (MIG-02), main agent, 2026-11-11
- Objective: every old university address in the route map answers 301 or an explicit 410 in one hop.
- Paths touched: `apps/web/src/legacy/*`, `apps/web/src/proxy.ts`, `apps/web/next.config.ts` (one option), `apps/web/scripts/routemap-build.ts`, `apps/web/package.json` (one script), tests, `docs/adr/0012-*`.
- Risks: a proxy runs on every request (kept to a map lookup); old addresses that collide with current routes (tested); same-address rows turning into loops (excluded and tested); skipping the framework slash redirect changes behaviour for every path (the proxy repeats it as a 308, tested on `/posts/`).
- Tests: unit over the real CSV (3 mutation checks), e2e over all 1,613 addresses on a production build, existing suites.
- Gate: MIG-02 offline and on a running build. Not in scope: loading content (the new pages do not exist yet, so targets answer 404 until the importer runs), DNS and the live site (never touched).
