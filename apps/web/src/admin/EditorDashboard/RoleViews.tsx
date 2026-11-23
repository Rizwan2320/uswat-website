/**
 * One dashboard per kind of person (slice 3am). They share data, not layout: the admin works a
 * table, a head works a tray beside a department board, a coordinator looks at one programme and
 * how far it has got, an editor works a desk of three columns. Presentational and synchronous so
 * they can be rendered in a test.
 */

import React from 'react'

import type { QueueResult } from '../../governance/dashboardData'
import type { BoardItem, BoardStage } from '../../governance/roleBoards'

const day = (iso: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

const queue = (qs: QueueResult[], key: QueueResult['key']): QueueResult | undefined =>
  qs.find((q) => q.key === key)

/** A short list of links, or one honest line when there is nothing. */
function Rows({ q, empty }: { q: QueueResult | undefined; empty: string }): React.ReactElement {
  if (!q || q.items.length === 0) return <p className="rd__empty">{empty}</p>
  return (
    <ul className="rd__rows">
      {q.items.map((i) => (
        <li key={`${i.collection}-${i.id}`}>
          <a href={i.href}>{i.title}</a>
          <span className="rd__meta">
            {i.collectionLabel}
            {day(i.updatedAt) ? `, ${day(i.updatedAt)}` : ''}
          </span>
        </li>
      ))}
      {q.total > q.items.length ? (
        <li className="rd__more">and {q.total - q.items.length} more</li>
      ) : null}
    </ul>
  )
}

/* ------------------------------------------------------------------ admin, site manager, auditor */

export function ControlRoom({
  queues,
  readOnly,
}: {
  queues: QueueResult[]
  readOnly: boolean
}): React.ReactElement {
  const decide = [queue(queues, 'review'), queue(queues, 'toPublish')].filter(
    Boolean,
  ) as QueueResult[]
  const rest = queues.filter((q) => !decide.includes(q))
  return (
    <div className="rd rd--control">
      <div className="rd__main">
        <h2 className="rd__title">{readOnly ? 'Everything in progress' : 'Needs a decision'}</h2>
        {decide.map((q) => (
          <section key={q.key} className="rd__block" aria-labelledby={`rd-${q.key}`}>
            <h3 id={`rd-${q.key}`}>
              {q.title} <span className="rd__count">{q.total}</span>
            </h3>
            <Rows q={q} empty="Nothing waiting." />
          </section>
        ))}
        {rest.length > 0 ? (
          <div className="rd__fold">
            {rest.map((q) => (
              <details key={q.key}>
                <summary>
                  {q.title} <span className="rd__count">{q.total}</span>
                </summary>
                <p className="rd__help">{q.help}</p>
                <Rows q={q} empty="Nothing here." />
              </details>
            ))}
          </div>
        ) : null}
      </div>
      <aside className="rd__rail" aria-label="Counts">
        <dl>
          {queues.map((q) => (
            <div key={q.key}>
              <dt>{q.title}</dt>
              <dd>{q.total}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  )
}

/* ------------------------------------------------------------------------------------- head */

const HEAD_STAGE: Record<BoardStage, string> = {
  draft: 'Draft',
  in_review: 'Sent to you',
  approved: 'Approved',
  published: 'Live',
  archived: 'Offline',
}

export function HeadDesk({
  queues,
  board,
}: {
  queues: QueueResult[]
  board: BoardItem[]
}): React.ReactElement {
  const review = queue(queues, 'review')
  const ready = queue(queues, 'toPublish')
  return (
    <div className="rd rd--head">
      <div className="rd__main">
        <h2 className="rd__title">
          Your tray <span className="rd__count">{review?.total ?? 0}</span>
        </h2>
        <p className="rd__help">
          {review?.help ?? 'Sent to you by your coordinators and editors.'}
        </p>
        <Rows q={review} empty="Your tray is empty. Nothing is waiting for you." />
        {ready && ready.total > 0 ? (
          <section className="rd__block" aria-labelledby="rd-ready">
            <h3 id="rd-ready">
              {ready.title} <span className="rd__count">{ready.total}</span>
            </h3>
            <Rows q={ready} empty="" />
          </section>
        ) : null}
      </div>
      <section className="rd__rail rd__board" aria-labelledby="rd-board">
        <h2 id="rd-board">Your department</h2>
        {board.length === 0 ? (
          <p className="rd__empty">No department or programme pages are assigned to you yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Page</th>
                <th scope="col">Coordinator</th>
                <th scope="col">Where it is</th>
              </tr>
            </thead>
            <tbody>
              {board.map((b) => (
                <tr key={`${b.collection}-${b.id}`}>
                  <th scope="row">
                    <a href={b.href}>{b.name}</a>
                    <span className="rd__meta">
                      {b.collection === 'departments' ? 'Department page' : 'Programme'}
                    </span>
                  </th>
                  <td>{b.coordinators.length > 0 ? b.coordinators.join(', ') : '-'}</td>
                  <td>
                    <span className={`rd__chip rd__chip--${b.stage}`}>{HEAD_STAGE[b.stage]}</span>
                    {b.stage === 'approved' && !b.verified ? (
                      <span className="rd__meta">mark it verified</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------------------ coordinator */

const STEPS = ['Draft', 'With your head', 'Approved', 'Live'] as const

function stepOf(b: BoardItem): number {
  switch (b.stage) {
    case 'in_review':
      return 1
    case 'approved':
      return 2
    case 'published':
      return 3
    default:
      return 0
  }
}

function nowAndNext(b: BoardItem): { now: string; action: string; href: string | null } {
  switch (b.stage) {
    case 'in_review':
      return {
        now: 'Your head of department has it. You will see it here when it is approved.',
        action: 'View the page',
        href: b.href,
      }
    case 'approved':
      return b.verified
        ? {
            now: 'Your head approved and verified it. It is yours to publish.',
            action: 'Open it and press Publish',
            href: b.href,
          }
        : {
            now: 'Your head approved it and has not marked it verified yet. Publish appears when they do.',
            action: 'View the page',
            href: b.href,
          }
    case 'published':
      return {
        now: 'Live on the website. Changes you make go to your head again before they are live.',
        action: 'Edit the page',
        href: b.href,
      }
    case 'archived':
      return {
        now: 'Offline. Edit it and send it to your head to bring it back.',
        action: 'Edit the page',
        href: b.href,
      }
    default:
      return b.sentBackNote
        ? {
            now: 'Your head sent this back. Fix what they asked for, then send it again.',
            action: 'Edit and send again',
            href: b.href,
          }
        : {
            now: 'Your draft. It saves by itself. Send it to your head when it is ready.',
            action: 'Edit the draft',
            href: b.href,
          }
  }
}

export function CoordinatorDesk({ board }: { board: BoardItem[] }): React.ReactElement {
  if (board.length === 0) {
    return (
      <div className="rd rd--coordinator">
        <h2 className="rd__title">Your programme</h2>
        <p className="rd__empty">
          No programme is assigned to you yet. Ask your head of department to add one to your
          account.
        </p>
      </div>
    )
  }
  return (
    <div className="rd rd--coordinator">
      {board.map((b) => {
        const at = stepOf(b)
        const next = nowAndNext(b)
        return (
          <section
            key={`${b.collection}-${b.id}`}
            className="rd__programme"
            aria-labelledby={`rd-p-${b.id}`}
          >
            <h2 id={`rd-p-${b.id}`} className="rd__title">
              {b.name}
            </h2>
            <ol className="rd__steps" aria-label="Where this page is">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  data-state={i < at ? 'done' : i === at ? 'now' : 'next'}
                  aria-current={i === at ? 'step' : undefined}
                >
                  {label}
                </li>
              ))}
            </ol>
            {b.sentBackNote && b.stage === 'draft' ? (
              <blockquote className="rd__sentback">
                <p>{b.sentBackNote}</p>
                <footer>Your head of department, when sending it back</footer>
              </blockquote>
            ) : null}
            <p className="rd__now">{next.now}</p>
            {next.href ? (
              <a className="rd__action" href={next.href}>
                {next.action}
              </a>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

/* --------------------------------------------------------------------- editor, contributor */

export function WritingDesk({
  queues,
  canSend,
}: {
  queues: QueueResult[]
  canSend: boolean
}): React.ReactElement {
  const cols: Array<{ key: QueueResult['key']; empty: string }> = [
    { key: 'sentBack', empty: 'Nothing was sent back.' },
    { key: 'myDrafts', empty: 'No drafts. Start one from the menu.' },
    ...(canSend
      ? [{ key: 'sentByMe' as const, empty: 'Nothing is waiting for your approver.' }]
      : []),
  ]
  const expiring = queue(queues, 'expiring')
  return (
    <div className="rd rd--desk">
      <h2 className="rd__title">Your desk</h2>
      <div className="rd__columns">
        {cols.map(({ key, empty }) => {
          const q = queue(queues, key)
          if (!q) return null
          return (
            <section
              key={key}
              className={`rd__column rd__column--${key}`}
              aria-labelledby={`rd-${key}`}
            >
              <h3 id={`rd-${key}`}>
                {q.title} <span className="rd__count">{q.total}</span>
              </h3>
              <p className="rd__help">{q.help}</p>
              <Rows q={q} empty={empty} />
            </section>
          )
        })}
      </div>
      {expiring && expiring.total > 0 ? (
        <section className="rd__block" aria-labelledby="rd-expiring">
          <h3 id="rd-expiring">
            {expiring.title} <span className="rd__count">{expiring.total}</span>
          </h3>
          <Rows q={expiring} empty="" />
        </section>
      ) : null}
    </div>
  )
}
