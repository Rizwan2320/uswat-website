import React from 'react'

import type { OperationsData, SweepRun } from '../../governance/operations'

import './index.scss'

const stamp = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : `${d.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

const STATE_LABEL = { ok: 'On schedule', late: 'Late', failed: 'Failed', never: 'Not run yet' } as const

function RunLine({ run }: { run: SweepRun }): React.ReactElement {
  if (!run.reportReadable)
    return <p className="operations__muted">The report of this run could not be read.</p>
  return (
    <>
      <p>
        Published {run.published}, archived {run.archived}, marked for a fresh check {run.markedStale},
        left alone {run.skipped}.
        {run.truncated ? ' More were due than one run handles; the next run continues.' : ''}
      </p>
      {run.skippedReasons.length > 0 ? (
        <ul className="operations__reasons">
          {run.skippedReasons.slice(0, 5).map((r) => (
            <li key={r}>{r}</li>
          ))}
          {run.skippedReasons.length > 5 ? <li>and {run.skippedReasons.length - 5} more</li> : null}
        </ul>
      ) : null}
    </>
  )
}

/** Presentational and synchronous, so it can be rendered in a test. English only (like the dashboard). */
export function OperationsView({ data }: { data: OperationsData }): React.ReactElement {
  const { sweep, offices, officesPartial, imagesWithoutAlt } = data
  return (
    <section className="operations" aria-label="Operations">
      <h2 className="operations__title">Operations</h2>
      <p className="operations__muted">
        For the people who run the site. Read only. Updated {stamp(data.generatedAt)}.
      </p>
      <div className="operations__grid">
        <div className="operations__card" data-testid="operations-sweep">
          <h3>
            Automatic upkeep{' '}
            <span className={`operations__badge operations__badge--${sweep.state}`}>
              {STATE_LABEL[sweep.state]}
            </span>
          </h3>
          <p role={sweep.state === 'ok' ? undefined : 'alert'} className={sweep.state === 'ok' ? undefined : 'operations__warn'}>
            {sweep.message}
          </p>
          {sweep.last ? (
            <>
              <p className="operations__muted">Last run finished {stamp(sweep.last.at)}.</p>
              <RunLine run={sweep.last} />
            </>
          ) : null}
          <p className="operations__muted">
            Last 24 hours: {sweep.last24h.runs} run{sweep.last24h.runs === 1 ? '' : 's'}
            {sweep.last24h.failures ? `, ${sweep.last24h.failures} failed` : ''}; published{' '}
            {sweep.last24h.published}, archived {sweep.last24h.archived}, marked for a fresh check{' '}
            {sweep.last24h.markedStale}. Scheduled to run at minute 17 of every hour.
          </p>
        </div>

        <div className="operations__card" data-testid="operations-offices">
          <h3>Work waiting, by office</h3>
          {officesPartial ? (
            <p role="alert" className="operations__warn">
              Some content could not be counted in full, so these numbers may be too low.
            </p>
          ) : null}
          {offices.length === 0 ? (
            <p className="operations__muted">Nothing is waiting.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Office</th>
                  <th scope="col">Drafts</th>
                  <th scope="col">In review</th>
                  <th scope="col">Needs a fresh check</th>
                  <th scope="col">Ending soon</th>
                </tr>
              </thead>
              <tbody>
                {offices.map((o) => (
                  <tr key={o.office}>
                    <th scope="row">{o.office}</th>
                    <td>{o.drafts}</td>
                    <td>{o.inReview}</td>
                    <td>{o.stale}</td>
                    <td>{o.expiringSoon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="operations__muted">
            Counts the latest saved version of each item. Archived items are left out.
          </p>
        </div>

        <div className="operations__card" data-testid="operations-other">
          <h3>Other checks</h3>
          <p>
            Images without alt text:{' '}
            <strong>{imagesWithoutAlt === null ? 'could not be counted' : imagesWithoutAlt}</strong>
          </p>
          <p className="operations__muted">
            Last import, broken links and snapshots: not recorded in the CMS, so not shown here.
          </p>
        </div>
      </div>
    </section>
  )
}
