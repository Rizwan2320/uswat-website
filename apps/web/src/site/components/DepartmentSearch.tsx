'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { DEPARTMENTS_PATH, departmentHref } from '../organisation/shape'

import { filterDepartments, type DepartmentOption } from './departmentFilter'
import { T, useI18n } from './I18n'
import { CloseIcon, SearchIcon } from './icons'
import styles from './DepartmentSearch.module.css'

type Load = { state: 'idle' | 'loading' | 'error' } | { state: 'ready'; items: DepartmentOption[] }

/* "Departments" button in the top bar. A native <dialog> (focus trapped, Esc closes, page behind inert) holds a search box;
   the visitor types part of a department name, picks a match (mouse, or arrow keys + Enter) and is taken to that page.
   The list is fetched once, the first time the box opens. */
export default function DepartmentSearch({ triggerClassName }: { triggerClassName?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useI18n()
  const listId = useId()
  const [load, setLoad] = useState<Load>({ state: 'idle' })
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const items = load.state === 'ready' ? load.items : []
  const matches = filterDepartments(items, query)
  const current = Math.min(active, Math.max(matches.length - 1, 0))

  async function fetchList() {
    setLoad({ state: 'loading' })
    try {
      const res = await fetch('/api/department-options')
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { departments?: DepartmentOption[] }
      setLoad({ state: 'ready', items: body.departments ?? [] })
    } catch {
      setLoad({ state: 'error' })
    }
  }

  function open() {
    setQuery('')
    setActive(0)
    dialog.current?.showModal()
    input.current?.focus()
    if (load.state === 'idle' || load.state === 'error') void fetchList()
  }

  function go(d: DepartmentOption) {
    dialog.current?.close()
    router.push(departmentHref(d.slug))
  }

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    document.getElementById(`${listId}-${current}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [current, listId])

  const showList = load.state === 'ready' && matches.length > 0

  return (
    <>
      <button type="button" className={triggerClassName} aria-haspopup="dialog" onClick={open}>
        <T k="Departments" />
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={t('Find a department')}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close()
        }}
      >
        <div className={styles.box}>
          <div className={styles.row}>
            <SearchIcon className={styles.icon} />
            <input
              ref={input}
              type="search"
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={showList ? `${listId}-${current}` : undefined}
              aria-label={t('Find a department')}
              placeholder={t('Type a department name')}
              autoComplete="off"
              value={query}
              className={styles.input}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' && matches.length) {
                  e.preventDefault()
                  setActive((current + 1) % matches.length)
                } else if (e.key === 'ArrowUp' && matches.length) {
                  e.preventDefault()
                  setActive((current - 1 + matches.length) % matches.length)
                } else if (e.key === 'Escape') {
                  // In a search field Esc first clears the text; here it always closes the box.
                  e.preventDefault()
                  dialog.current?.close()
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  const d = matches[current]
                  if (d) go(d)
                }
              }}
            />
            <button
              type="button"
              className={styles.close}
              aria-label={t('Close')}
              onClick={() => dialog.current?.close()}
            >
              <CloseIcon />
            </button>
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-label={t('Departments')}
            className={styles.list}
            hidden={!showList}
          >
            {matches.map((d, i) => (
              <li
                key={d.slug}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === current}
                className={styles.option}
                onMouseMove={() => setActive(i)}
                onClick={() => go(d)}
              >
                <span>{d.name}</span>
                {d.group ? <small>{d.group}</small> : null}
              </li>
            ))}
          </ul>

          <p className={styles.status} role="status" aria-live="polite">
            {load.state === 'loading' ? <T k="Loading departments…" /> : null}
            {load.state === 'error' ? (
              <T k="Departments could not be loaded. Please try again." />
            ) : null}
            {load.state === 'ready' && matches.length === 0 ? (
              <T k="No department matches your search." />
            ) : null}
          </p>
          <Link
            className={styles.all}
            href={DEPARTMENTS_PATH}
            onClick={() => dialog.current?.close()}
          >
            <T k="View all departments" />
          </Link>
        </div>
      </dialog>
    </>
  )
}
