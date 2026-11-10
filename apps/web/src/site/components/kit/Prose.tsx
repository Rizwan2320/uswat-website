import type { ReactNode } from 'react'

import styles from './Prose.module.css'

/* Reading column for articles and rich text: a comfortable measure and the site's heading, link, list, quote and table styles.
   dir="auto": the block takes the direction of its own text, so English content on a right-to-left page keeps its bullets and quote rule on the side the text reads from. */
export default function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose} dir="auto">{children}</div>
}
