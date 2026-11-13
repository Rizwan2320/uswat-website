/**
 * Creates one sample user through the identity module's own auth object (sign-up is closed on the route).
 * Run from apps/web:  PORTAL_ENABLED=true PORTAL_ORIGIN=... PORTAL_DATABASE_URL=... PORTAL_AUTH_SECRET=... \
 *   npx tsx ../../docs/evidence/FP7/scripts/seed-user.ts <email> <password>
 */
import { createPortalAuth } from '../../../../apps/web/src/modules/identity/auth'
import { readPortalConfig } from '../../../../apps/web/src/modules/identity/config'

async function main() {
  const [email, password] = process.argv.slice(2)
  const config = readPortalConfig(process.env)
  if (!config.enabled || !email || !password) {
    console.error('portal not configured or missing arguments:', config.enabled ? '' : config.reason)
    process.exit(2)
  }
  const auth = createPortalAuth(config)
  const made = await auth.api.signUpEmail({ body: { email, password, name: 'Sample User' } })
  console.log('created', made.user.id)
}
main().then(
  () => process.exit(0),
  (e) => {
    console.error(String(e))
    process.exit(1)
  },
)
