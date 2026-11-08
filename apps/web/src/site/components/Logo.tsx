import Image from 'next/image'
import Link from 'next/link'

import { site } from '../content/site'
import styles from './Logo.module.css'

/* Official crest, supplied by the project owner from the university's Drive on 2026-11-08 (1254 px original, kept out
   of the repo; /images/crest.png is a 256 px circular crop of it). Decorative: the link carries the name. */
export function Crest({ size = 44 }: { size?: number }) {
  return <Image src="/images/crest.png" alt="" width={size} height={size} className={styles.crest} priority />
}

/* The navigation bar shows the crest only (no name, no tagline), as in the design reference. */
export function Logo({ size = 46 }: { size?: number }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={styles.logo}>
      <Crest size={size} />
    </Link>
  )
}
