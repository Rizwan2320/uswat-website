/**
 * pnpm --filter @uswat/web identity:roles list
 * pnpm --filter @uswat/web identity:roles set-department <email> <department...>
 * pnpm --filter @uswat/web identity:roles grant-reviewer <email>     (the account needs a department first)
 * pnpm --filter @uswat/web identity:roles revoke-reviewer <email>
 * pnpm --filter @uswat/web identity:roles grant-head <email> | revoke-head <email>   (department head: activates claimed accounts)
 * pnpm --filter @uswat/web identity:roles set-status <email> <active|suspended|left>   (suspended and left end every session)
 * Reads PORTAL_DATABASE_URL. Same target guard as identity:migrate (local databases only unless the owner sets IDENTITY_ALLOW_REMOTE).
 * This is the only way to give someone a department or the reviewer role: no screen and no request can. Departments are Sample text
 * until the People collection supplies real ones. The listing shows email addresses; handle the output as personal data.
 */
import { ACCOUNT_STATUSES, createPgStatusStore, type AccountStatus } from '../src/modules/identity/accountStatus'
import { closeIdentityPool, getIdentityPool } from '../src/modules/identity/db'
import { assertSafeTarget } from '../src/modules/identity/migrate'
import { createPgRoleStore } from '../src/modules/portal/review/roles'

const url = process.env.PORTAL_DATABASE_URL
const [cmd, email, ...rest] = process.argv.slice(2)
const usage = 'usage: PORTAL_DATABASE_URL=... identity:roles list | set-department <email> <department> | grant-reviewer|revoke-reviewer|grant-head|revoke-head <email> | set-status <email> <active|suspended|left>'
const valid =
  cmd === 'list' ? email === undefined : cmd === 'set-department' ? !!email && rest.length > 0 : ['grant-reviewer', 'revoke-reviewer', 'grant-head', 'revoke-head'].includes(cmd ?? '') ? !!email && rest.length === 0 : cmd === 'set-status' ? !!email && rest.length === 1 && ACCOUNT_STATUSES.includes(rest[0] as AccountStatus) && rest[0] !== 'pending-activation' : false
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
    let result: string
    if (cmd === 'set-status') {
      const pool = getIdentityPool(url as string)
      const id = (await pool.query<{ id: string }>(`select "id" from "user" where lower("email") = lower($1)`, [who.trim()])).rows[0]?.id
      result = id ? await createPgStatusStore(pool).set(id, rest[0] as AccountStatus, Date.now()) : 'no-account'
    } else {
      result = cmd === 'set-department' ? await store.setDepartment(who, rest.join(' ')) : cmd === 'grant-reviewer' ? await store.grantReviewer(who) : cmd === 'revoke-reviewer' ? await store.revokeReviewer(who) : cmd === 'grant-head' ? await store.grantHead(who) : await store.revokeHead(who)
    }
    console.log(JSON.stringify({ command: cmd, result }))
    if (result !== 'ok') process.exitCode = 1
  }
  await closeIdentityPool()
}
main().catch((e: Error) => {
  console.error(e.message)
  process.exit(1)
})
