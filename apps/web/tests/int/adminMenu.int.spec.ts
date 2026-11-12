// @vitest-environment node
/**
 * Menu tidiness found in a browser pass as every role (P3m-d, P3m-e): editors, approvers and
 * contributors saw Users, Redirects, Forms, Search Results, Header and Footer, none of which they can use.
 * Security is not decided here (see access.matrix.int.spec.ts); this only keeps the menu honest.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { hiddenFromEditors } from '@/governance/adminMenu'
import { ROLES } from '@/governance/roles'

import { getTestPayload } from '../helpers/governance'

let payload: Payload
const SETTINGS = ['users', 'redirects', 'forms', 'form-submissions', 'search']
const GLOBALS = ['header', 'footer']
const SEES = ['platformAdmin', 'siteManager', 'auditor']

const hiddenFor = (hidden: unknown, role: string | null): boolean =>
  typeof hidden === 'function'
    ? Boolean(hidden({ user: role ? { id: 1, collection: 'users', role, offices: [] } : null }))
    : Boolean(hidden)

describe('admin menu by role', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it.each(SETTINGS)('%s is in the menu only for admins, site managers and the auditor', (slug) => {
    const hidden = payload.collections[slug as 'users'].config.admin?.hidden
    for (const role of ROLES)
      expect(hiddenFor(hidden, role), `${slug} for ${role}`).toBe(!SEES.includes(role))
    expect(hiddenFor(hidden, null)).toBe(true)
  })

  it.each(GLOBALS)('%s is in the menu only for admins, site managers and the auditor', (slug) => {
    const hidden = payload.config.globals.find((g) => g.slug === slug)?.admin?.hidden
    for (const role of ROLES)
      expect(hiddenFor(hidden, role), `${slug} for ${role}`).toBe(!SEES.includes(role))
  })

  it('what an editor needs every day stays visible', () => {
    for (const slug of [
      'pages',
      'posts',
      'media',
      'notices',
      'events',
      'jobs',
      'tenders',
      'people',
    ]) {
      const hidden = payload.collections[slug as 'pages'].config.admin?.hidden
      expect(hiddenFor(hidden, 'editor'), slug).toBe(false)
      expect(hiddenFor(hidden, 'contributor'), slug).toBe(false)
    }
  })

  it('hiding is tidiness only: an editor is still refused by access, not just by the menu', async () => {
    const editor = { id: 1, collection: 'users', role: 'editor', offices: ['registrar'] }
    await expect(
      payload.create({
        collection: 'redirects',
        data: { from: '/x', to: { type: 'custom', url: 'https://example.test' } } as never,
        user: editor as never,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
