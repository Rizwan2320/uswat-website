import { getNav } from '../lib/content'
import { applyLink } from '../content/nav'
import { T } from './I18n'
import { ArrowRightIcon } from './icons'
import { Logo } from './Logo'
import NavMenu from './NavMenu'
import styles from './Header.module.css'

/* Sticky ivory header. Server component; only NavMenu (dropdowns, drawer) is a client component. */
export default async function Header() {
  const nav = await getNav()
  return (
    <header className={`${styles.header} on-light`} data-sticky>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <NavMenu items={nav} apply={applyLink} />
        <a className={`btn btn--maroon ${styles.apply}`} href={applyLink.href} rel="noopener noreferrer">
          <T k="Apply Online" /> <ArrowRightIcon className="btn-arrow" />
        </a>
      </div>
    </header>
  )
}
