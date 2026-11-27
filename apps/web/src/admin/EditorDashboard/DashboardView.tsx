import React from 'react'

import type { QueueResult } from '../../governance/dashboardData'
import type { BoardItem, Desk } from '../../governance/roleBoards'
import { ControlRoom, CoordinatorDesk, HeadDesk, WritingDesk } from './RoleViews'

import './index.scss'

/** Presentational and synchronous, so it can be rendered in a test. */
export function DashboardView({
  queues,
  name,
  desk = 'control',
  board = [],
}: {
  queues: QueueResult[]
  name?: string | null
  desk?: Desk
  board?: BoardItem[]
}): React.ReactElement {
  return (
    <section className={`editor-dashboard editor-dashboard--${desk}`} aria-label="Your work">
      {name ? <p className="editor-dashboard__who">{`Welcome, ${name}`}</p> : null}
      {queues.some((q) => q.partial) ? (
        <p role="alert" className="editor-dashboard__warn">
          Some lists could not be read, so a number here may be too low.
        </p>
      ) : null}
      {queues.length === 0 && (desk === 'control' || desk === 'readonly') ? (
        <p>You can read content and the audit log. There is nothing for you to edit.</p>
      ) : null}
      {desk === 'control' && queues.length > 0 ? (
        <ControlRoom queues={queues} readOnly={false} />
      ) : null}
      {desk === 'readonly' && queues.length > 0 ? <ControlRoom queues={queues} readOnly /> : null}
      {desk === 'head' ? <HeadDesk queues={queues} board={board} /> : null}
      {desk === 'coordinator' ? <CoordinatorDesk board={board} /> : null}
      {desk === 'desk' ? <WritingDesk queues={queues} canSend /> : null}
      {desk === 'contributor' ? <WritingDesk queues={queues} canSend={false} /> : null}
    </section>
  )
}
