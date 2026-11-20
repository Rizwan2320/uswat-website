/**
 * pnpm --filter @uswat/web identity:roles list
 * pnpm --filter @uswat/web identity:roles set-department <email> <department...>
 * pnpm --filter @uswat/web identity:roles grant-reviewer <email>     (the account needs a department first)
 * pnpm --filter @uswat/web identity:roles revoke-reviewer <email>
 * Reads PORTAL_DATABASE_URL. Same target guard as identity:migrate (local databases only unless the owner sets IDENTITY_ALLOW_REMOTE).
 * This is the only way to give someone a department or the reviewer role: no screen and no request can. Departments are Sample text
 * until the People collection supplies real ones. The listing shows email addresses; handle the output as personal data.
 */
import { closeIdentityPool, getIdentityPool } from '../src/modules/identity/db'
import { assertSafeTarget } from '../src/modules/identity/migrate'
import { createPgRoleStore } from '../src/modules/portal/review/roles'

const url = process.env.PORTAL_DATABASE_URL
const [cmd, email, ...rest] = process.argv.slice(2)
const usage = 'usage: PORTAL_DATABASE_URL=... identity:roles list | set-department <email> <department> | grant-reviewer <email> | revoke-reviewer <email>'
const valid =
  cmd === 'list' ? email === undefined : cmd === 'set-department' ? !!email && rest.length > 0 : cmd === 'grant-reviewer' || cmd === 'revoke-reviewer' ? !!email && rest.length === 0 : false
if (!url || !valid) {
  console.error(usage)
  process.exit(2)
}
async function main(): Promise<void> {
  assertSafeTarget(url as string, process.env)
  const store = createPgRoleStore(getIdentityPool(url as string))
  if (cmd === 'list') {
    console.log(JSON.stringify(await store.list(), null, 2))
  } else {
    const who = email as string
    const result = cmd === 'set-department' ? await store.setDepartment(who, rest.join(' ')) : cmd === 'grant-reviewer' ? await store.grantReviewer(who) : await store.revokeReviewer(who)
    console.log(JSON.stringify({ command: cmd, result }))
    if (result !== 'ok') process.exitCode = 1
  }
  await closeIdentityPool()
}
main().catch((e: Error) => {
  console.error(e.message)
  process.exit(1)
})
