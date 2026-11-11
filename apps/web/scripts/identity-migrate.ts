/**
 * pnpm --filter @uswat/web identity:migrate up|down
 * Reads PORTAL_DATABASE_URL. Local databases only unless the owner sets IDENTITY_ALLOW_REMOTE.
 */
import { migrateDown, migrateUp } from '../src/modules/identity/migrate'

const url = process.env.PORTAL_DATABASE_URL
const direction = process.argv[2]
if (!url || (direction !== 'up' && direction !== 'down')) {
  console.error('usage: PORTAL_DATABASE_URL=... identity:migrate up|down')
  process.exit(2)
}
const run = direction === 'up' ? migrateUp(url).then((a) => console.log('applied:', a.join(', ') || 'nothing new')) : migrateDown(url).then(() => console.log('identity schema dropped'))
run.catch((e: Error) => {
  console.error(e.message)
  process.exit(1)
})
