import type { Art } from '../academics/types'

/* Pictures drawn by scripts/make-office-banners.mjs (banner) and scripts/make-academic-art.mjs (hero chip), both from public/images/offices. */
export function officeBanner(key: string, alt: string): Art {
  return { src: `/images/offices/banner-${key}.webp`, alt, width: 1672, height: 941 }
}
export function officeHero(key: string, alt = ''): Art {
  return { src: `/images/offices/${key}-hero.svg`, alt, width: 1600, height: 640 }
}
