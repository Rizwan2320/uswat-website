import Link from 'next/link'

import SafeImage from '../components/SafeImage'
import { ArrowRightIcon } from '../components/icons'

import styles from './Academics.module.css'
import type { AlumniCard } from './alumni'
import { Band, initials } from './blocks'

/** One alumnus: portrait (initials until a photograph is supplied) or a plain tile of the same shape. */
export function AlumniPortrait({
  name,
  photo,
  sizes,
}: {
  name: string
  photo: { src: string; alt: string } | null
  sizes: string
}) {
  return (
    <div className={styles.alumniPhoto}>
      {photo ? (
        <SafeImage src={photo.src} alt={photo.alt} fill sizes={sizes} />
      ) : (
        <span className={styles.alumniInitials} aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </div>
  )
}

function CardBody({ w }: { w: AlumniCard }) {
  return (
    <>
      <AlumniPortrait name={w.name} photo={w.photo} sizes="(max-width: 700px) 90vw, 360px" />
      <span className={styles.alumniBody}>
        <span className={styles.alumniKind}>{w.kind}</span>
        <span className={styles.alumniHeadline}>{w.headline}</span>
        <span className={styles.alumniMeta}>
          {w.name}, class of {w.classOf}
        </span>
        {w.summary ? <span className={styles.alumniSummary}>{w.summary}</span> : null}
        {w.href ? (
          <span className={styles.alumniMore}>
            See the work{w.external ? <span className={styles.srOnly}> (opens in a new tab)</span> : null}{' '}
            <ArrowRightIcon />
          </span>
        ) : null}
      </span>
    </>
  )
}

/**
 * "Our alumni": a card for each graduate. A card with a link is one link (to the page of the work, or to the work itself);
 * a card without one is plain. The example entries kept in code carry a small "Sample" tag; entries a department wrote do not.
 */
export default function AlumniShowcase({
  items,
  lede,
  tint,
}: {
  items: AlumniCard[]
  lede: string
  tint?: boolean
}) {
  if (!items.length) return null
  const anySample = items.some((w) => w.sample)
  return (
    <Band id="alumni" tint={tint} kicker="Our alumni" title="Work by our graduates" lede={lede}>
      {anySample ? (
        <p className={styles.alumniNote}>
          <span className="sample-tag" style={{ marginInlineStart: 0 }}>
            Sample
          </span>
          Example entries until the department adds real alumni work.
        </p>
      ) : null}
      <ul className={styles.alumniGrid}>
        {items.map((w) => (
          <li key={w.key}>
            {w.href && w.external ? (
              <a href={w.href} className={styles.alumniCard} target="_blank" rel="noopener noreferrer">
                <CardBody w={w} />
              </a>
            ) : w.href ? (
              <Link href={w.href} className={styles.alumniCard}>
                <CardBody w={w} />
              </Link>
            ) : (
              <div className={`${styles.alumniCard} ${styles.alumniStatic}`}>
                <CardBody w={w} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Band>
  )
}
