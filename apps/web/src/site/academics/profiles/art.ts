import type { Art } from '../types'

/* Pictures drawn by scripts/make-academic-art.mjs, served from /images/academics. */
export type ArtKey = 'dcst' | 'cs' | 'se' | 'it' | 'ds' | 'ai'
const SIZE = { hero: [1600, 640], tile: [900, 600], lab: [900, 600] } as const

export function art(key: ArtKey, kind: keyof typeof SIZE, alt = ''): Art {
  const [width, height] = SIZE[kind]
  return { src: `/images/academics/${key}-${kind}.svg`, alt, width, height }
}

/** The banner shown at the top of a page: public/images/academics/banner-<key>.webp. `alt` repeats the words in the picture. */
export function banner(key: ArtKey, alt: string): Art {
  return { src: `/images/academics/banner-${key}.webp`, alt, width: 1672, height: 941 }
}

/** A photograph in public/images/academics/<name>.webp. Pictures in the hero rotation are decoration, so their `alt` is empty. */
export function photo(name: string, width: number, height: number, alt = ''): Art {
  return { src: `/images/academics/${name}.webp`, alt, width, height }
}
