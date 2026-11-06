#!/bin/sh
# Vercel build entry (see docs/adr/0005-migrate-on-vercel-build.md).
# Applies pending Payload migrations, then builds. Fails the deploy if a migration fails.
set -eu

# Neon's pooled host ("-pooler") is for runtime; migrations use the direct host.
DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed 's/-pooler//')" pnpm db:migrate
pnpm build
