import { z } from 'zod'

/**
 * Environment variables are validated once, at boot. A missing or malformed value
 * stops the app with a readable message instead of failing later at runtime.
 * Secrets are never logged.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PAYLOAD_SECRET: z.string().min(16, 'PAYLOAD_SECRET must be at least 16 characters'),
  NEXT_PUBLIC_SERVER_URL: z.string().url().default('http://localhost:3000'),
  CRON_SECRET: z.string().min(16, 'CRON_SECRET must be at least 16 characters'),
  PREVIEW_SECRET: z.string().min(16, 'PREVIEW_SECRET must be at least 16 characters'),
  // Optional: set on Vercel to keep uploaded media in Blob (ADR-0014). Unset means local disk.
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
})

export type Env = z.infer<typeof schema>

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source)
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    throw new Error(`Invalid environment:\n${lines.join('\n')}`)
  }
  return result.data
}

// During `next build` Payload is imported without a database; skip strict parsing there
// only when the explicit build flag is set by our build scripts.
export const env: Env =
  process.env.SKIP_ENV_VALIDATION === '1'
    ? ({
        DATABASE_URL: process.env.DATABASE_URL ?? '',
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? '',
        NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
        CRON_SECRET: process.env.CRON_SECRET ?? '',
        PREVIEW_SECRET: process.env.PREVIEW_SECRET ?? '',
        BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      } as Env)
    : parseEnv(process.env)
