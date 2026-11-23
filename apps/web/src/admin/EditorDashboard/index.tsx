import type { ServerProps } from 'payload'
import React from 'react'

import { loadDashboard } from '../../governance/dashboardData'
import { deskFor, loadBoard } from '../../governance/roleBoards'
import { DashboardView } from './DashboardView'

/** Shown above the collection list on the admin home page (CMS-09). */
export default async function EditorDashboard({ payload, user }: ServerProps) {
  if (!user) return null
  const desk = deskFor(user as never)
  const [queues, board] = await Promise.all([
    desk === 'coordinator' ? Promise.resolve([]) : loadDashboard(payload, user as never),
    loadBoard(payload, user as never),
  ])
  const name =
    typeof (user as { name?: unknown }).name === 'string' ? (user as { name: string }).name : null
  return <DashboardView queues={queues} name={name} desk={desk} board={board} />
}
