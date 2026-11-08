'use client'

import { useId, useRef, type MouseEvent } from 'react'

import { T, useI18n } from './I18n'
import { ArrowRightIcon } from './icons'
import styles from './LeadershipDialog.module.css'

type Props = {
  name: string
  role: string
  paragraphs: string[]
  complete: boolean
  sourceHref: string
}

/* "Read Full Message": opens the message in a modal on the home page (no route change). A native <dialog> opened with
   showModal() gives the focus trap, Escape to close, an inert background and focus return to the trigger for free.
   Without JavaScript the trigger is a normal link to the university's own page. */
export default function LeadershipDialog({ name, role, paragraphs, complete, sourceHref }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { t } = useI18n()

  const open = (e: MouseEvent) => {
    const d = ref.current
    if (!d || typeof d.showModal !== 'function') return // fall back to the link
    e.preventDefault()
    d.showModal()
  }
  const close = () => ref.current?.close()
  // The panel fills the whole <dialog>, so a click whose target is the dialog itself landed on the backdrop.
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close()
  }

  return (
    <>
      <a className="btn btn--forest" href={sourceHref} onClick={open} aria-haspopup="dialog">
        <T k="Read Full Message" /> <ArrowRightIcon className="btn-arrow" />
      </a>

      <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} onClick={onBackdrop}>
        <div className={styles.panel}>
          <header className={styles.head}>
            <h3 id={titleId} className={styles.title}>
              <T k="A Message from the Vice Chancellor" />
            </h3>
            <button type="button" className={styles.close} onClick={close} aria-label={t('Close')}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className={styles.body} tabIndex={0} role="region" aria-labelledby={titleId}>
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {!complete ? (
              <p className={styles.more}>
                <a href={sourceHref} target="_blank" rel="noopener noreferrer">
                  <T k="Read the complete message on the university website" />
                </a>
              </p>
            ) : null}
            <p className={styles.sign}>
              <strong>{name}</strong>
              <span>{role}</span>
            </p>
          </div>
        </div>
      </dialog>
    </>
  )
}
