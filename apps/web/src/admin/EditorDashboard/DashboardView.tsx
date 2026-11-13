import React from 'react'

import type { QueueResult } from '../../governance/dashboardData'

import './index.scss'

const when = (iso: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

/** Presentational and synchronous, so it can be rendered in a test. */
export function DashboardView({
  queues,
  name,
}: {
  queues: QueueResult[]
  name?: string | null
}): React.ReactElement {
  return (
    <section className="editor-dashboard" aria-label="Your work">
      <h2 className="editor-dashboard__title">{name ? `Welcome, ${name}` : 'Welcome'}</h2>
      {queues.length === 0 ? (
        <p>You can read content and the audit log. There is nothing for you to edit.</p>
      ) : (
        <div className="editor-dashboard__grid">
          {queues.map((q) => (
            <div className="editor-dashboard__card" key={q.key}>
              <h3>
                {q.title} <span className="editor-dashboard__count">{q.total}</span>
              </h3>
              <p className="editor-dashboard__help">{q.help}</p>
              {q.partial ? (
                <p role="alert" className="editor-dashboard__warn">
                  Some lists could not be read, so this number may be too low.
                </p>
              ) : null}
              {q.items.length === 0 ? (
                <p className="editor-dashboard__empty">Nothing here.</p>
              ) : (
                <ul>
                  {q.items.map((i) => (
                    <li key={`${i.collection}-${i.id}`}>
                      <a href={i.href}>{i.title}</a>
                      <span className="editor-dashboard__meta">
                        {' '}
                        {i.collectionLabel}
                        {when(i.updatedAt) ? `, changed ${when(i.updatedAt)}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
