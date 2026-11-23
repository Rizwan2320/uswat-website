import type { CollectionConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { withGovernance } from '../../src/governance/fields'

describe('Payload’s own publish controls (3an)', () => {
  it('both Publish and Unpublish are replaced, so the only controls are the ones in the status box', () => {
    const base: CollectionConfig = { slug: 'notices', fields: [] }
    const config = withGovernance(base, [])
    const edit = config.admin?.components?.edit as Record<string, unknown>
    expect(edit.PublishButton).toBe('@/admin/workflow/PublishGate')
    expect(edit.UnpublishButton).toBe('@/admin/workflow/PublishGate')
  })
})
