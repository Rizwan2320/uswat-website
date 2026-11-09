'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import styles from './Accordion.module.css'

export type AccordionItem = { id: string; title: string; content: ReactNode }

/* Disclosure list. Each header is a button (aria-expanded, aria-controls) that opens a labelled region. Up and Down arrows,
   Home and End move between headers. One item open at a time unless `multiple` is set. */
export default function Accordion({ items, multiple = false, defaultOpen = [] }: { items: AccordionItem[]; multiple?: boolean; defaultOpen?: string[] }) {
  const base = useId()
  const [open, setOpen] = useState<string[]>(defaultOpen)
  const heads = useRef<(HTMLButtonElement | null)[]>([])

  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]))

  const onKey = (e: KeyboardEvent, i: number) => {
    const last = items.length - 1
    const to = e.key === 'ArrowDown' ? (i === last ? 0 : i + 1) : e.key === 'ArrowUp' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1
    if (to < 0) return
    e.preventDefault()
    heads.current[to]?.focus()
  }

  return (
    <div className={styles.root}>
      {items.map((it, i) => {
        const isOpen = open.includes(it.id)
        const hid = `${base}-h-${it.id}`
        const pid = `${base}-p-${it.id}`
        return (
          <div key={it.id} className={styles.item}>
            <h3 className={styles.heading}>
              <button
                ref={(el) => { heads.current[i] = el }}
                id={hid}
                type="button"
                className={styles.button}
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => toggle(it.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span>{it.title}</span>
                <svg className={styles.chev} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </h3>
            <div id={pid} role="region" aria-labelledby={hid} hidden={!isOpen} className={styles.panel}>
              {it.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
