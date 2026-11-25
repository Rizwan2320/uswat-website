import { alumniWorkHref, alumniWorkPath, alumniWorks } from '../content/alumni'
import { T } from './I18n'
import { ArrowRightIcon } from './icons'
import SafeImage from './SafeImage'
import styles from './AlumniShowcase.module.css'

/* "Our Alumni": three cards, each a photograph of a graduate and the headline of their thesis or research. The whole card is
   one link to the work (the work's own page here, or the full text elsewhere when the entry has a `url`). Entries live in
   content/alumni.ts; while any is flagged `sample` the section says so. */
export default function AlumniShowcase() {
  const works = alumniWorks.slice(0, 3)
  if (works.length === 0) return null
  const anySample = works.some((w) => w.sample)
  return (
    <section className={`${styles.section} on-light`} aria-labelledby="alumni-title">
      <div className="container">
        <h2 id="alumni-title" className="section-title"><T k="Our Alumni" /></h2>
        <p className={styles.lede}><T k="Graduates whose thesis and research carry the university's work into the world." /></p>
        {anySample ? (
          <p className={styles.note}>
            <span className="sample-tag">Sample</span> <T k="Names, photographs and research shown here are placeholders to test the layout." />
          </p>
        ) : null}
        <ul className={`${styles.grid} pop-grid`}>
          {works.map((w) => {
            const href = alumniWorkHref(w)
            const external = !href.startsWith('/')
            return (
              <li key={w.slug} className={styles.cell}>
                <article className={`pop ${styles.card}`}>
                  <div className={`media ${styles.photo}`}>
                    <SafeImage src={w.photo.src} alt={w.photo.alt} fill sizes="(max-width: 767px) 100vw, 360px" className={styles.img} />
                  </div>
                  <div className={styles.body}>
                    <p className={styles.who}>
                      <span className={styles.name}>{w.name}</span>
                      {w.sample ? <span className="sample-tag">Sample</span> : null}
                    </p>
                    <h3 className={`card-title ${styles.title}`}>
                      <a className="stretched" href={href} {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}>{w.title}</a>
                    </h3>
                    <p className={styles.meta}>{w.department} · {w.year}</p>
                    <p className={styles.summary}>{w.summary}</p>
                    <span className={`card-arrow ${styles.more}`}>
                      <T k="Read the work" /> <ArrowRightIcon className="flip" />
                    </span>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
        <p className={styles.all}>
          <a href={alumniWorkPath}><T k="View all alumni research" /> <ArrowRightIcon className="flip" /></a>
        </p>
      </div>
    </section>
  )
}
