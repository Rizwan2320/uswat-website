'use client'

import { useRef } from 'react'

import { T, useI18n } from './I18n'
import { CloseIcon, SearchIcon } from './icons'
import styles from './SearchOverlay.module.css'

/* A native <dialog> opened with showModal(): focus is trapped, Esc closes, the page behind is inert.
   The form is a plain GET to /search?q= (the Payload search page), so it also works without JS once open. */
export default function SearchOverlay({ triggerClassName }: { triggerClassName?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useI18n()

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-label={t('Search')}
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <SearchIcon />
      </button>
      <dialog
        ref={ref}
        className={styles.dialog}
        aria-label={t('Search')}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close() // click on the backdrop
        }}
      >
        <form method="get" action="/search" className={styles.form} role="search">
          <label htmlFor="site-search" className="visually-hidden">
            {t('Search')}
          </label>
          <input id="site-search" name="q" type="search" placeholder="Search the university" autoComplete="off" className={styles.input} />
          <button type="submit" className={`btn btn--gold ${styles.go}`}>
            <SearchIcon /> <span><T k="Search" /></span>
          </button>
          <button type="button" className={styles.close} aria-label={t('Close')} onClick={() => ref.current?.close()}>
            <CloseIcon />
          </button>
        </form>
      </dialog>
    </>
  )
}
