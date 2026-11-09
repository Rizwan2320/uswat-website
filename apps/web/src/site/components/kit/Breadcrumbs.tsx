import { T } from '../I18n'
import styles from './Breadcrumbs.module.css'

export type Crumb = { label: string; href?: string }

/* Breadcrumb trail. The last crumb is the current page (no link, aria-current). `tone="dark"` is for use on the forest page header. */
export default function Breadcrumbs({ items, tone = 'light', label = 'Breadcrumb' }: { items: Crumb[]; tone?: 'light' | 'dark'; label?: string }) {
  return (
    <nav aria-label={label} className={`${styles.nav} ${tone === 'dark' ? styles.dark : ''}`}>
      <ol className={styles.list}>
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.label + i} className={styles.item}>
              {c.href && !last ? <a href={c.href}><T k={c.label} /></a> : <span aria-current={last ? 'page' : undefined}><T k={c.label} /></span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
