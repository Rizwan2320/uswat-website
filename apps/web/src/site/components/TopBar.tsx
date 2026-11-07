import { site } from '../content/site'
import { LanguageToggle, T } from './I18n'
import { PinIcon } from './icons'
import SearchOverlay from './SearchOverlay'
import styles from './TopBar.module.css'

/* Darkest green utility bar. It scrolls away; only the header is sticky.
   The street address is NOT shown here: it is unconfirmed (Odigram vs Charbagh) and is labelled Sample in the footer. */
export default function TopBar() {
  return (
    <aside className={styles.bar} aria-label="University utility bar">
      <div className={`container ${styles.inner}`}>
        <p className={styles.left}>
          <span className={styles.place}>
            <PinIcon /> <span>Swat, Khyber Pakhtunkhwa, Pakistan</span>
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.tagline}>{site.tagline}</span>
        </p>
        <nav className={styles.right} aria-label="Portals and language">
          <a href={site.portalLinks.student} rel="noopener noreferrer">
            <T k="Student Portal" />
          </a>
          <span aria-hidden="true" className={styles.sep}>|</span>
          <a href={site.portalLinks.faculty} rel="noopener noreferrer">
            <T k="Faculty Portal" />
          </a>
          <span aria-hidden="true" className={styles.sep}>|</span>
          <LanguageToggle className={styles.lang} />
          <SearchOverlay triggerClassName={styles.search} />
        </nav>
      </div>
    </aside>
  )
}
