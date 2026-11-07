'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'

import type { HeroContent } from '../content/hero'
import type { SiteImage } from '../content/types'
import { ArrowRightIcon, CapIcon, DocumentIcon, DoubleChevronLeftIcon, DoubleChevronRightIcon, PauseIcon, PlayIcon } from './icons'
import SafeImage from './SafeImage'
import styles from './HeroCarousel.module.css'

const AUTOPLAY_MS = 6000
const cta = { cap: CapIcon, document: DocumentIcon }

/* Hero banner. The headline (the tagline), sub line and buttons are static and rendered by the server.
   Only the BACKGROUND photographs rotate, and only when two or more photos exist; otherwise there is one static
   background and no controls. When rotating: autoplay ~6 s, paused on hover, on focus inside, when the tab is hidden,
   never under prefers-reduced-motion; a visible pause/play button, previous/next, labelled dots, arrow keys and swipe. */
export default function HeroCarousel({ content, backgrounds }: { content: HeroContent; backgrounds: SiteImage[] }) {
  const photos = backgrounds.filter((b) => b.src)
  const slides = photos.length > 0 ? photos : backgrounds.slice(0, 1) // none yet: one ridge-only background
  const count = slides.length
  const multi = photos.length > 1

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true) // user intent
  const [hovering, setHovering] = useState(false)
  const [focusIn, setFocusIn] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reduced, setReduced] = useState(false)
  const down = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    const vis = () => setHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', vis)
    return () => {
      mq.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [])

  const rotating = multi && playing && !reduced && !hovering && !focusIn && !hidden

  useEffect(() => {
    if (!rotating) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [rotating, count, index]) // `index` restarts the timer after a manual change

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  const onPointerDown = (e: PointerEvent) => { down.current = e.clientX }
  const onPointerUp = (e: PointerEvent) => {
    if (down.current === null || !multi) return
    const dx = e.clientX - down.current
    down.current = null
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
  }

  const P = cta[content.primary.icon]
  const S = cta[content.secondary.icon]

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusIn(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusIn(false) }}
      onKeyDown={(e) => {
        if (!multi) return
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
    >
      <div className={styles.media} aria-hidden="true">
        {slides.map((s, i) => (
          <div key={s.src || i} className={styles.bg} data-active={i === index ? '' : undefined}>
            <SafeImage src={s.src} alt="" fill sizes="(max-width: 1200px) 100vw, 1600px" priority={i === 0} className={styles.photo} />
            {!s.src ? <Ridge /> : null}
          </div>
        ))}
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <div className={styles.slides} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div className={styles.slide} data-active="">
            <p className={styles.eyebrow}>
              <span>{content.eyebrow}</span>
              <span className={styles.rule} aria-hidden="true" />
            </p>
            <h1 className={styles.title}>
              {content.lines.map((l) => (
                <span key={l.text + (l.accent ?? '')} className={styles.line}>
                  {l.text}{' '}
                  {l.accent ? <span className={styles.accent}>{l.accent}</span> : null}
                </span>
              ))}
            </h1>
            <p className={styles.sub}>{content.sub}</p>
            <div className={styles.ctas}>
              <a className="btn btn--gold" href={content.primary.href} rel="noopener noreferrer">
                <P /> {content.primary.label} <ArrowRightIcon className="btn-arrow" />
              </a>
              <a className="btn btn--outline-light" href={content.secondary.href} rel="noopener noreferrer">
                <S /> {content.secondary.label} <ArrowRightIcon className="btn-arrow" />
              </a>
            </div>
          </div>
        </div>

        {multi ? (
          <div className={`${styles.controls} hero-controls`} role="group" aria-label="Background photographs">
            <button type="button" className={`${styles.round} ${styles.ghost}`} aria-label="Previous photograph" onClick={() => go(index - 1)}>
              <DoubleChevronLeftIcon className="flip" />
            </button>
            <div className={styles.dots}>
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  className={styles.dotBtn}
                  aria-label={`Show photograph ${i + 1} of ${count}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => go(i)}
                >
                  <span className={styles.dot} data-active={i === index ? '' : undefined} />
                </button>
              ))}
            </div>
            <button type="button" className={`${styles.round} ${styles.solid}`} aria-label="Next photograph" onClick={() => go(index + 1)}>
              <DoubleChevronRightIcon className="flip" />
            </button>
            <button
              type="button"
              className={`${styles.round} ${styles.ghost}`}
              aria-label={playing && !reduced ? 'Pause photo rotation' : 'Play photo rotation'}
              aria-pressed={!(playing && !reduced)}
              disabled={reduced}
              onClick={() => setPlaying((v) => !v)}
            >
              {playing && !reduced ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* Decorative mountain ridge shown behind the gradient when a slide has no photo yet. */
function Ridge() {
  return (
    <svg className={styles.ridge} viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <path d="M0 400V250l110-70 90 60 130-120 120 100 100-70 150 130 120-90 150 110 130-60V400Z" fill="rgb(252 250 244 / .06)" />
      <path d="M0 400V310l140-60 120 50 160-90 130 80 150-60 140 70 120-50 240 80V400Z" fill="rgb(242 183 5 / .10)" />
    </svg>
  )
}
