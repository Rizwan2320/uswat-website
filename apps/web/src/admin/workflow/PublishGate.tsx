'use client'

import { PublishButton, useAuth, useField } from '@payloadcms/ui'
import React from 'react'

import {
  actorFromUser,
  type RiskClass,
  type VerificationStatus,
  type WorkflowStatus,
} from '../../governance/roles'
import { workflowView } from './rules'

/**
 * Payload's Publish button, shown only when the role may publish this item (slice 3aa).
 * Everyone else sees no Publish at all, instead of a button the policy refuses after the click.
 */
export function PublishGate(): React.ReactElement | null {
  const { user } = useAuth()
  const stage = useField<WorkflowStatus>({ path: 'governance.status' })
  const verification = useField<VerificationStatus>({ path: 'governance.verificationStatus' })
  const risk = useField<RiskClass>({ path: 'governance.riskClass' })
  const owner = useField<string>({ path: 'governance.ownerOffice' })
  if (!user) return null
  const view = workflowView({
    actor: actorFromUser(user as never),
    stage: stage.value ?? 'draft',
    verification: verification.value ?? 'unverified',
    risk: risk.value ?? 'standard',
    ownerOffice: owner.value ?? null,
    saved: true,
    mine: true,
  })
  return view.showPublish ? <PublishButton /> : null
}

export default PublishGate
