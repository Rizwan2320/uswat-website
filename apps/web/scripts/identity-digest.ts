/**
 * pnpm --filter @uswat/web identity:digest [--dry-run]
 * Builds the notification digests that are due (FP-43): one log row per person per period (24 hours or 7 days), never more.
 * There is no mailer, so a digest is a row in the append-only notice log; this command only writes that log.
 * Reads PORTAL_DATABASE_URL. Same target guard as identity:migrate. Prints counts only, never names or content.
 * `--dry-run` only counts the people who have something waiting. Scheduling this is the owner's or the main agent's decision.
 */
import { closeIdentityPool, getIdentityPool } from '../src/modules/identity/db'
import { assertSafeTarget } from '../src/modules/identity/migrate'
import { createPgNotificationStore } from '../src/modules/portal/notifications/pgStore'
import { runDigests } from '../src/modules/portal/notifications/service'

const url = process.env.PORTAL_DATABASE_URL
const dryRun = process.argv.includes('--dry-run')
if (!url || process.argv.slice(2).some((a) => a !== '--dry-run')) {
  console.error('usage: PORTAL_DATABASE_URL=... identity:digest [--dry-run]')
  process.exit(2)
}
async function main(): Promise<void> {
  assertSafeTarget(url as string, process.env)
  const counts = await runDigests(createPgNotificationStore(getIdentityPool(url as string)), Date.now(), { dryRun })
  console.log(dryRun ? 'people with items waiting:' : 'digests:', JSON.stringify(dryRun ? { people: counts.people } : counts))
  await closeIdentityPool()
}
main().catch((e: Error) => {
  console.error(e.message)
  process.exit(1)
})
