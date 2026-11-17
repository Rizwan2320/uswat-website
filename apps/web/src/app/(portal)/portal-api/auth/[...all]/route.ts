/**
 * Portal auth API. Answers 404 unless the owner has enabled the portal on its own project
 * (see src/modules/identity/config.ts); the public site's deployment never sets those variables.
 */
import { createAuthHandlers } from '@/modules/identity/handlers'
import { portalDeps } from '@/modules/portal/deps'

export const dynamic = 'force-dynamic'

export const { GET, POST } = createAuthHandlers({ env: process.env, ...portalDeps })
