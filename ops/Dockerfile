# Container build for the Next + Payload app. NOT RUN in the build sandbox (no Docker daemon).
# Build from the repo root:  docker build -f ops/Dockerfile -t uswat-web .
FROM node:22.23.4-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
ENV BUILD_STANDALONE=1 SKIP_ENV_VALIDATION=1 NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM base AS run
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
