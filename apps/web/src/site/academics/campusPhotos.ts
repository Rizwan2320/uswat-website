import { images } from '../content/images'
import type { Art } from './types'

/** The university's own photographs that rotate on the right of a page banner, the same seven the landing page shows
    (`images.heroSlides`). They are decoration here, so `alt` is empty. DCST pages use their own set instead. */
export const CAMPUS_PHOTOS: Art[] = images.heroSlides.map((s) => ({ src: s.src, alt: '', width: s.width, height: s.height }))
