import type { ReactNode } from 'react'

import Breadcrumbs, { type Crumb } from './Breadcrumbs'
import styles from './PageHeader.module.css'

/* Top of every inner page: forest band, breadcrumbs, the h1 in Playfair, an optional lede, then a short gold rule.
   Exactly one per page; it renders the page's only h1. */
export default function PageHeader({ title, lede, crumbs, children }: { title: string; lede?: string; crumbs?: Crumb[]; children?: ReactNode }) {
  return (
    <header className={`${styles.header}`}>
      <div className="container">
        {crumbs?.length ? <Breadcrumbs items={crumbs} tone="dark" /> : null}
        <h1 className={styles.title}>{title}</h1>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
        {children}
        <span className={styles.rule} aria-hidden="true" />
      </div>
    </header>
  )
}
