import { getPortals } from '../lib/content'
import { T } from './I18n'
import { ArrowRightIcon, BadgeIcon, BookIcon, CalendarIcon, DocumentIcon, GearIcon } from './icons'
import styles from './PortalsGrid.module.css'

const icons = { book: BookIcon, badge: BadgeIcon, document: DocumentIcon, calendar: CalendarIcon, gear: GearIcon }

/* Five equal cards, each a single stretched link to a real portal host (see content/portals.ts). */
export default async function PortalsGrid() {
  const portals = await getPortals()
  return (
    <section className={`${styles.section} on-light`} aria-labelledby="portals-title">
      <div className="container">
        <h2 id="portals-title" className="section-title">
          <T k="University Portals and Services" />
        </h2>
        <ul className={`${styles.grid} pop-grid`}>
          {portals.map((p) => {
            const Icon = icons[p.icon]
            return (
              <li key={p.id} className={styles.cell}>
                <article className={`pop ${styles.card}`}>
                  <span className={`card-icon ${styles.icon}`}><Icon /></span>
                  <h3 className={`card-title ${styles.title}`}>
                    <a className="stretched" href={p.href} rel="noopener noreferrer">{p.title}</a>
                  </h3>
                  <p className={styles.desc}>{p.description}</p>
                  <span className={`card-arrow ${styles.arrow}`} aria-hidden="true"><ArrowRightIcon className="flip" /></span>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
