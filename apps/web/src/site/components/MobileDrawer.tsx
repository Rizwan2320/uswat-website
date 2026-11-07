'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { Link as NavLink, NavItem } from '../content/types'
import { T, useI18n } from './I18n'
import { ArrowRightIcon, ChevronDownIcon, CloseIcon } from './icons'
import styles from './MobileDrawer.module.css'

/* Full-height drawer built on <dialog>: focus trap and Esc come from the platform; body scroll is locked while open.
   Sub-menus are accordions. The Apply Online button stays visible at the bottom. */
export default function MobileDrawer({
  open,
  onClose,
  items,
  apply,
}: {
  open: boolean
  onClose: () => void
  items: NavItem[]
  apply: NavLink
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <dialog ref={ref} id="mobile-drawer" className={styles.drawer} aria-label="Menu" onClose={onClose} onCancel={onClose}>
      <button type="button" className={styles.close} aria-label={t('Close')} onClick={onClose}>
        <CloseIcon />
      </button>
      <ul className={styles.list}>
        {items.map((item, i) =>
          item.children ? (
            <li key={item.label}>
              <button
                type="button"
                className={styles.row}
                aria-expanded={expanded === i}
                aria-controls={`m-sub-${i}`}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <T k={item.label} /> <ChevronDownIcon className={styles.caret} />
              </button>
              <ul id={`m-sub-${i}`} className={styles.sub} hidden={expanded !== i}>
                {item.children.map((c) => (
                  <li key={c.label}>
                    <a href={c.href} rel="noopener noreferrer">{c.label}</a>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={item.label}>
              <Link href={item.href} className={styles.row} onClick={onClose}>
                <T k={item.label} />
              </Link>
            </li>
          ),
        )}
      </ul>
      <a className={`btn btn--gold ${styles.apply}`} href={apply.href} rel="noopener noreferrer">
        <T k="Apply Online" /> <ArrowRightIcon className="btn-arrow" />
      </a>
    </dialog>
  )
}
