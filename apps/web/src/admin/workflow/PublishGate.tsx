'use client'

import type React from 'react'

/**
 * Replaces Payload's Publish button at the top of the screen with nothing (slice 3aa).
 * The Publish button now sits in the coloured status box (WorkflowBar), next to the other steps,
 * only for roles that may publish and only once the item is Approved, so there is one place to act
 * and it does not scroll out of sight. Everyone else never sees a Publish button.
 */
export function PublishGate(): React.ReactElement | null {
  return null
}

export default PublishGate
