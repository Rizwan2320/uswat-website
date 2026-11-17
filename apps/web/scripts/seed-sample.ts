/**
 * Sample organisation data (brief p4-seeds). Local database only.
 *   pnpm seed:sample                          creates and publishes the Sample rows, or does nothing if they exist
 *   SEED_ADMIN_EMAIL=you@example.test pnpm seed:sample   act as that existing platformAdmin
 * Without SEED_ADMIN_EMAIL a throwaway platformAdmin is created (random password, never printed).
 * Putting Sample rows on a shared demo database is the main agent's decision, not made here.
 */
import { randomBytes } from 'node:crypto'

import { applySeeds } from '../../../scripts/import/seeds/apply'
import { assertLocalDatabase, type Cms } from '../../../scripts/import/writer'

async function main() {
  assertLocalDatabase(process.env.DATABASE_URL)
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config: await (await import('../src/payload.config')).default })

  const email = process.env.SEED_ADMIN_EMAIL
  let user: Record<string, unknown> | undefined
  if (email) {
    user = (await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true })).docs[0] as unknown as Record<string, unknown> | undefined
    if (!user) throw new Error('SEED_ADMIN_EMAIL does not match an existing user')
    if (user.role !== 'platformAdmin') throw new Error('SEED_ADMIN_EMAIL must be a platformAdmin')
  } else {
    user = (await payload.create({
      collection: 'users',
      data: {
        email: `seeder-${Date.now().toString(36)}@sample.invalid`,
        password: randomBytes(24).toString('base64url'),
        name: 'Sample seeder',
        role: 'platformAdmin',
        offices: [],
      },
    })) as unknown as Record<string, unknown>
  }
  const res = await applySeeds(payload as unknown as Cms, { user: { ...user, collection: 'users' } })
  console.log(JSON.stringify(res))
}

main().then(() => process.exit(0), (e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
