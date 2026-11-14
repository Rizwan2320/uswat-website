/**
 * CMS-02 over EVERY collection and global in the config, not a sample.
 * Calls the real access functions with a request from each role (and from nobody) and compares
 * with the table in docs/briefs/p3b-collections-and-staff-access.md. A collection that is not in
 * the table fails the test: new collections must be given a rule on purpose.
 */
import type { Access, CollectionConfig, GlobalConfig, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import config from '../../src/payload.config'
import { ROLES, type Role } from '../../src/governance/roles'

type Who = Role | 'anonymous'
const ALL: Who[] = [...ROLES, 'anonymous']
const STAFF: Who[] = ROLES.filter((r) => r !== 'auditor')
const ADMINS: Who[] = ['platformAdmin', 'siteManager']
const REVIEWERS: Who[] = ['platformAdmin', 'siteManager', 'approver']

interface Rule {
  read?: Who[]
  create?: Who[]
  update?: Who[]
  delete?: Who[]
}
const NOBODY: Who[] = []

// Delete is STAFF at the access layer because the policy hook decides (slice 3q): a draft that was
// never published may be deleted by whoever may edit it; anything else only by an admin. The
// per-stage rules are proven in governance.access.int.spec.ts.
const governed: Rule = { create: STAFF, update: STAFF, delete: STAFF }
const adminsWrite: Rule = { create: ADMINS, update: ADMINS, delete: ADMINS }

const COLLECTIONS: Record<string, Rule> = {
  pages: governed,
  posts: governed,
  'affiliated-colleges': governed,
  'merit-lists': governed,
  'contact-directory': governed,
  'article-tags': governed,
  notices: governed,
  events: governed,
  jobs: governed,
  tenders: governed,
  faculties: governed,
  departments: governed,
  programmes: governed,
  offices: governed,
  campuses: governed,
  people: governed,
  users: { create: ['platformAdmin'], delete: ['platformAdmin'], update: [...ROLES] },
  'audit-logs': {
    read: ['platformAdmin', 'siteManager', 'auditor'],
    create: NOBODY,
    update: NOBODY,
    delete: NOBODY,
  },
  categories: { read: ALL, ...adminsWrite },
  media: { read: ALL, create: STAFF, update: REVIEWERS, delete: ADMINS },
  redirects: adminsWrite,
  forms: adminsWrite,
  'form-submissions': {
    read: ['platformAdmin', 'siteManager', 'auditor'],
    create: ALL,
    update: NOBODY,
    delete: ['platformAdmin'],
  },
  'payload-folders': { create: STAFF, update: REVIEWERS, delete: ADMINS }, // media folders
  search: { create: NOBODY, update: NOBODY, delete: NOBODY },
}
const GLOBALS: Record<string, Rule> = {
  header: { read: ALL, update: ADMINS },
  footer: { read: ALL, update: ADMINS },
  // Written by Payload on every job run; operators only.
  'payload-jobs-stats': { read: ADMINS, update: NOBODY },
}
/** Payload's own bookkeeping; per-user or system, not editorial content. */
const INTERNAL = new Set([
  'payload-locked-documents',
  'payload-preferences',
  'payload-migrations',
  'payload-jobs',
  'payload-kv',
])

const reqFor = (who: Who, cfg: unknown): PayloadRequest =>
  ({
    payloadAPI: 'REST',
    payload: { config: cfg },
    user:
      who === 'anonymous'
        ? null
        : { id: 1, collection: 'users', role: who, offices: ['registrar'] },
  }) as unknown as PayloadRequest

async function allowed(access: Access | undefined, who: Who, cfg: unknown): Promise<boolean> {
  if (!access) return who !== 'anonymous' // Payload's default: signed in
  const result = await access({ req: reqFor(who, cfg), id: 1, data: {} } as never)
  return result !== false
}

const cfgPromise = Promise.resolve(config)

describe('CMS-02 role matrix over every collection and global', () => {
  it('every collection and global has an expected rule', async () => {
    const cfg = await cfgPromise
    const unknown = [
      ...cfg.collections.map((c) => c.slug).filter((s) => !(s in COLLECTIONS) && !INTERNAL.has(s)),
      ...(cfg.globals ?? []).map((g) => g.slug).filter((s) => !(s in GLOBALS)),
    ]
    expect(unknown, 'add a rule to the table in this test and in the brief').toEqual([])
  })

  it('collections', async () => {
    const cfg = await cfgPromise
    const wrong: string[] = []
    for (const c of cfg.collections as CollectionConfig[]) {
      const rule = COLLECTIONS[c.slug]
      if (!rule) continue
      for (const action of ['read', 'create', 'update', 'delete'] as const) {
        const expected = rule[action]
        if (!expected) continue
        for (const who of ALL) {
          const got = await allowed(c.access?.[action] as Access | undefined, who, cfg)
          if (got !== expected.includes(who))
            wrong.push(`${c.slug}.${action} as ${who}: got ${got}, expected ${!got}`)
        }
      }
    }
    expect(wrong).toEqual([])
  })

  it('globals', async () => {
    const cfg = await cfgPromise
    const wrong: string[] = []
    for (const g of (cfg.globals ?? []) as GlobalConfig[]) {
      const rule = GLOBALS[g.slug]
      if (!rule) continue
      for (const action of ['read', 'update'] as const) {
        const expected = rule[action]
        if (!expected) continue
        for (const who of ALL) {
          const got = await allowed(g.access?.[action] as Access | undefined, who, cfg)
          if (got !== expected.includes(who))
            wrong.push(`${g.slug}.${action} as ${who}: got ${got}, expected ${!got}`)
        }
      }
    }
    expect(wrong).toEqual([])
  })
})
