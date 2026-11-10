import { T } from '../I18n'
import styles from './Pagination.module.css'

/* Numbered pagination with previous and next. Plain links, so it works without JavaScript and for crawlers. */
function windowOf(page: number, count: number): (number | 'gap')[] {
  const keep = new Set([1, count, page - 1, page, page + 1])
  const nums = [...keep].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('gap')
    out.push(n)
  })
  return out
}

export default function Pagination({ page, pageCount, hrefFor }: { page: number; pageCount: number; hrefFor: (n: number) => string }) {
  if (pageCount <= 1) return null
  const prev = page > 1 ? page - 1 : null
  const next = page < pageCount ? page + 1 : null
  return (
    <nav aria-label="Pagination" className={styles.nav}>
      <ul className={styles.list}>
        <li>{prev ? <a className={styles.step} href={hrefFor(prev)} rel="prev"><T k="Previous" /></a> : <span className={`${styles.step} ${styles.off}`} aria-disabled="true"><T k="Previous" /></span>}</li>
        {windowOf(page, pageCount).map((n, i) =>
          n === 'gap' ? (
            <li key={`g${i}`} aria-hidden="true" className={styles.gap}>…</li>
          ) : (
            <li key={n}>
              <a className={`${styles.num} ${n === page ? styles.current : ''}`} href={hrefFor(n)} aria-current={n === page ? 'page' : undefined} aria-label={`Page ${n}`}>{n}</a>
            </li>
          ),
        )}
        <li>{next ? <a className={styles.step} href={hrefFor(next)} rel="next"><T k="Next" /></a> : <span className={`${styles.step} ${styles.off}`} aria-disabled="true"><T k="Next" /></span>}</li>
      </ul>
    </nav>
  )
}
