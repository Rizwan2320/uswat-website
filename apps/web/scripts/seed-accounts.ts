/**
 * Sample test accounts (ADR-0026, brief a4-sample-content-pack). Creates each account ONLY IF MISSING, with its password
 * read from an environment variable; an account whose variable is missing is skipped. A password is never printed,
 * logged or committed, and `ensureAccounts` never touches an existing user (`resetPasswords`, run only with
 * SEED_RESET_PASSWORDS=true from the preview seed, is the one deliberate exception).
 *   SEED_PASSWORD_OWNER     -> test-owner@sample.invalid     (platformAdmin)
 *   SEED_PASSWORD_APPROVER  -> test-approver@sample.invalid  (approver, office "Sample owner office")
 *   SEED_PASSWORD_EDITOR    -> test-editor@sample.invalid    (editor,   office "Sample owner office")
 * Run alone with `pnpm seed:accounts` (same target guard as the seeds).
 */
import type { Payload } from 'payload'

import { SAMPLE_OWNER_OFFICE } from '../../../scripts/import/seeds/data'
import { assertSeedTarget } from '../../../scripts/import/writer'

export type AccountSpec = { email: string; name: string; role: 'platformAdmin' | 'approver' | 'editor'; offices: string[]; passwordVar: string }
export const ACCOUNTS: AccountSpec[] = [
  { email: 'test-owner@sample.invalid', name: 'Sample owner (test account)', role: 'platformAdmin', offices: [], passwordVar: 'SEED_PASSWORD_OWNER' },
  { email: 'test-approver@sample.invalid', name: 'Sample approver (test account)', role: 'approver', offices: [SAMPLE_OWNER_OFFICE], passwordVar: 'SEED_PASSWORD_APPROVER' },
  { email: 'test-editor@sample.invalid', name: 'Sample editor (test account)', role: 'editor', offices: [SAMPLE_OWNER_OFFICE], passwordVar: 'SEED_PASSWORD_EDITOR' },
]

export type AccountsResult = { created: string[]; existing: string[]; skipped: { email: string; reason: string }[] }

export async function ensureAccounts(payload: Payload, env: Record<string, string | undefined>): Promise<AccountsResult> {
  const out: AccountsResult = { created: [], existing: [], skipped: [] }
  for (const a of ACCOUNTS) {
    const found = await payload.find({ collection: 'users', where: { email: { equals: a.email } }, limit: 1, depth: 0, overrideAccess: true })
    if (found.docs.length) {
      out.existing.push(a.email)
      continue
    }
    const password = env[a.passwordVar]
    if (!password) {
      out.skipped.push({ email: a.email, reason: `${a.passwordVar} is not set` })
      continue
    }
    await payload.create({ collection: 'users', data: { email: a.email, password, name: a.name, role: a.role, offices: a.offices }, overrideAccess: true })
    out.created.push(a.email)
  }
  return out
}

export type ResetResult = { reset: string[]; skipped: { email: string; reason: string }[] }
/** Shortest password the reset accepts; a shorter or empty variable is skipped, never applied. */
export const MIN_RESET_PASSWORD_LENGTH = 12

/**
 * Sets the password of an EXISTING test account from its `SEED_PASSWORD_*` variable. Used only when the seed is started
 * with SEED_RESET_PASSWORDS=true, behind the same locks as every other preview seed (`assertSeedTarget`). It exists
 * because `ensureAccounts` never touches an existing user, so a person who never knew an account's password had no way
 * in. The result lists emails and reasons only; a password is never returned or logged.
 */
export async function resetPasswords(payload: Payload, env: Record<string, string | undefined>): Promise<ResetResult> {
  const out: ResetResult = { reset: [], skipped: [] }
  for (const a of ACCOUNTS) {
    const password = env[a.passwordVar]
    if (!password) {
      out.skipped.push({ email: a.email, reason: `${a.passwordVar} is not set` })
      continue
    }
    if (password.length < MIN_RESET_PASSWORD_LENGTH) {
      out.skipped.push({ email: a.email, reason: `${a.passwordVar} is shorter than ${MIN_RESET_PASSWORD_LENGTH} characters` })
      continue
    }
    const found = await payload.find({ collection: 'users', where: { email: { equals: a.email } }, limit: 1, depth: 0, overrideAccess: true })
    const user = found.docs[0]
    if (!user) {
      out.skipped.push({ email: a.email, reason: 'the account does not exist (it is created, not reset, by the normal seed)' })
      continue
    }
    await payload.update({ collection: 'users', id: user.id, data: { password }, overrideAccess: true })
    out.reset.push(a.email)
  }
  return out
}

async function main() {
  assertSeedTarget(process.env.DATABASE_URL, process.env)
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config: await (await import('../src/payload.config')).default })
  console.log(JSON.stringify(await ensureAccounts(payload, process.env)))
}

// Run only when started as a script (the tests import ensureAccounts).
if (process.argv[1]?.endsWith('seed-accounts.ts')) {
  main().then(
    () => process.exit(0),
    (e) => {
      console.error(e instanceof Error ? e.message : e)
      process.exit(1)
    },
  )
}
