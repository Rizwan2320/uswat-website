# Tooling baseline (observed 2026-11-06, spike S-1)

Versions below were resolved and run in the sandbox. "Latest" is from `npm view` on 2026-11-05/06.

| Tool | Baseline | Latest seen | Status |
| --- | --- | --- | --- |
| Node.js | 22.23.4 | n/a | Runs; satisfies Payload engines `^22.23.4 \|\| >=24.22.1`. Node 24 and 26 not tested. |
| pnpm | 12.18.0 (via corepack) | | Works. Build scripts must be approved with `pnpm approve-builds`. |
| Payload and `@payloadcms/*` | 3.93.0 | 3.93.0 (`latest`) | Works. Do not install `@latest` for every package: `@payloadcms/transformer-sharp` `latest` is 4.0.0-beta.7, and `main` of the Payload repo is Payload 4 beta. Pin 3.93.0 and use the `v3.93.0` template. |
| Next.js | 16.3.3 (template pin) | 16.4.5 | Works. 16.4.x not yet tested. |
| React | 19.2.6 (template pin) | 19.3.1 | Works. |
| TypeScript | 5.7.3 (template pin) | 7.0.2 | 5.7.3 typechecks clean. **7.0.2 fails**: `baseUrl` removed, and generic `keyof T` errors in `src/utilities/getGlobals.ts`. 6.x untested. Decision: stay on 5.7.x until 6.x is tested. |
| Tailwind CSS | 4.3.4 (resolved from ^4.1.18) | 4.3.4 | Works. |
| Playwright | 1.63.0 | 1.64.1 | Installed; browser tests not yet run. |
| Vitest | 4.0.18 | 5.1.0 | Installed; not yet run. |
| sharp | 0.35.4 | | Installed. |
| PostgreSQL | 17.5 (npm `embedded-postgres`, sandbox only) | 18.x offered by hosts | Works. Needs a non-root user and `--locale=C.UTF-8`. |
| Docker | client present, **no daemon** | | Container builds cannot be tested in this sandbox. Test in CI. |

## Sandbox notes
- Next.js 16 dev writes `AGENTS.md` and `CLAUDE.md` into the project. Set `agentRules: false` in `next.config` so it never overwrites the repo's own `CLAUDE.md`.
- No email adapter is configured: email is printed to the console.
