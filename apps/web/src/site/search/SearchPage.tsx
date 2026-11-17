import PageHeader from '../components/kit/PageHeader'
import Pagination from '../components/kit/Pagination'
import { T } from '../components/I18n'

import type { Found } from './queries'
import styles from './Search.module.css'
import { searchHref, type SearchParams } from './shape'

/* The form is a plain GET form, so search works without JavaScript and a result page can be linked or bookmarked. */
export default function SearchPage({ params, found }: { params: SearchParams; found: Found }) {
  return (
    <>
      <PageHeader title="Search" crumbs={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
      <div className="container">
        <div className={styles.wrap}>
          <form className={styles.form} action="/search" method="get" role="search">
            <label htmlFor="q" className="sr-only">
              <T k="Search" />
            </label>
            <input id="q" name="q" type="search" className={styles.input} defaultValue={params.q} maxLength={100} autoComplete="off" />
            <button type="submit" className={styles.button}>
              <T k="Search" />
            </button>
          </form>

          {!params.q ? (
            <p className={styles.empty}>
              <T k="Type a word to search news, notices, events, jobs, tenders and pages." />
            </p>
          ) : found.hits.length === 0 ? (
            <p className={styles.empty} role="status">
              <T k="No results found." />
            </p>
          ) : (
            <>
              <p className={styles.count} role="status">
                {found.total} <T k={found.total === 1 ? 'result' : 'results'} />
              </p>
              <ul className={styles.list}>
                {found.hits.map((h) => (
                  <li key={h.id} className={styles.hit}>
                    {h.type ? <span className={styles.type}><T k={h.type} /></span> : null}
                    <h2 className={styles.title}>
                      <a className={styles.link} href={h.href}>
                        {h.title}
                      </a>
                    </h2>
                    {h.description ? <p className={styles.desc}>{h.description}</p> : null}
                  </li>
                ))}
              </ul>
              <Pagination page={found.page} pageCount={found.totalPages} hrefFor={(n) => searchHref({ q: params.q, page: n })} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
