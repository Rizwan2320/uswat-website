import type { ServerProps } from 'payload'
import React from 'react'

import { loadDashboard } from '../../governance/dashboardData'
import { DashboardView } from './DashboardView'

/** Shown above the collection list on the admin home page (CMS-09). */
export default async function EditorDashboard({ payload, user }: ServerProps) {
  if (!user) return null
  const queues = await loadDashboard(payload, user as never)
  const name =
    typeof (user as { name?: unknown }).name === 'string' ? (user as { name: string }).name : null
  return <DashboardView queues={queues} name={name} />
}
