import { images } from '../content/images'
import { getLeadership } from '../lib/content'
import { T } from './I18n'
import LeadershipDialog from './LeadershipDialog'
import SafeImage from './SafeImage'
import styles from './LeadershipMessage.module.css'

/* Leadership section. The portrait is the photo supplied for this project; it is rectangular and 450 px wide, so it is
   masked into an arch with object-fit: cover (never upscaled past its size). The quote is the VC's own published text. */
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
          <div className={styles.arch}>
            <div className={styles.archInner}>
              <SafeImage
                src={images.vc.src}
                alt={images.vc.alt}
                width={images.vc.width}
                height={images.vc.height}
                sizes="(max-width: 767px) 80vw, 320px"
                priority
                className={styles.portrait}
              />
            </div>
          </div>
          <figcaption className={styles.plate}>
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
            <T k="A Message from the Vice Chancellor" />
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
            sourceHref={vc.readMoreHref}
          />
        </div>
      </div>
    </section>
  )
}
