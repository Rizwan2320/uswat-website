import { images } from '../content/images'
import { getLeadership } from '../lib/content'
import { T } from './I18n'
import LeadershipDialog from './LeadershipDialog'
import SafeImage from './SafeImage'
import styles from './LeadershipMessage.module.css'

/* Leadership section, as in the mockup: the Vice Chancellor (supplied photo, studio backdrop removed) stands on the
   campus photo, with a green ribbon name plate over the base. The quote is the opening of his message. */
export default async function LeadershipMessage() {
  const vc = await getLeadership()
  return (
    <section className={`section ${styles.section} on-light`} aria-labelledby="leadership-title">
      {/* Decorative backdrops: they fade to white and are multiplied into the ivory so no edge shows. */}
      <div className={`${styles.bg} ${styles.bgLeft}`} aria-hidden="true">
        <SafeImage src={images.vcBackdropLeft.src} alt="" fill sizes="(max-width: 767px) 70vw, 40vw" className={styles.bgImg} />
      </div>
      <div className={`${styles.bg} ${styles.bgRight}`} aria-hidden="true">
        <SafeImage src={images.vcBackdropRight.src} alt="" fill sizes="(max-width: 767px) 100vw, 52vw" className={styles.bgImg} />
      </div>
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <SafeImage
            src={images.vc.src}
            alt={images.vc.alt}
            width={images.vc.width}
            height={images.vc.height}
            sizes="(max-width: 767px) 80vw, 340px"
            priority
            className={styles.portrait}
          />
          {/* Ribbon name plate from the mockup: forest green, gold edge, wings that sweep out to each side. */}
          <figcaption className={styles.ribbon}>
            <svg className={styles.ribbonBg} viewBox="0 0 400 64" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M0 64 C34 64 46 56 66 34 C80 18 98 6 132 6 H268 C302 6 320 18 334 34 C354 56 366 64 400 64 Z" fill="var(--forest)" />
              <path d="M0 64 C34 64 46 56 66 34 C80 18 98 6 132 6 H268 C302 6 320 18 334 34 C354 56 366 64 400 64" fill="none" stroke="var(--gold)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className={styles.name}>{vc.name}</span>
            <span className={styles.role}>{vc.role}</span>
          </figcaption>
        </figure>

        <div className={styles.text}>
          <p className={styles.badge}>
            <span><T k="LEADERSHIP MESSAGE" /></span>
            <span className={styles.rule} aria-hidden="true" />
          </p>
          <h2 id="leadership-title" className={styles.title}>
            <T k={"A Message from\nOur Vice Chancellor"} />
          </h2>
          <blockquote className={styles.quote}>
            <span className={styles.mark} aria-hidden="true">“</span>
            <p>{vc.quote}</p>
          </blockquote>
          <LeadershipDialog
            name={vc.name}
            role={vc.role}
            paragraphs={vc.fullMessage}
            complete={vc.fullMessageComplete}
            closing={vc.closing}
            sourceHref={vc.readMoreHref}
          />
        </div>
      </div>
    </section>
  )
}
