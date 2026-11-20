#!/bin/sh
# Vercel build entry (see docs/adr/0005-migrate-on-vercel-build.md).
# Applies pending Payload migrations, then builds. Fails the deploy if a migration fails.
set -eu

# Neon's pooled host ("-pooler") is for runtime; migrations use the direct host.
DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed 's/-pooler//')" pnpm db:migrate

# Sample content for the preview database only (docs/adr/0026-preview-sample-seeding.md). It runs only when this is a
# Vercel PREVIEW build and the flag is on; `seed:preview` checks the same locks again, plus the allowed database host
# (SEED_ALLOWED_DB_HOST, the direct host). A failure never fails the build. It runs before the build so the pages
# prerendered below can read the seeded rows.
if [ "${VERCEL_ENV:-}" = "preview" ] && [ "${SEED_SAMPLE_ON_PREVIEW:-}" = "true" ]; then
  DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed 's/-pooler//')" pnpm seed:preview || echo "[seed:preview] failed; continuing the build without Sample data"
else
  echo "[seed:preview] skipped (needs VERCEL_ENV=preview and SEED_SAMPLE_ON_PREVIEW=true)"
fi

pnpm build
