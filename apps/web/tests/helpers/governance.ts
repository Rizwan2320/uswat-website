import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'
import type { Page, User } from '../../src/payload-types'
import type { Role } from '../../src/governance/roles'

export const run = Date.now().toString(36)
export const PASSWORD = 'correct-horse-battery-staple'

let counter = 0
export const uniq = (label = 'x') => `${label}-${run}-${++counter}`

export const getTestPayload = async (): Promise<Payload> => getPayload({ config: await config })

/** Create a user as trusted server code (the system), with an explicit role and offices. */
export async function makeUser(
  payload: Payload,
  role: Role,
  offices: string[] = [],
): Promise<User> {
  return payload.create({
    collection: 'users',
    data: {
      email: `${uniq(role)}@example.test`,
      password: PASSWORD,
      name: `${role} (test)`,
      role,
      offices,
    },
  })
}

/** Options that make a Local API call behave like a request from this user (access enforced). */
export const as = (user: User) => ({
  user: { ...user, collection: 'users' as const },
  overrideAccess: false as const,
  context: { disableRevalidate: true },
})

/** Trusted server code: no user, access not enforced. */
export const system = { context: { disableRevalidate: true } }

export const cta = [{ blockType: 'cta' as const, richText: null, links: [] }]

export type Gov = NonNullable<Page['governance']>

export const pageData = (governance: Partial<Gov> = {}, title = uniq('page')) => ({
  title,
  layout: cta,
  governance: {
    ownerOffice: 'Registrar',
    source: 'https://example.test/circular-12',
    ...governance,
  },
})

/** True when the call is allowed, false when it throws (access or policy). */
export async function can(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn()
    return true
  } catch {
    return false
  }
}

/** The policy code from a refused write, or the error name for anything else. */
export async function refusal(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn()
    return null
  } catch (e) {
    const err = e as { data?: { code?: string }; name?: string }
    return err.data?.code ?? err.name ?? 'ERROR'
  }
}
