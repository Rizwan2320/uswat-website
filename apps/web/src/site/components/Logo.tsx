import Image from 'next/image'
import Link from 'next/link'

import { site } from '../content/site'
import styles from './Logo.module.css'

/* Official crest, supplied by the project owner from the university's Drive on 2026-11-08 (1254 px original, kept out
   of the repo; /images/crest.png is a 256 px circular crop of it). Decorative: the link carries the name. */
export function Crest({ size = 44 }: { size?: number }) {
  return <Image src="/images/crest.png" alt="" width={size} height={size} className={styles.crest} priority />
}

export function Logo({ light = false, line = site.logoLine }: { light?: boolean; line?: string | null }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={`${styles.logo} ${light ? styles.light : ''}`}>
      <Crest size={42} />
      <span className={styles.text}>
        <span className={styles.name}>{site.nameCaps}</span>
        {line ? <span className={styles.tag}>{line}</span> : null}
      </span>
    </Link>
  )
}
