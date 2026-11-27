import type { HeroSlide } from '../content/hero'
import type { SiteImage, Stat } from '../content/types'
import type { HomeColours } from '../../governance/homePalette'

/* Pure mapping from the published `home-content` global (the admin's "Home page content") to the shapes the
   home page reads. Nothing here opens the CMS, so unit tests can use it. A part that the global does not hold
   (fewer rows than the admin's minimum, or a picture that cannot be shown) falls back to the sourced files in
   content/*.ts, so an unfinished or empty global never leaves the page without its slider or its figures. */

type MediaLike = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
}

type CtaDoc = { label?: string | null; href?: string | null; icon?: HeroSlide['primary']['icon'] | null }

export type HomeDoc = {
  colours?: HomeColours | null
  slides?: { image?: number | MediaLike | null; primary?: CtaDoc | null; secondary?: CtaDoc | null }[] | null
  stats?:
    | {
        value?: number | null
        suffix?: string | null
        label?: string | null
        icon?: Stat['icon'] | null
        sample?: boolean | null
        source?: string | null
        verifiedAt?: string | null
      }[]
    | null
}

/** The same counts the admin enforces when the global is published (governance/homeContent.ts). */
export const MIN_SLIDES = 3
export const MIN_STATS = 3

const isMedia = (m: unknown): m is MediaLike => typeof m === 'object' && m !== null

const toImage = (m: MediaLike | number | null | undefined): SiteImage | null => {
  if (!isMedia(m) || !m.url || !m.alt || !m.width || !m.height) return null
  const focus =
    typeof m.focalX === 'number' && typeof m.focalY === 'number' ? `${Math.round(m.focalX)}% ${Math.round(m.focalY)}%` : undefined
  return { src: m.url, alt: m.alt, width: m.width, height: m.height, ...(focus ? { focus } : {}) }
}

const toCta = (c: CtaDoc | null | undefined): HeroSlide['primary'] | null =>
  c && c.label && c.href ? { label: c.label, href: c.href, ...(c.icon ? { icon: c.icon } : {}) } : null

export function toHeroSlides(doc: HomeDoc | null | undefined, fallback: HeroSlide[]): HeroSlide[] {
  const slides: HeroSlide[] = []
  for (const row of doc?.slides ?? []) {
    const image = toImage(row.image)
    const primary = toCta(row.primary)
    const secondary = toCta(row.secondary)
    if (image && primary && secondary) slides.push({ image, primary, secondary })
  }
  return slides.length >= MIN_SLIDES ? slides : fallback
}

export function toStats(doc: HomeDoc | null | undefined, fallback: Stat[]): Stat[] {
  const stats: Stat[] = []
  for (const [i, row] of (doc?.stats ?? []).entries()) {
    if (typeof row.value !== 'number' || !row.label || !row.icon) continue
    stats.push({
      id: `home-stat-${i + 1}`,
      value: row.value,
      ...(row.suffix ? { suffix: row.suffix } : {}),
      label: row.label,
      icon: row.icon,
      ...(row.sample ? { sample: true } : {}),
      ...(row.source ? { source: row.source } : {}),
      ...(row.verifiedAt ? { verifiedAt: row.verifiedAt.slice(0, 10) } : {}),
    })
  }
  return stats.length >= MIN_STATS ? stats : fallback
}
