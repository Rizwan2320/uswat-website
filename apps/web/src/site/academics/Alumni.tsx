import Link from 'next/link'

import SafeImage from '../components/SafeImage'
import { ArrowRightIcon } from '../components/icons'

import styles from './Academics.module.css'
import { alumniHref, type AlumniWork } from './alumni'
import { Band, initials } from './blocks'

/** One alumnus: portrait (initials until a photograph is supplied) or a plain tile of the same shape. */
export function AlumniPortrait({ work, sizes }: { work: AlumniWork; sizes: string }) {
  return (
    <div className={styles.alumniPhoto}>
      {work.photo ? (
        <SafeImage src={work.photo} alt={`Portrait of ${work.name}`} fill sizes={sizes} />
      ) : (
        <span className={styles.alumniInitials} aria-hidden="true">
          {initials(work.name)}
        </span>
      )}
    </div>
  )
}

/** "Our alumni": three cards, each a single link to the page of the work. The entries are sample data, so one small tag says so. */
export default function AlumniShowcase({
  items,
  lede,
  tint,
}: {
  items: AlumniWork[]
  lede: string
  tint?: boolean
}) {
  if (!items.length) return null
  return (
    <Band id="alumni" tint={tint} kicker="Our alumni" title="Work by our graduates" lede={lede}>
      <p className={styles.alumniNote}>
        <span className="sample-tag" style={{ marginInlineStart: 0 }}>
          Sample
        </span>
        Example entries until the department adds real alumni work.
      </p>
      <ul className={styles.alumniGrid}>
        {items.map((w) => (
          <li key={w.slug}>
            <Link href={alumniHref(w.slug)} className={styles.alumniCard}>
              <AlumniPortrait work={w} sizes="(max-width: 700px) 90vw, 360px" />
              <span className={styles.alumniBody}>
                <span className={styles.alumniKind}>{w.kind}</span>
                <span className={styles.alumniHeadline}>{w.headline}</span>
                <span className={styles.alumniMeta}>
                  {w.name}, class of {w.classOf}
                </span>
                <span className={styles.alumniMore}>
                  See the work <ArrowRightIcon />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Band>
  )
}
