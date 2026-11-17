import { T } from '../components/I18n'
import PageHeader from '../components/kit/PageHeader'
import Pagination from '../components/kit/Pagination'

import styles from './Articles.module.css'
import { TYPES, type ArticleType } from './config'
import { formatDate, formatDateTime } from './format'
import { listingHref, type ListingParams } from './params'
import type { ListItem, Listing } from './queries'

/* T6 card list: the same layout for News, Notices, Events, Jobs and Tenders. Plain links and a GET form,
   so it works without JavaScript. Current items by default; the archive is one click away. */

function meta(type: ArticleType, it: ListItem): { key: string; text: string }[] {
  const kind = TYPES[type].kind
  const rows: { key: string; text: string }[] = []
  if (kind === 'event') {
    const when = formatDateTime(it.startsAt)
    if (when) rows.push({ key: 'when', text: when })
    if (it.venue) rows.push({ key: 'venue', text: it.venue })
    return rows
  }
  const date = formatDate(it.publishedAt)
  if (date) rows.push({ key: 'date', text: date })
  const closes = kind === 'deadline' ? formatDate(it.closesAt) : null
  if (closes) rows.push({ key: 'closes', text: `${it.closed ? 'Closed' : 'Closes'} ${closes}` })
  return rows
}

export default function ListingPage({
  type,
  params,
  listing,
  years,
}: {
  type: ArticleType
  params: ListingParams
  listing: Listing
  years: { first: number; last: number } | null
}) {
  const cfg = TYPES[type]
  const yearOptions = years ? Array.from({ length: years.last - years.first + 1 }, (_, i) => years.last - i) : []
  return (
    <>
      <PageHeader title={cfg.label} crumbs={[{ label: 'Home', href: '/' }, { label: cfg.label }]} />
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.bar}>
            <nav aria-label="View">
              <ul className={styles.views}>
                {(['current', 'archive'] as const).map((v) => (
                  <li key={v}>
                    <a
                      className={`${styles.view} ${params.view === v ? styles.viewOn : ''}`}
                      href={listingHref(cfg.path, { view: v, year: params.year })}
                      aria-current={params.view === v ? 'page' : undefined}
                    >
                      <T k={v === 'current' ? 'Current' : 'Archive'} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            {yearOptions.length > 1 ? (
              <form className={styles.filter} method="get" action={`/${cfg.path}`}>
                {params.view === 'archive' ? <input type="hidden" name="view" value="archive" /> : null}
                <label htmlFor="year">
                  <T k="Year" />
                </label>
                <select id="year" name="year" className={styles.select} defaultValue={params.year ? String(params.year) : ''}>
                  <option value="">All years</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button type="submit" className={styles.go}>
                  <T k="Show" />
                </button>
              </form>
            ) : null}
          </div>

          {listing.items.length ? (
            <ul className={styles.list}>
              {listing.items.map((it) => (
                <li key={it.id} className={styles.card}>
                  <h2 className={styles.cardTitle}>
                    <a className={styles.cardLink} href={`/${cfg.path}/${encodeURIComponent(it.slug)}`}>
                      {it.title}
                    </a>
                  </h2>
                  <p className={styles.meta}>
                    {meta(type, it).map((m) => (
                      <span key={m.key}>{m.text}</span>
                    ))}
                  </p>
                  {it.excerpt ? <p className={styles.excerpt}>{it.excerpt}</p> : null}
                  {it.closed && params.view === 'current' ? (
                    <span className={styles.pill}>
                      <T k="Closed" />
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              <T k="Nothing to show here yet." />
            </p>
          )}

          <Pagination
            page={listing.page}
            pageCount={listing.totalPages}
            hrefFor={(n) => listingHref(cfg.path, { ...params, page: n })}
          />
        </div>
      </div>
    </>
  )
}
