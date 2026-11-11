import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  consoleNotifier,
  notifyNewDraft,
  resetNotifier,
  setNotifier,
  type ReviewNotification,
} from '@/governance/notify'

const logger = { info: vi.fn() }
const run = (operation: 'create' | 'update', governance: Record<string, unknown>) =>
  notifyNewDraft({
    doc: { id: 5, governance },
    operation,
    collection: { slug: 'pages' },
    req: { payload: { logger } },
  } as unknown as Parameters<typeof notifyNewDraft>[0])

afterEach(() => {
  resetNotifier()
  logger.info.mockClear()
})

describe('notifyNewDraft (LIF-03)', () => {
  it('notifies once when the importer creates a draft', async () => {
    const sent: ReviewNotification[] = []
    setNotifier({ send: (n) => void sent.push(n) })
    await run('create', { origin: 'importer', status: 'draft', ownerOffice: 'registrar' })
    expect(sent).toEqual([
      {
        event: 'new_draft',
        collection: 'pages',
        id: 5,
        origin: 'importer',
        ownerOffice: 'registrar',
      },
    ])
  })

  it('notifies for the watcher too', async () => {
    const send = vi.fn()
    setNotifier({ send })
    await run('create', { origin: 'watcher' })
    expect(send).toHaveBeenCalledOnce()
  })

  it('stays quiet for editor-created records, updates and non-draft states', async () => {
    const send = vi.fn()
    setNotifier({ send })
    await run('create', { origin: 'editor', status: 'draft' })
    await run('update', { origin: 'importer', status: 'draft' })
    await run('create', { origin: 'importer', status: 'in_review' })
    expect(send).not.toHaveBeenCalled()
  })

  it('the demo adapter writes one log line', async () => {
    await run('create', { origin: 'watcher', ownerOffice: 'admissions' })
    expect(logger.info).toHaveBeenCalledOnce()
    expect(logger.info.mock.calls[0][0]).toContain('new watcher draft in pages #5 for admissions')
    expect(consoleNotifier).toBeDefined()
  })
})
