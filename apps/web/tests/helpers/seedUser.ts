import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })
  const data = { ...testUser, role: 'platformAdmin' as const }

  // Reuse an existing test user: the last platform admin cannot be deleted.
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: testUser.email } },
    limit: 1,
  })
  if (existing.docs[0]) {
    await payload.update({ collection: 'users', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'users', data })
  }
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  try {
    await payload.delete({
      collection: 'users',
      where: { email: { equals: testUser.email } },
    })
  } catch {
    // The last platform admin is protected on purpose; leave the account in a test database.
  }
}
