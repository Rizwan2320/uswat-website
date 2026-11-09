import { itemDate } from '../lib/dates'
import { getFeeds } from '../lib/content'
import { T } from './I18n'
import { ArrowRightIcon, BriefcaseIcon, GavelIcon, MegaphoneIcon } from './icons'
import styles from './FeedCards.module.css'

const icons = { notices: MegaphoneIcon, jobs: BriefcaseIcon, tenders: GavelIcon }
const empty = { notices: 'No current notices', jobs: 'No current job openings', tenders: 'No current tenders' }

/* Notices, Jobs and Tenders. Rendered on the server from content/feeds.ts, so the rows are in the HTML for no-JS and SEO.
   Dates are `<time>`; the public site gives only the month, so that is what is shown. */
export default async function FeedCards() {
  const feeds = await getFeeds()
  return (
    <section className={`${styles.section} on-light`} aria-labelledby="announcements-title">
      <div className="container">
        <h2 id="announcements-title" className="section-title">
          <T k="Announcements" />
        </h2>
        <div className={`${styles.grid} pop-grid`}>
          {feeds.map((f) => {
            const Icon = icons[f.id]
            return (
              <article key={f.id} className={`pop ${styles.card}`} aria-labelledby={`feed-${f.id}`}>
                <header className={styles.head}>
                  <span className={`card-icon ${styles.icon}`}><Icon /></span>
                  <h3 id={`feed-${f.id}`} className={`card-title ${styles.title}`}><T k={f.title} /></h3>
                  <a className={styles.all} href={f.viewAllHref} rel="noopener noreferrer">
                    <T k="View All" /> <ArrowRightIcon className={`card-arrow flip ${styles.allArrow}`} />
                  </a>
                </header>
                {f.items.length === 0 ? (
                  <p className={styles.empty}>{empty[f.id]}</p>
                ) : (
                  <ul className={styles.list}>
                    {f.items.map((it) => {
                      const d = itemDate(it)
                      return (
                        <li key={it.id} className={`row ${styles.row}`}>
                          <a className={styles.link} href={it.href} rel="noopener noreferrer">
                            <span className={`dot ${styles.dot}`} aria-hidden="true" />
                            <span className={`row-title ${styles.rowTitle}`}>{it.title}</span>
                            {d ? <time className={styles.date} dateTime={d.dateTime}>{d.label}</time> : null}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
