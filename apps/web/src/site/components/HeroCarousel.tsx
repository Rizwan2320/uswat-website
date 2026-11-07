'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'

import type { HeroSlide } from '../content/hero'
import { ArrowRightIcon, CapIcon, DocumentIcon, DoubleChevronLeftIcon, DoubleChevronRightIcon, PauseIcon, PlayIcon } from './icons'
import SafeImage from './SafeImage'
import styles from './HeroCarousel.module.css'

const AUTOPLAY_MS = 6000
const cta = { cap: CapIcon, document: DocumentIcon }

/* 4-slide hero. Autoplay ~6 s; pauses on hover, on focus inside, when the tab is hidden, and never starts under
   prefers-reduced-motion. A visible pause/play button, previous/next, labelled dots, arrow keys and swipe are provided.
   No-JS / first paint: slide 1 is rendered active by the server. */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true) // user intent
  const [hovering, setHovering] = useState(false)
  const [focusIn, setFocusIn] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reduced, setReduced] = useState(false)
  const down = useRef<number | null>(null)
  const count = slides.length

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

  const rotating = playing && !reduced && !hovering && !focusIn && !hidden

  useEffect(() => {
    if (!rotating) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [rotating, count, index]) // `index` restarts the timer after a manual change

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  const onPointerDown = (e: PointerEvent) => { down.current = e.clientX }
  const onPointerUp = (e: PointerEvent) => {
    if (down.current === null) return
    const dx = e.clientX - down.current
    down.current = null
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
  }

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusIn(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusIn(false) }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
    >
      <div className={styles.media} aria-hidden="true">
        {slides.map((s, i) => (
          <div key={s.id} className={styles.bg} data-active={i === index ? '' : undefined}>
            <SafeImage
              src={s.image.src}
              alt=""
              fill
              sizes="(max-width: 1200px) 100vw, 1600px"
              priority={i === 0}
              className={styles.photo}
            />
            {!s.image.src ? <Ridge /> : null}
          </div>
        ))}
      </div>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <div
          className={styles.slides}
          aria-live={rotating ? 'off' : 'polite'}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {slides.map((s, i) => {
            const Heading = i === 0 ? 'h1' : 'h2' // one <h1> per page
            const P = cta[s.primary.icon]
            const S = cta[s.secondary.icon]
            return (
              <div
                key={s.id}
                className={styles.slide}
                data-active={i === index ? '' : undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i === index ? undefined : true}
                inert={i === index ? undefined : true}
              >
                <p className={styles.eyebrow}>
                  <span>{s.eyebrow}</span>
                  <span className={styles.rule} aria-hidden="true" />
                </p>
                <Heading className={styles.title}>
                  {s.lines.map((l) => (
                    <span key={l.text + (l.accent ?? '')} className={styles.line}>
                      {l.text}
                      {l.accent ? <span className={styles.accent}>{l.accent}</span> : null}
                    </span>
                  ))}
                </Heading>
                <p className={styles.sub}>{s.sub}</p>
                <div className={styles.ctas}>
                  <a className="btn btn--gold" href={s.primary.href} rel="noopener noreferrer">
                    <P /> {s.primary.label} <ArrowRightIcon className="btn-arrow" />
                  </a>
                  <a className="btn btn--outline-light" href={s.secondary.href} rel="noopener noreferrer">
                    <S /> {s.secondary.label} <ArrowRightIcon className="btn-arrow" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        <div className={`${styles.controls} hero-controls`}>
          <button type="button" className={`${styles.round} ${styles.ghost}`} aria-label="Previous slide" onClick={() => go(index - 1)}>
            <DoubleChevronLeftIcon className="flip" />
          </button>
          <div className={styles.dots}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={styles.dotBtn}
                aria-label={`Go to slide ${i + 1} of ${count}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
              >
                <span className={styles.dot} data-active={i === index ? '' : undefined} />
              </button>
            ))}
          </div>
          <button type="button" className={`${styles.round} ${styles.solid}`} aria-label="Next slide" onClick={() => go(index + 1)}>
            <DoubleChevronRightIcon className="flip" />
          </button>
          <button
            type="button"
            className={`${styles.round} ${styles.ghost}`}
            aria-label={playing && !reduced ? 'Pause slideshow' : 'Play slideshow'}
            aria-pressed={!(playing && !reduced)}
            disabled={reduced}
            onClick={() => setPlaying((v) => !v)}
          >
            {playing && !reduced ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
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
