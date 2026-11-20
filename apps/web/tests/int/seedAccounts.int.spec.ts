// @vitest-environment node
/**
 * The Sample test accounts on a real database (ADR-0026). Needs a local PostgreSQL.
 * Created only if missing; a missing password variable skips that account; an existing user is never touched.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { ACCOUNTS, ensureAccounts } from '../../scripts/seed-accounts'
import { getTestPayload } from '../helpers/governance'

let payload: Payload
const emails = ACCOUNTS.map((a) => a.email)
const env = { SEED_PASSWORD_OWNER: 'Owner-pw-for-test-1!', SEED_PASSWORD_APPROVER: 'Approver-pw-for-test-1!', SEED_PASSWORD_EDITOR: 'Editor-pw-for-test-1!' }

const users = () => payload.find({ collection: 'users', where: { email: { in: emails } }, limit: 10, depth: 0, overrideAccess: true })

beforeAll(async () => {
  payload = await getTestPayload()
  for (const u of (await users()).docs) await payload.delete({ collection: 'users', id: u.id, overrideAccess: true })
}, 60_000)

describe('seed accounts', () => {
  it('skips an account whose password variable is missing, and creates the others with the right role and office', async () => {
    const first = await ensureAccounts(payload, { SEED_PASSWORD_OWNER: env.SEED_PASSWORD_OWNER, SEED_PASSWORD_EDITOR: env.SEED_PASSWORD_EDITOR })
    expect(first.created.sort()).toEqual(['test-editor@sample.invalid', 'test-owner@sample.invalid'])
    expect(first.skipped).toEqual([{ email: 'test-approver@sample.invalid', reason: 'SEED_PASSWORD_APPROVER is not set' }])
    expect(JSON.stringify(first)).not.toContain(env.SEED_PASSWORD_OWNER)
    const by = new Map((await users()).docs.map((u) => [u.email, u as unknown as { role: string; offices: string[] }]))
    expect(by.get('test-owner@sample.invalid')?.role).toBe('platformAdmin')
    expect(by.get('test-editor@sample.invalid')).toMatchObject({ role: 'editor', offices: ['sample owner office'] })
  })

  it('creates the missing account when its variable appears, and is a no-op on the next run', async () => {
    const second = await ensureAccounts(payload, env)
    expect(second.created).toEqual(['test-approver@sample.invalid'])
    expect(second.existing.sort()).toEqual(['test-editor@sample.invalid', 'test-owner@sample.invalid'])
    const third = await ensureAccounts(payload, env)
    expect(third.created).toEqual([])
    expect(third.skipped).toEqual([])
    expect(third.existing.slice().sort()).toEqual(emails.slice().sort())
    const approver = (await users()).docs.find((u) => u.email === 'test-approver@sample.invalid') as unknown as { role: string }
    expect(approver.role).toBe('approver')
  })

  it('never changes an existing user: a different password variable does not alter the account', async () => {
    const before = (await users()).docs.find((u) => u.email === 'test-owner@sample.invalid') as unknown as { updatedAt: string }
    await ensureAccounts(payload, { SEED_PASSWORD_OWNER: 'A-completely-different-1!' })
    const after = (await users()).docs.find((u) => u.email === 'test-owner@sample.invalid') as unknown as { updatedAt: string }
    expect(after.updatedAt).toBe(before.updatedAt)
    // The original password still logs in.
    const login = await payload.login({ collection: 'users', data: { email: 'test-owner@sample.invalid', password: env.SEED_PASSWORD_OWNER } })
    expect(login.token).toBeTruthy()
  })
})
