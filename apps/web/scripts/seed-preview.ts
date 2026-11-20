/**
 * One command for the preview build (ADR-0026): the test accounts, then every Sample seed, as the owner account.
 *   pnpm seed:preview
 * Allowed on this machine, or on a hosted database only behind the three locks in `assertSeedTarget`. On Vercel a
 * refusal or a failure prints one clear line and exits 0 so Sample data never fails a build (and a production build only
 * ever prints the refusal); on this machine it exits 1. Nothing here prints a password.
 */
import { applyAllSeeds } from '../../../scripts/import/seeds/all'
import { runFromEnv } from '../../../scripts/import/seeds/pool'
import { assertSeedTarget, type Cms } from '../../../scripts/import/writer'

import { ACCOUNTS, ensureAccounts } from './seed-accounts'
import { renderPng } from './renderPng'

async function main(): Promise<void> {
  const route = assertSeedTarget(process.env.DATABASE_URL, process.env)
  try {
    const { getPayload } = await import('payload')
    const payload = await getPayload({ config: await (await import('../src/payload.config')).default })
    const accounts = await ensureAccounts(payload, process.env)
    const owner = ACCOUNTS[0].email
    const found = await payload.find({ collection: 'users', where: { email: { equals: owner } }, limit: 1, depth: 0, overrideAccess: true })
    const user = found.docs[0] as unknown as Record<string, unknown> | undefined
    if (!user) {
      console.log(JSON.stringify({ seeded: false, reason: `${owner} does not exist (set SEED_PASSWORD_OWNER)`, accounts }))
      return
    }
    const seeds = await applyAllSeeds(payload as unknown as Cms, { user: { ...user, collection: 'users' } }, renderPng, Date.now(), runFromEnv(process.env))
    console.log(JSON.stringify({ seeded: true, route, accounts, seeds }))
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (route === 'preview') {
      console.log(JSON.stringify({ seeded: false, reason: `seed failed: ${message}` }))
      return
    }
    throw e
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    // On Vercel (any environment) a refused target is a clear, harmless line, never a failed build; on this machine it fails.
    console.error(e instanceof Error ? e.message : e)
    process.exit(process.env.VERCEL_ENV ? 0 : 1)
  },
)
