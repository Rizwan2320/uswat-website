import { images } from '../content/images'
import { getLeadership } from '../lib/content'
import { T } from './I18n'
import { ArrowRightIcon } from './icons'
import SafeImage from './SafeImage'
import styles from './LeadershipMessage.module.css'

/* Leadership section. The portrait is the photo supplied for this project; it is rectangular and 450 px wide, so it is
   masked into an arch with object-fit: cover (never upscaled past its size). The quote is the VC's own published text. */
export default async function LeadershipMessage() {
  const vc = await getLeadership()
  return (
    <section className={`section ${styles.section} on-light`} aria-labelledby="leadership-title">
      {images.campus.src ? (
        <SafeImage src={images.campus.src} alt="" fill sizes="50vw" className={styles.bgPhoto} />
      ) : null}
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <div className={styles.arch}>
            <SafeImage
              src={images.vc.src}
              alt={images.vc.alt}
              width={images.vc.width}
              height={images.vc.height}
              sizes="(max-width: 767px) 80vw, 380px"
              priority
              className={styles.portrait}
            />
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
          <a className="btn btn--forest" href={vc.readMoreHref} rel="noopener noreferrer">
            <T k="Read Full Message" /> <ArrowRightIcon className="btn-arrow" />
          </a>
        </div>
      </div>
    </section>
  )
}
