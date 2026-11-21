/**
 * pnpm --filter @uswat/web identity:invite <recordRef> <email> <name> <department>
 * Creates a single-use invitation (72 hours, bound to the record) and prints the claim link ONCE. There is no mailer yet, so the
 * operator passes the link on; only a hash of the token is stored, so it cannot be shown again. Inviting the same record again
 * revokes the earlier open link. Reads PORTAL_DATABASE_URL and PORTAL_ORIGIN. Sample records only. The output contains a secret link:
 * do not commit it or paste it into a ticket.
 */
import { closeIdentityPool, getIdentityPool } from '../src/modules/identity/db'
import { checkInvite, createPgInvitationStore } from '../src/modules/identity/invitations'
import { assertSafeTarget } from '../src/modules/identity/migrate'

const url = process.env.PORTAL_DATABASE_URL
const origin = process.env.PORTAL_ORIGIN
const [recordRef, email, name, ...dept] = process.argv.slice(2)
if (!url || !origin || !recordRef || !email || !name || dept.length === 0) {
  console.error('usage: PORTAL_DATABASE_URL=... PORTAL_ORIGIN=... identity:invite <recordRef> <email> <name> <department...>   (quote the name)')
  process.exit(2)
}
async function main(): Promise<void> {
  assertSafeTarget(url as string, process.env)
  const checked = checkInvite({ recordRef, email, name, department: dept.join(' ') })
  if (!checked.ok) {
    console.error(JSON.stringify({ result: 'invalid', field: checked.error }))
    process.exit(1)
  }
  const made = await createPgInvitationStore(getIdentityPool(url as string)).create(checked.value, Date.now())
  console.log(JSON.stringify({ result: 'ok', link: `${(origin as string).replace(/\/+$/, '')}/portal/claim/${made.token}`, expiresAt: new Date(made.expiresAt).toISOString(), note: 'shown once; no email is sent' }))
  await closeIdentityPool()
}
main().catch((e: Error) => {
  console.error(e.message)
  process.exit(1)
})
