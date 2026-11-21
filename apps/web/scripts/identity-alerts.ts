/**
 * pnpm --filter @uswat/web identity:alerts            list open "This wasn't me" alerts (oldest first)
 * pnpm --filter @uswat/web identity:alerts --ack <id> mark one alert as seen
 * Reads PORTAL_DATABASE_URL. Same target guard as identity:migrate (local databases only unless the owner sets
 * IDENTITY_ALLOW_REMOTE). This is how the Platform Admin sees alerts until there is a privileged role and a mailer.
 * The listing shows the account's email, because the person acting on an alert needs it; handle the output as personal data.
 */
import { closeIdentityPool, getIdentityPool } from '../src/modules/identity/db'
import { assertSafeTarget } from '../src/modules/identity/migrate'
import { createPgAlertStore } from '../src/modules/identity/securityEvents'

const url = process.env.PORTAL_DATABASE_URL
const args = process.argv.slice(2)
const ackAt = args.indexOf('--ack')
if (!url || (ackAt >= 0 && !args[ackAt + 1]) || args.some((a) => a !== '--ack' && !a.startsWith('--') && args[ackAt + 1] !== a)) {
  console.error('usage: PORTAL_DATABASE_URL=... identity:alerts [--ack <id>]')
  process.exit(2)
}
async function main(): Promise<void> {
  assertSafeTarget(url as string, process.env)
  const store = createPgAlertStore(getIdentityPool(url as string))
  if (ackAt >= 0) {
    const ok = await store.acknowledge(args[ackAt + 1] as string, Date.now())
    console.log(JSON.stringify({ acknowledged: ok }))
    if (!ok) process.exitCode = 1
  } else {
    console.log(JSON.stringify(await store.listOpen(), null, 2))
  }
  await closeIdentityPool()
}
main().catch((e: Error) => {
  console.error(e.message)
  process.exit(1)
})
