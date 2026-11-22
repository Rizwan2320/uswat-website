import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DashboardView } from '../../src/admin/EditorDashboard/DashboardView'
import {
  EXPIRING_SOON_DAYS,
  QUEUE_KEYS,
  QUEUES,
  queuesFor,
  queuesForActor,
} from '../../src/governance/dashboard'
import { actorFromUser, ROLES } from '../../src/governance/roles'
import { whoAmI } from '../../src/governance/whoAmI'

const NOW = new Date('2026-11-11T00:00:00.000Z')

describe('dashboard queues', () => {
  it('shows each role only its own queues, and the auditor none', () => {
    const keys = (r: (typeof ROLES)[number]) => queuesFor(r).map((q) => q.key)
    // Editors and contributors follow their own work through review (slice 3aa).
    expect(keys('contributor')).toEqual(['sentBack', 'myDrafts', 'sentByMe', 'expiring'])
    // toPublish is role-listed for editors but shown only to a coordinator (queuesForActor).
    expect(keys('editor')).toEqual(['toPublish', 'sentBack', 'myDrafts', 'sentByMe', 'expiring'])
    // Approvers read what waits for them first, and get no author lists.
    for (const r of ['approver', 'siteManager', 'platformAdmin'] as const) {
      expect(keys(r)).toEqual(['review', 'toPublish', 'myDrafts', 'stale', 'expiring', 'needsAlt'])
    }
    expect(keys('auditor')).toEqual([])
  })

  it('has every key once, with a plain sentence of help', () => {
    expect(QUEUES.map((q) => q.key)).toEqual([...QUEUE_KEYS])
    for (const q of QUEUES) expect(q.help.endsWith('.')).toBe(true)
  })

  it('builds filters from the user and the clock', () => {
    const mine = QUEUES.find((q) => q.key === 'myDrafts')!.where({ userId: 42, now: NOW })
    expect(JSON.stringify(mine)).toContain('"governance.createdBy":{"equals":42}')
    const soon = JSON.stringify(
      QUEUES.find((q) => q.key === 'expiring')!.where({ userId: 1, now: NOW }),
    )
    expect(soon).toContain('2026-11-11T00:00:00.000Z')
    expect(soon).toContain(new Date(NOW.getTime() + EXPIRING_SOON_DAYS * 86_400_000).toISOString())
  })

  it('reads the live row for stale (the sweep marks live rows) and drafts for the rest of the governed lists', () => {
    expect(QUEUES.filter((q) => q.target === 'governed' && !q.draft).map((q) => q.key)).toEqual([
      'stale',
    ])
  })
})

describe('DashboardView', () => {
  const q = (over = {}) => ({
    key: 'myDrafts' as const,
    title: 'My drafts',
    help: 'Things you started.',
    total: 1,
    partial: false,
    items: [
      {
        collection: 'notices',
        collectionLabel: 'Notices',
        id: 7,
        title: '<img src=x onerror=alert(1)>',
        updatedAt: '2026-11-10T08:00:00.000Z',
        href: '/admin/collections/notices/7',
      },
    ],
    ...over,
  })

  it('escapes record titles (CMS content is data, not markup)', () => {
    const html = renderToStaticMarkup(
      createElement(DashboardView, { queues: [q()], name: 'A & B' }),
    )
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
    expect(html).toContain('Welcome, A &amp; B')
    expect(html).toContain('href="/admin/collections/notices/7"')
    expect(html).toContain('changed 2026-11-10')
  })

  it('says so when a list could not be read, and when a queue is empty', () => {
    const html = renderToStaticMarkup(
      createElement(DashboardView, { queues: [q({ partial: true, items: [], total: 0 })] }),
    )
    expect(html).toContain('may be too low')
    expect(html).toContain('Nothing here.')
  })

  it('handles a role with no queues', () => {
    expect(renderToStaticMarkup(createElement(DashboardView, { queues: [] }))).toContain(
      'nothing for you to edit',
    )
  })
})

describe('queues per person (slice 3ai)', () => {
  const keysOf = (a: ReturnType<typeof actorFromUser>) => queuesForActor(a).map((q) => q.key)
  it('only a coordinator among the editors gets the publish list', () => {
    const coord = actorFromUser({ id: 1, role: 'editor', offices: [], programmes: [5] })
    const plain = actorFromUser({ id: 2, role: 'editor', offices: ['x'] })
    expect(keysOf(coord)).toContain('toPublish')
    expect(keysOf(plain)).not.toContain('toPublish')
    expect(keysOf(actorFromUser({ id: 3, role: 'approver', offices: ['x'] }))).toContain(
      'toPublish',
    )
  })
})

describe('whoAmI', () => {
  it('says something different, in both languages, for every role', () => {
    const seen = new Set<string>()
    for (const role of ROLES) {
      const me = whoAmI(actorFromUser({ id: 1, role, offices: ['dcst'] }))
      expect(me.title.en.length).toBeGreaterThan(5)
      expect(me.detail.ur.length).toBeGreaterThan(10)
      expect(me.detail.ur).not.toBe(me.detail.en)
      seen.add(me.title.en)
    }
    expect(seen.size).toBe(ROLES.length)
  })
  it('names the office of a head and the programmes of a coordinator, and a coordinator is told Publish comes from the head', () => {
    expect(whoAmI(actorFromUser({ id: 1, role: 'approver', offices: ['dcst'] })).title.en).toBe(
      'You are the head of dcst',
    )
    const c = whoAmI(actorFromUser({ id: 2, role: 'editor', offices: [], programmes: [5] }), [
      'Software Engineering',
    ])
    expect(c.title.en).toBe('You are the coordinator of Software Engineering')
    expect(c.kind).toBe('coordinator')
    expect(c.detail.en).toMatch(/head approves and verifies it/)
  })
  it('says the admin has no reviewer, and the auditor changes nothing', () => {
    expect(whoAmI(actorFromUser({ id: 1, role: 'platformAdmin', offices: [] })).detail.en).toMatch(
      /No one reviews you/,
    )
    expect(whoAmI(actorFromUser({ id: 1, role: 'auditor', offices: [] })).detail.en).toMatch(
      /cannot change anything/,
    )
  })
})
