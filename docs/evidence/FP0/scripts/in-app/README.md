In-app spike (scratch copy of the repository at f3e3eea, never committed to `apps/web`):
- `auth.ts` goes to `apps/web/src/modules/identity/auth.ts`; `route.ts` to `apps/web/src/app/portal-api/auth/[...all]/route.ts`.
- `pnpm --filter @uswat/web add better-auth@1.7.18 @better-auth/passkey@1.7.18 pg@8.20.0` and `-D @types/pg@8.20.0`.
- Bundle `client.app.mjs` with esbuild to `apps/web/public/fp0-client.js` and add a page `public/fp0.html` that loads it.
- Environment (all random or local, nothing committed): `DATABASE_URL`, `IDENTITY_DATABASE_URL`, `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`, `BETTER_AUTH_SECRET`, `PORTAL_ORIGIN=http://localhost:3020`; optional `RATE_LIMIT=off`.
- Run the suite: `PORT=3020 UV_MODE=required AUTH_BASE=/portal-api/auth PAGE=/fp0.html DB_NAME=fp0app TAG=in-app-prod node test.mjs`.
- Kill servers by port (`fuser -k 3020/tcp`): the `next-server` child outlives `pkill -f "next start"`, which caused one invalid run (discarded and redone).
