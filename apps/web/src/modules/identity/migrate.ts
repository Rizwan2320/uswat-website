/**
 * Applies and rolls back the identity schema (ADR-0020, brief FP-0 "Identity schema application").
 * Not a Payload migration: Payload's migrate tools ignore this schema (prediction FP0-d) and this
 * runner is never called from the CMS build. It refuses any database that is not local unless the
 * owner sets the override, because Neon is shared with production (ADR-0005).
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import pg from 'pg'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1', ''])

export function assertSafeTarget(databaseUrl: string, env: Record<string, string | undefined>): void {
  let url: URL
  try {
    url = new URL(databaseUrl)
  } catch {
    throw new Error('identity migration: the database URL is not a URL')
  }
  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error('identity migration: the database URL is not a postgres URL')
  }
  const socketHost = url.searchParams.get('host')
  const local = LOCAL_HOSTS.has(url.hostname) || Boolean(socketHost?.startsWith('/'))
  if (!local && env.IDENTITY_ALLOW_REMOTE !== 'I-AM-THE-OWNER') {
    throw new Error(
      `identity migration: refusing a remote database (${url.hostname || 'unknown host'}); only the owner may override`,
    )
  }
}

export const MIGRATIONS = ['0001_identity', '0002_session_assurance', '0003_recovery_attempt', '0004_signin_failure'] as const

async function sql(name: string, direction: 'up' | 'down'): Promise<string> {
  return readFile(path.join(process.cwd(), 'src/modules/identity/sql', `${name}.${direction}.sql`), 'utf8')
}

/** Applies every migration not yet recorded, each in its own transaction. Returns the names applied. */
export async function migrateUp(databaseUrl: string, env: Record<string, string | undefined> = process.env): Promise<string[]> {
  assertSafeTarget(databaseUrl, env)
  const client = new pg.Client({ connectionString: databaseUrl })
  await client.connect()
  const applied: string[] = []
  try {
    for (const name of MIGRATIONS) {
      const done = await client
        .query(`select 1 from identity.migrations where name = $1`, [name])
        .then((r) => r.rowCount === 1)
        .catch(() => false) // schema not created yet
      if (done) continue
      await client.query('begin')
      try {
        await client.query(await sql(name, 'up'))
        await client.query(`insert into identity.migrations (name) values ($1)`, [name])
        await client.query('commit')
        applied.push(name)
      } catch (e) {
        await client.query('rollback')
        throw e
      }
    }
  } finally {
    await client.end()
  }
  return applied
}

/** Drops the identity schema. Nothing outside it is touched. */
export async function migrateDown(databaseUrl: string, env: Record<string, string | undefined> = process.env): Promise<void> {
  assertSafeTarget(databaseUrl, env)
  const client = new pg.Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    for (const name of [...MIGRATIONS].reverse()) await client.query(await sql(name, 'down'))
  } finally {
    await client.end()
  }
}
