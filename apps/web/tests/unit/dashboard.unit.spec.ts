import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DashboardView } from '../../src/admin/EditorDashboard/DashboardView'
import { EXPIRING_SOON_DAYS, QUEUE_KEYS, QUEUES, queuesFor } from '../../src/governance/dashboard'
import { ROLES } from '../../src/governance/roles'

const NOW = new Date('2026-11-11T00:00:00.000Z')

describe('dashboard queues', () => {
  it('shows each role only its own queues, and the auditor none', () => {
    const keys = (r: (typeof ROLES)[number]) => queuesFor(r).map((q) => q.key)
    expect(keys('contributor')).toEqual(['myDrafts', 'expiring'])
    expect(keys('editor')).toEqual(['myDrafts', 'expiring'])
    for (const r of ['approver', 'siteManager', 'platformAdmin'] as const) {
      expect(keys(r)).toEqual([...QUEUE_KEYS])
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
