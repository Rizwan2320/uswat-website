import { getNav } from '../lib/content'
import { applyLink } from '../content/nav'
import { T } from './I18n'
import { ArrowRightIcon } from './icons'
import { Logo } from './Logo'
import NavMenu from './NavMenu'
import styles from './Header.module.css'

/* Floating rounded bar, as in the design reference: crest, a thin rule, the menu in the middle, a thin rule and the
   gold "Apply Here" button. Server component; only NavMenu (dropdowns, drawer) is a client component. */
export default async function Header() {
  const nav = await getNav()
  return (
    <header className={`${styles.header} on-light`} data-sticky>
      <div className={styles.pill} data-pill>
        <Logo />
        <span className={styles.rule} aria-hidden="true" />
        <NavMenu items={nav} apply={applyLink} />
        <span className={styles.rule} aria-hidden="true" />
        <a className={`btn btn--gold ${styles.apply}`} href={applyLink.href} rel="noopener noreferrer">
          <T k={applyLink.label} /> <ArrowRightIcon className="btn-arrow" />
        </a>
      </div>
    </header>
  )
}
