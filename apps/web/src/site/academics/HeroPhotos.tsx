'use client'

import { useEffect, useState } from 'react'

import SafeImage from '../components/SafeImage'
import styles from './Academics.module.css'
import type { Art } from './types'

/** Seven seconds on each picture, the same as the landing page carousel (HeroCarousel). */
export const HERO_PHOTO_MS = 7000

/** Pictures on the physical left of the page's banner band. They fade out on their right edge (a mask in
    the CSS, set by `className`), so there is no hard edge between the photographs and the banner picture. The pictures are decoration:
    the hero's text says everything. Rotation stops when the tab is hidden and when the visitor prefers reduced motion. */
export default function HeroPhotos({ photos, className }: { photos: Art[]; className?: string }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (photos.length < 2) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return
    const id = window.setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % photos.length)
    }, HERO_PHOTO_MS)
    return () => window.clearInterval(id)
  }, [photos.length])

  return (
    <div className={className} aria-hidden="true">
      {photos.map((p, i) => (
        <div key={p.src} className={styles.heroPhoto} data-active={i === active ? '' : undefined}>
          <SafeImage
            src={p.src}
            alt=""
            fill
            sizes="(max-width: 860px) 100vw, 700px"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  )
}
