import { getNavBar } from '../lib/content'
import { T } from './I18n'
import { ArrowRightIcon } from './icons'
import { Logo } from './Logo'
import NavMenu from './NavMenu'
import styles from './Header.module.css'

/* Floating rounded bar, as in the design reference: crest, a thin rule, the menu in the middle, a thin rule and the
   gold "Apply Here" button. Server component; only NavMenu (dropdowns, drawer) is a client component. */
export default async function Header() {
  const { items, apply, style } = await getNavBar()
  return (
    <header className={`${styles.header} on-light`} data-sticky style={style}>
      <div className={styles.pill} data-pill>
        <Logo />
        <span className={styles.rule} aria-hidden="true" />
        <NavMenu items={items} apply={apply} />
        <span className={styles.rule} aria-hidden="true" />
        <a className={`btn btn--gold ${styles.apply}`} href={apply.href} rel="noopener noreferrer">
          <T k={apply.label} /> <ArrowRightIcon className="btn-arrow" />
        </a>
      </div>
    </header>
  )
}
