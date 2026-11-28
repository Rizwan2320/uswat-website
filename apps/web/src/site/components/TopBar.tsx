import { site } from '../content/site'
import { getTopBar } from '../lib/content'
import DepartmentSearch from './DepartmentSearch'
import { LanguageToggle, T } from './I18n'
import { PinIcon } from './icons'
import SearchOverlay from './SearchOverlay'
import SiteLink from './SiteLink'
import styles from './TopBar.module.css'

/* Darkest green utility bar. Sticks with the header (see .site-head) so the "Established in 2010" line is always visible.
   The street address is NOT shown here: it is unconfirmed (Odigram vs Charbagh) and is labelled Sample in the footer. */
export default async function TopBar() {
  const bar = await getTopBar()
  return (
    <aside className={styles.bar} aria-label="University utility bar">
      <div className={`container ${styles.inner}`}>
        <p className={styles.left}>
          <span className={styles.place}>
            <PinIcon /> <span>{bar.place}</span>
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.tagline}>{bar.established}</span>
        </p>
        <nav className={styles.right} aria-label="Portals and language">
          <DepartmentSearch triggerClassName={styles.linkBtn} />
          <span aria-hidden="true" className={styles.sep}>
            |
          </span>
          <SiteLink href={site.portalLinks.cms}>
            <T k="CMS" />
          </SiteLink>
          <span aria-hidden="true" className={styles.sep}>
            |
          </span>
          <a href={bar.studentUrl} rel="noopener noreferrer">
            <T k="Student Portal" />
          </a>
          <span aria-hidden="true" className={styles.sep}>
            |
          </span>
          <a href={bar.facultyUrl} rel="noopener noreferrer">
            <T k="Faculty Portal" />
          </a>
          <span aria-hidden="true" className={styles.sep}>
            |
          </span>
          <LanguageToggle className={styles.lang} />
          <SearchOverlay triggerClassName={styles.search} />
        </nav>
      </div>
    </aside>
  )
}
