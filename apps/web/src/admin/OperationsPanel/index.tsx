import type { ServerProps } from 'payload'
import React from 'react'

import { loadOperations } from '../../governance/operations'
import { OperationsView } from './OperationsView'

/**
 * Shown on the admin home page under the editor dashboard, for platform admin, site manager and
 * auditor only (slice 3t). Read-only. Anyone else gets nothing, and the data is not loaded.
 */
export default async function OperationsPanel({ payload, user }: ServerProps) {
  if (!user) return null
  const data = await loadOperations(payload, user as never)
  if (!data) return null
  return <OperationsView data={data} />
}
