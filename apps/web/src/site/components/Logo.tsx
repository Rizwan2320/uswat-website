import Link from 'next/link'

import { site } from '../content/site'
import styles from './Logo.module.css'

/* SIMPLIFIED CREST PLACEHOLDER (not the official emblem). The only crest on the public site is a 70x71 px PNG, too
   small for a header. TODO(brand): replace the circle below with the official crest as SVG or a >=256 px PNG. */
export function Crest({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="30" fill="#fff" stroke="#003B17" strokeWidth="3" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="#B3261E" strokeWidth="2" />
      <path d="M12 42 24 24l7 9 6-8 15 17H12Z" fill="#003B17" />
      <path d="M12 42h40v4c-6 4-14 6-20 6s-14-2-20-6v-4Z" fill="#0B5A27" />
      <circle cx="42" cy="19" r="4" fill="#F2B705" />
    </svg>
  )
}

export function Logo({ light = false, tagline = true }: { light?: boolean; tagline?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className={`${styles.logo} ${light ? styles.light : ''}`}>
      <Crest />
      <span className={styles.text}>
        <span className={styles.name}>{site.nameCaps}</span>
        {tagline ? <span className={styles.tag}>{site.tagline}</span> : null}
      </span>
    </Link>
  )
}
