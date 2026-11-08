'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'

import type { Link as NavLink, NavItem } from '../content/types'
import { T, useI18n } from './I18n'
import { ArrowRightIcon, ChevronDownIcon, CloseIcon, MenuIcon } from './icons'
import { NavIcon } from './navIcons'
import MobileDrawer from './MobileDrawer'
import styles from './NavMenu.module.css'

/* Desktop: links with disclosure dropdowns (two columns of icon rows plus an "Explore All" row; the panel hangs under the
   floating bar with a notch that points at its link). Opens on hover (mouse) and on click/Enter/Space; Esc or an outside
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

  /* Place the open panel under the bar: left edge on its link (kept inside the bar), notch under the link's middle. */
  useEffect(() => {
    if (open === null) return
    const li = root.current?.children[open] as HTMLElement | undefined
    const panel = li?.querySelector<HTMLElement>('[data-sub]')
    const bar = li?.closest<HTMLElement>('[data-pill]')
    if (!li || !panel || !bar) return
    const l = li.getBoundingClientRect()
    const b = bar.getBoundingClientRect()
    const w = panel.offsetWidth
    const left = Math.max(12, Math.min(l.left - b.left - 8, b.width - w - 12))
    panel.style.setProperty('--sub-x', `${left}px`)
    panel.style.setProperty('--notch-x', `${Math.max(20, l.left - b.left + l.width / 2 - left - 9)}px`)
  }, [open])

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
                <div id={id} data-sub className={styles.sub} data-open={open === i ? '' : undefined}>
                  <div className={styles.cols}>
                    {[item.children.slice(0, Math.ceil(item.children.length / 2)), item.children.slice(Math.ceil(item.children.length / 2))].map((col, c) => (
                      <ul key={c} className={styles.col}>
                        {col.map((child) => (
                          <li key={child.label}>
                            <a href={child.href} rel="noopener noreferrer" onClick={close}>
                              <span className={styles.ico}><NavIcon name={child.icon} /></span>
                              <span>{child.label}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                  {item.noExplore ? null : (
                    <a className={styles.all} href={item.href} rel="noopener noreferrer" onClick={close}>
                      <span><T k="Explore All" /> <T k={item.label} /></span> <ArrowRightIcon className="flip" />
                    </a>
                  )}
                </div>
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
