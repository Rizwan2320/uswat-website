import type { ReactNode } from 'react'

import styles from './Prose.module.css'

/* Reading column for articles and rich text: a comfortable measure and the site's heading, link, list, quote and table styles. */
export default function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>
}
