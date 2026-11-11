/** One lazily created pool, pinned to the identity schema. Nothing connects at import time. */
import pg from 'pg'

let pool: pg.Pool | null = null

export function getIdentityPool(databaseUrl: string): pg.Pool {
  pool ??= new pg.Pool({ connectionString: databaseUrl, options: '-c search_path=identity', max: 5 })
  return pool
}

export async function closeIdentityPool(): Promise<void> {
  const p = pool
  pool = null
  await p?.end()
}
