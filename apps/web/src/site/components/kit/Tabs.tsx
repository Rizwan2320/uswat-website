'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import styles from './Tabs.module.css'

export type TabItem = { id: string; label: string; content: ReactNode }

/* Tabs with automatic activation. Left and Right arrows move (reversed in right-to-left), Home and End jump. Only the active tab is in the tab order. */
export default function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const base = useId()
  const [active, setActive] = useState(items[0]?.id)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent, i: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl'
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight'
    const back = rtl ? 'ArrowRight' : 'ArrowLeft'
    const last = items.length - 1
    const to = e.key === fwd ? (i === last ? 0 : i + 1) : e.key === back ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1
    if (to < 0) return
    e.preventDefault()
    setActive(items[to].id)
    tabs.current[to]?.focus()
  }

  return (
    <div className={styles.root}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {items.map((it, i) => (
          <button
            key={it.id}
            ref={(el) => { tabs.current[i] = el }}
            id={`${base}-t-${it.id}`}
            type="button"
            role="tab"
            aria-selected={active === it.id}
            aria-controls={`${base}-p-${it.id}`}
            tabIndex={active === it.id ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(it.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {it.label}
          </button>
        ))}
      </div>
      {items.map((it) => (
        <div key={it.id} id={`${base}-p-${it.id}`} role="tabpanel" aria-labelledby={`${base}-t-${it.id}`} hidden={active !== it.id} tabIndex={0} className={styles.panel}>
          {it.content}
        </div>
      ))}
    </div>
  )
}
