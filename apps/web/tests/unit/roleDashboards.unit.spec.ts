import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DashboardView } from '../../src/admin/EditorDashboard/DashboardView'
import type { QueueResult } from '../../src/governance/dashboardData'
import { deskFor, type BoardItem } from '../../src/governance/roleBoards'

const q = (
  key: QueueResult['key'],
  title: string,
  total = 0,
  titles: string[] = [],
): QueueResult => ({
  key,
  title,
  help: `${title} help`,
  total,
  partial: false,
  items: titles.map((t, i) => ({
    collection: 'notices',
    collectionLabel: 'Notices',
    id: i + 1,
    title: t,
    updatedAt: '2026-11-10T08:00:00.000Z',
    href: `/admin/collections/notices/${i + 1}`,
  })),
})

const prog = (over: Partial<BoardItem> = {}): BoardItem => ({
  collection: 'programmes',
  id: 5,
  name: 'Software Engineering',
  stage: 'draft',
  verified: false,
  sentBackNote: null,
  updatedAt: '2026-11-10T08:00:00.000Z',
  href: '/admin/collections/programmes/5',
  coordinators: [],
  ...over,
})

const render = (props: Parameters<typeof DashboardView>[0]) =>
  renderToStaticMarkup(createElement(DashboardView, props))

describe('which dashboard each person gets (slice 3am)', () => {
  it('is decided by role, and a coordinator is an Editor with programmes', () => {
    expect(deskFor({ id: 1, role: 'platformAdmin' })).toBe('control')
    expect(deskFor({ id: 1, role: 'siteManager' })).toBe('control')
    expect(deskFor({ id: 1, role: 'auditor' })).toBe('readonly')
    expect(deskFor({ id: 1, role: 'approver' })).toBe('head')
    expect(deskFor({ id: 1, role: 'editor' })).toBe('desk')
    expect(deskFor({ id: 1, role: 'editor', programmes: [5] })).toBe('coordinator')
    expect(deskFor({ id: 1, role: 'contributor' })).toBe('contributor')
  })

  it('the five screens are built differently, not the same grid with other lists', () => {
    const queues = [q('review', 'Waiting for review', 1, ['A notice']), q('myDrafts', 'My drafts')]
    const roots = (
      ['control', 'readonly', 'head', 'coordinator', 'desk', 'contributor'] as const
    ).map((desk) => render({ queues, desk, board: [prog()] }).match(/class="rd rd--(\w+)"/)?.[1])
    // control and readonly share the control room on purpose; everyone else has a layout of their own.
    expect(roots).toEqual(['control', 'control', 'head', 'coordinator', 'desk', 'desk'])
    expect(render({ queues, desk: 'control' })).toContain('<dl>')
    expect(render({ queues, desk: 'head' })).toContain('Your tray')
    expect(render({ queues, desk: 'coordinator', board: [prog()] })).toContain('rd__steps')
    expect(render({ queues, desk: 'desk' })).toContain('rd__columns')
  })
})

describe('control room (admin, site manager, auditor)', () => {
  const queues = [
    q('review', 'Waiting for review', 3, ['One', 'Two', 'Three']),
    q('toPublish', 'Approved, ready to publish', 1, ['Four']),
    q('stale', 'Needs a fresh check', 2),
  ]
  it('puts decisions first, the upkeep lists folded, and every count in a rail', () => {
    const html = render({ queues, desk: 'control' })
    expect(html).toContain('Needs a decision')
    expect(html.indexOf('Waiting for review')).toBeLessThan(html.indexOf('Needs a fresh check'))
    expect(html).toContain('<details>')
    expect(html).toContain('<dt>Needs a fresh check</dt><dd>2</dd>')
  })
  it('an auditor is not told something needs their decision', () => {
    const html = render({ queues, desk: 'readonly' })
    expect(html).toContain('Everything in progress')
    expect(html).not.toContain('Needs a decision')
  })
})

describe('head of department: a tray and a department board', () => {
  const board = [
    prog({
      collection: 'departments',
      id: 4,
      name: 'Computer Science',
      stage: 'published',
      href: '/d/4',
    }),
    prog({
      id: 5,
      name: 'Software Engineering',
      stage: 'in_review',
      coordinators: ['Dr Ali', 'Ms Noor'],
    }),
    prog({ id: 6, name: 'AI', stage: 'approved', verified: false }),
  ]
  const html = render({
    queues: [q('review', 'Waiting for your review', 1, ['Software Engineering'])],
    desk: 'head',
    board,
  })
  it('lists the tray and the department with coordinators and where each page is', () => {
    expect(html).toContain('Your tray')
    expect(html).toContain('Department page')
    expect(html).toContain('Dr Ali, Ms Noor')
    expect(html).toContain('rd__chip--in_review">Sent to you')
    expect(html).toContain('rd__chip--published">Live')
    expect(html).toContain('mark it verified')
  })
  it('says an empty tray is empty, and an empty department is unassigned', () => {
    const e = render({ queues: [q('review', 'Waiting for your review')], desk: 'head', board: [] })
    expect(e).toContain('Your tray is empty')
    expect(e).toContain('No department or programme pages are assigned to you yet')
  })
})

describe('coordinator: one programme and its four steps', () => {
  const at = (b: Partial<BoardItem>) =>
    render({ queues: [], desk: 'coordinator', board: [prog(b)] })
  const current = (html: string) =>
    html.match(/<li data-state="now" aria-current="step">([^<]+)</)?.[1]

  it('marks the step the page is at, for every stage', () => {
    expect(current(at({ stage: 'draft' }))).toBe('Draft')
    expect(current(at({ stage: 'in_review' }))).toBe('With your head')
    expect(current(at({ stage: 'approved', verified: true }))).toBe('Approved')
    expect(current(at({ stage: 'published' }))).toBe('Live')
    expect((at({ stage: 'in_review' }).match(/data-state="done"/g) ?? []).length).toBe(1)
  })

  it('offers Publish only when the head approved and verified, and says what is missing otherwise', () => {
    expect(at({ stage: 'approved', verified: true })).toContain('Open it and press Publish')
    const waiting = at({ stage: 'approved', verified: false })
    expect(waiting).not.toContain('press Publish')
    expect(waiting).toContain('has not marked it verified')
  })

  it('shows the head’s reason when a draft was sent back, and not otherwise; and escapes it', () => {
    const back = at({ stage: 'draft', sentBackNote: '<b>Add the fee</b>' })
    expect(back).toContain('Edit and send again')
    expect(back).toContain('&lt;b&gt;Add the fee')
    expect(back).not.toContain('<b>Add')
    expect(at({ stage: 'draft' })).not.toContain('rd__sentback')
    expect(at({ stage: 'in_review', sentBackNote: 'old' })).not.toContain('rd__sentback')
  })

  it('tells a coordinator with no programme what to do', () => {
    expect(render({ queues: [], desk: 'coordinator', board: [] })).toContain(
      'Ask your head of department',
    )
  })
})

describe('writing desk', () => {
  const queues = [
    q('sentBack', 'Sent back to me'),
    q('myDrafts', 'My drafts', 1, ['Draft one']),
    q('sentByMe', 'I sent for review'),
  ]
  it('an editor has three columns, a contributor has no "sent for review" column', () => {
    expect(render({ queues, desk: 'desk' })).toContain('I sent for review')
    const c = render({ queues, desk: 'contributor' })
    expect(c).not.toContain('I sent for review')
    expect(c).toContain('Draft one')
  })
})
