# FP-6: browser run of the real passkey flows

Reproduce (needs a local PostgreSQL, Chromium and Playwright; throwaway database only, never Neon):
1. `createdb fp6`, then from `apps/web`: `PORTAL_DATABASE_URL=postgres://.../fp6 npx tsx scripts/identity-migrate.ts up`.
2. Build and start the app with `PORTAL_ENABLED=true PORTAL_ORIGIN=http://localhost:3040 PORTAL_DATABASE_URL=... PORTAL_AUTH_SECRET=<32+ characters>` (plus the usual `DATABASE_URL`, `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`) on port 3040.
3. Bundle the client: `esbuild scripts/client.src.mjs --bundle --format=iife --platform=browser` (needs `better-auth` and `@better-auth/passkey` 1.7.18 resolvable, e.g. from `docs/evidence/FP0/scripts`).
4. `npx tsx docs/evidence/FP6/scripts/seed-user.ts <email> <password>` from `apps/web`, with the same `PORTAL_*` variables. **Check it printed `created`** before going on.
5. `ORIGIN=http://localhost:3040 CLIENT_BUNDLE=<bundle> EMAIL=<email> PASSWORD=<password> OUT=<json> node docs/evidence/FP6/scripts/browser-run.mjs`.
When restarting the app between builds, kill the child `next-server` process too (by port); `pkill "next start"` alone leaves the old build serving.
