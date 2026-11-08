'use client'

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import { T, useI18n } from './I18n'
import { ArrowRightIcon } from './icons'
import styles from './LeadershipDialog.module.css'

type Props = {
  name: string
  role: string
  paragraphs: string[]
  complete: boolean
  closing?: string
  sourceHref: string
}

const subscribeNever = () => () => {}

/* "Read Full Message": a small fixed-size window over the home page. It is deliberately NOT modal: no backdrop, no blur,
   the page behind stays visible, scrollable and clickable. Long text scrolls inside the window. It closes with the X
   button, Escape, or a click outside it, and focus returns to the button. Without JavaScript the button is a normal link
   to the university's own page. The window is portalled to <body> so no section's stacking context can hide it. */
export default function LeadershipDialog({ name, role, paragraphs, complete, closing, sourceHref }: Props) {
  // false while rendering on the server and during hydration, true afterwards (no setState-in-effect needed).
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false)
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const panelId = useId()
  const { t } = useI18n()

  // Show / hide the (non-modal) dialog to follow the state.
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (isOpen && !d.open) {
      d.show()
      closeRef.current?.focus()
    } else if (!isOpen && d.open) {
      d.close()
    }
  }, [isOpen, mounted])

  // Escape and clicks outside close it (the click still reaches whatever was clicked: the page is not blocked).
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node
      if (dialogRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [isOpen])

  const close = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <a
        ref={triggerRef}
        className="btn btn--forest"
        href={sourceHref}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={mounted ? panelId : undefined}
        onClick={(e) => {
          if (!mounted) return // before hydration: follow the link
          e.preventDefault()
          setIsOpen((o) => !o)
        }}
      >
        <T k="Read Full Message" /> <ArrowRightIcon className="btn-arrow" />
      </a>

      {mounted
        ? createPortal(
            <dialog ref={dialogRef} id={panelId} className={styles.window} aria-labelledby={titleId}>
              <div className={styles.panel}>
                <header className={styles.head}>
                  <h3 id={titleId} className={styles.title}>
                    <T k="A Message from Our Vice Chancellor" />
                  </h3>
                  <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label={t('Close')}>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
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
                    {closing ? <em>{closing}</em> : null}
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </p>
                </div>
              </div>
            </dialog>,
            document.body,
          )
        : null}
    </>
  )
}
