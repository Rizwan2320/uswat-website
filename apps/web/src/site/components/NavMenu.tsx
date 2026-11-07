'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'

import type { Link as NavLink, NavItem } from '../content/types'
import { T, useI18n } from './I18n'
import { ChevronDownIcon, CloseIcon, MenuIcon } from './icons'
import MobileDrawer from './MobileDrawer'
import styles from './NavMenu.module.css'

/* Desktop: pill links with disclosure dropdowns. Opens on hover (mouse) and on click/Enter/Space; Esc or an outside
   click closes; Up/Down move between links. Below 1024px the hamburger opens MobileDrawer. */
export default function NavMenu({ items, apply }: { items: NavItem[]; apply: NavLink }) {
  const pathname = usePathname()
  const { t } = useI18n()
  const [open, setOpen] = useState<number | null>(null)
  const [drawer, setDrawer] = useState(false)
  const root = useRef<HTMLUListElement>(null)

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null } }
  /* Mouse only: a short grace period so a slight slip off the link or the gap above the panel does not shut it. */
  const closeSoon = () => { cancelClose(); closeTimer.current = setTimeout(() => setOpen(null), 220) }
  useEffect(() => cancelClose, [])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [close])

  const onKey = (e: KeyboardEvent<HTMLLIElement>, i: number) => {
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>('[data-sub] a'))
    if (e.key === 'Escape' && open === i) {
      setOpen(null)
      e.currentTarget.querySelector<HTMLButtonElement>('button[aria-haspopup]')?.focus()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (open !== i) return
      e.preventDefault()
      const at = links.indexOf(document.activeElement as HTMLAnchorElement)
      const next = e.key === 'ArrowDown' ? (at + 1) % links.length : (at - 1 + links.length) % links.length
      links[next]?.focus()
    }
  }

  return (
    <>
      <nav aria-label="Primary" className={styles.nav}>
        <ul className={styles.list} ref={root}>
          {items.map((item, i) => {
            const active = !item.external && item.href === pathname
            if (!item.children) {
              return (
                <li key={item.label}>
                  <Link href={item.href} className={`${styles.link} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined}>
                    <T k={item.label} />
                  </Link>
                </li>
              )
            }
            const id = `sub-${i}`
            return (
              <li
                key={item.label}
                className={styles.item}
                onKeyDown={(e) => onKey(e, i)}
                onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) { cancelClose(); setOpen(i) } }}
                onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) closeSoon() }}
              >
                <button
                  type="button"
                  className={styles.link}
                  aria-expanded={open === i}
                  aria-haspopup="true"
                  aria-controls={id}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <T k={item.label} /> <ChevronDownIcon className={styles.caret} />
                </button>
                <ul id={id} data-sub className={styles.sub} data-open={open === i ? '' : undefined}>
                  {item.children.map((c) => (
                    <li key={c.label}>
                      <a href={c.href} rel="noopener noreferrer" onClick={close}>
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </nav>

      <button
        type="button"
        className={styles.burger}
        aria-label={t(drawer ? 'Close' : 'Menu')}
        aria-expanded={drawer}
        aria-controls="mobile-drawer"
        onClick={() => setDrawer((v) => !v)}
      >
        {drawer ? <CloseIcon /> : <MenuIcon />}
      </button>
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} items={items} apply={apply} />
    </>
  )
}
