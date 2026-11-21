import type { Art } from '../types'

/* Pictures drawn by scripts/make-academic-art.mjs, served from /images/academics. */
export type ArtKey = 'dcst' | 'cs' | 'se' | 'it' | 'ds' | 'ai'
const SIZE = { hero: [1600, 640], tile: [900, 600], lab: [900, 600] } as const

export function art(key: ArtKey, kind: keyof typeof SIZE, alt = ''): Art {
  const [width, height] = SIZE[kind]
  return { src: `/images/academics/${key}-${kind}.svg`, alt, width, height }
}

/** The owner's photograph of the main campus (already on the home page). */
export const campusPhoto: Art = {
  src: '/images/hero/hero-6-campus-sunset.jpg',
  alt: 'The University of Swat main campus at sunset, with wet paths, lit buildings and misty mountains',
  width: 1000,
  height: 653,
}
