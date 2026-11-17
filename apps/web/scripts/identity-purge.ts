/**
 * pnpm --filter @uswat/web identity:purge [--dry-run]
 * Reads PORTAL_DATABASE_URL. Same target guard as identity:migrate (local databases only unless the owner sets
 * IDENTITY_ALLOW_REMOTE). Prints counts only. Scheduling it is the owner's or the main agent's decision.
 */
import { closeIdentityPool, getIdentityPool } from '../src/modules/identity/db'
import { assertSafeTarget } from '../src/modules/identity/migrate'
import { purgeExpired } from '../src/modules/identity/purge'

const url = process.env.PORTAL_DATABASE_URL
const dryRun = process.argv.includes('--dry-run')
if (!url) {
  console.error('usage: PORTAL_DATABASE_URL=... identity:purge [--dry-run]')
  process.exit(2)
}
async function main(): Promise<void> {
  assertSafeTarget(url as string, process.env)
  const counts = await purgeExpired(getIdentityPool(url as string), Date.now(), { dryRun })
  console.log(dryRun ? 'would remove:' : 'removed:', JSON.stringify(counts))
  await closeIdentityPool()
}
main().catch((e: Error) => {
  console.error(e.message)
  process.exit(1)
})
