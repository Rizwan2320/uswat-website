'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'

import type { HeroContent, HeroSlide } from '../content/hero'
import {
  ArrowRightIcon, BadgeIcon, BookIcon, CalendarIcon, CapIcon, DocumentIcon, DoubleChevronLeftIcon,
  DoubleChevronRightIcon, PauseIcon, PeopleIcon, PlayIcon,
} from './icons'
import SafeImage from './SafeImage'
import styles from './HeroCarousel.module.css'

const AUTOPLAY_MS = 7000
const icons = { cap: CapIcon, document: DocumentIcon, book: BookIcon, calendar: CalendarIcon, people: PeopleIcon, badge: BadgeIcon }

/* Hero. Photographs on one side, the static headline (the tagline) and sub line on the other. The photograph and the
   two buttons change together, one slide every 10 s. Autoplay pauses on hover, on focus inside, when the tab is hidden
   and under prefers-reduced-motion; there is a visible pause/play button, previous/next (the small round buttons from
   the mockup), labelled dots, arrow keys and swipe. Inactive slides are aria-hidden and their buttons are inert. */
export default function HeroCarousel({ content, slides }: { content: HeroContent; slides: HeroSlide[] }) {
  const count = slides.length
  const multi = count > 1

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

  const anyMissing = slides.some((s) => !s.image.src)

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      /* Only keyboard focus pauses: a mouse click leaves focus on the button, which would stall autoplay for good. */
      onFocus={(e) => { if (e.target.matches(':focus-visible')) setFocusIn(true) }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusIn(false) }}
      onKeyDown={(e) => {
        if (!multi) return
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={styles.root}
    >
      {anyMissing ? <div className={styles.media} aria-hidden="true"><Ridge /></div> : null}

      {/* Photographs fill the far side of the hero and fade into the green (a mask), as in the mockup. */}
      <div className={styles.photos} aria-live={rotating ? 'off' : 'polite'}>
        {slides.map((s, i) => (
          <div
            key={s.image.src || i}
            className={styles.photo}
            data-active={i === index ? '' : undefined}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i === index ? undefined : true}
          >
            <SafeImage
              src={s.image.src}
              alt={s.image.alt}
              fill
              sizes="(max-width: 899px) 100vw, 62vw"
              priority={i === 0}
              className={styles.img}
              style={s.image.focus ? { objectPosition: s.image.focus } : undefined}
            />
          </div>
        ))}
      </div>
      <div className={styles.shade} aria-hidden="true" />

      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
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

          <div className={styles.ctaStack}>
            {slides.map((s, i) => {
              const P = icons[s.primary.icon ?? 'cap']
              const S = icons[s.secondary.icon ?? 'document']
              const active = i === index
              return (
                <div key={s.primary.label} className={styles.ctas} data-active={active ? '' : undefined} inert={!active}>
                  <a className="btn btn--gold" href={s.primary.href} rel="noopener noreferrer">
                    <P /> {s.primary.label} <ArrowRightIcon className="btn-arrow" />
                  </a>
                  <a className="btn btn--outline-light" href={s.secondary.href} rel="noopener noreferrer">
                    <S /> {s.secondary.label} <ArrowRightIcon className="btn-arrow" />
                  </a>
                </div>
              )
            })}
          </div>

          {multi ? (
            <div className={`${styles.controls} hero-controls`} role="group" aria-label="Slide controls">
              <button type="button" className={`${styles.round} ${styles.ghost}`} aria-label="Previous slide" onClick={() => go(index - 1)}>
                <DoubleChevronLeftIcon className="flip" />
              </button>
              <div className={styles.dots}>
                {slides.map((s, i) => (
                  <button
                    key={s.image.src || i}
                    type="button"
                    className={styles.dotBtn}
                    aria-label={`Show slide ${i + 1} of ${count}`}
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
          ) : null}
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
