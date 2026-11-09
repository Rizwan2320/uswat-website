import { images } from '../content/images'
import { dateBlock, isPast, itemDate } from '../lib/dates'
import { getEvents, getNews } from '../lib/content'
import { T } from './I18n'
import { ArrowRightIcon, CalendarIcon } from './icons'
import SafeImage from './SafeImage'
import styles from './NewsEvents.module.css'

const ALL_NEWS = 'https://uswat.edu.pk/category/latestnews/'

/* Three equal columns: two news stories (one photo each, fading into the text below it) and an events card.
   Titles are forest (the mockup's blue is not a brand colour). Images fall back to a gradient until real photos are added. */
export default async function NewsEvents() {
  const [news, events] = await Promise.all([getNews(), getEvents()])
  const [first, second] = news
  const now = new Date()
  const upcoming = events.filter((e) => e.startISO && !isPast(e.startISO, now))
  const shown = upcoming.length ? upcoming : events
  const heading = upcoming.length ? 'Upcoming Events' : 'Recent Events'

  return (
    <section className={`${styles.section} on-light`} aria-labelledby="news-title">
      <div className="container">
        <h2 id="news-title" className="section-title"><T k="News & Events" /></h2>

        <div className={`${styles.grid} pop-grid`}>
          {first ? (
            <article className={`pop ${styles.card} ${styles.newsCard}`}>
              <span className={styles.tab}><T k="Latest News" /></span>
              <div className={styles.row}>
                <div className={`media ${styles.photo}`}>
                  <SafeImage src={images.newsThumbs.niibs.src} alt={images.newsThumbs.niibs.alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px" className={`${styles.fillImg} ${styles.posNiibs}`} />
                </div>
                <NewsText item={first} />
              </div>
            </article>
          ) : null}

          {second ? (
            <article className={`pop ${styles.card} ${styles.newsCard}`}>
              <div className={styles.row}>
                <div className={`media ${styles.photo}`}>
                  <SafeImage src={images.newsThumbs.climate.src} alt={images.newsThumbs.climate.alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px" className={`${styles.fillImg} ${styles.posPlaque}`} />
                </div>
                <NewsText item={second} />
              </div>
            </article>
          ) : null}

          <div className={styles.eventsCol}>
            <article className={`pop ${styles.card} ${styles.events}`} aria-labelledby="events-title">
              <header className={styles.eventsHead}>
                <span className={`card-icon ${styles.eventsIcon}`}><CalendarIcon /></span>
                <h3 id="events-title" className={`card-title ${styles.eventsTitle}`}><T k={heading} /></h3>
              </header>
              {shown.length === 0 ? (
                <p className={styles.none}>No upcoming events</p>
              ) : (
                <ul className={styles.eventList}>
                  {shown.map((e) => {
                    const b = dateBlock(e)
                    const d = itemDate(e)
                    const body = (
                      <>
                        {b ? (
                          <time className={styles.block} dateTime={b.dateTime}>
                            <span className={styles.day}>{b.top}</span>
                            <span className={styles.mon}>{b.bottom}</span>
                          </time>
                        ) : null}
                        <span className={styles.evText}>
                          <span className={`row-title ${styles.evTitle}`}>{e.title}</span>
                          {e.venue ? <span className={styles.venue}>{e.venue}</span> : null}
                          {d ? <span className="visually-hidden">{d.label}</span> : null}
                        </span>
                      </>
                    )
                    return (
                      <li key={e.id} className={`row ${styles.ev}`}>
                        {e.href ? <a className={styles.evLink} href={e.href} rel="noopener noreferrer">{body}</a> : <div className={styles.evLink}>{body}</div>}
                      </li>
                    )
                  })}
                </ul>
              )}
            </article>
          {/* The one "view all" link for the section: under the events card, in the space the shorter card leaves. */}
          <a className={styles.all} href={ALL_NEWS} rel="noopener noreferrer">
            <T k="View All News & Events" /> <ArrowRightIcon className={`btn-arrow ${styles.allArrow}`} />
          </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsText({ item }: { item: { title: string; href: string; dateISO?: string; month?: string } }) {
  const d = itemDate(item)
  return (
    <div className={styles.text}>
      <h3 className={`card-title ${styles.newsTitle}`}>
        <a className="stretched" href={item.href} rel="noopener noreferrer">{item.title}</a>
      </h3>
      {d ? (
        <p className={styles.meta}>
          <CalendarIcon /> <time dateTime={d.dateTime}>{d.label}</time>
        </p>
      ) : null}
      <span className={styles.more}>
        <T k="Read More" /> <ArrowRightIcon className="card-arrow flip" />
      </span>
    </div>
  )
}
