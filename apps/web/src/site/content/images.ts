import type { SiteImage } from './types'

/* Every image reference lives here. `src: ''` renders the on-brand fallback (SafeImage).
   Real photos are in the project's Google Drive folder uswat_data/assets/images (crawled from the public site);
   they are not copied into the repo yet because the Drive connector only returns base64 into the chat.
   TODO(images): add the chosen files to apps/web/public/images/ and set `src` here (root-relative, e.g. '/images/hero-gate.jpg').
   Suggested Drive files: cover-photo-c4f9957e.jpg, 5-a4f2119b.jpg, 3-443b3b5d.jpg, 1-1-1a2b66d0.jpg (campus),
   River-Swat-Pakistan-3-5caeb332.jpg (valley), WhatsApp-Image-* (news photos; check each for faces and consent). */

export const images = {
  /** Supplied by the user on 2026-11-07 for the leadership section. 450x438 is below the 600 px portrait minimum, so it is masked and not upscaled. */
  vc: {
    src: '/images/vc-husnul-amin.png',
    alt: 'Portrait of Prof. Dr. Husnul Amin, Vice Chancellor of the University of Swat',
    width: 450,
    height: 438,
  } satisfies SiteImage,
  heroSlides: [
    { src: '', alt: 'Main gate of the University of Swat', width: 1600, height: 900 },
    { src: '', alt: 'Students in an admissions counselling session', width: 1600, height: 900 },
    { src: '', alt: 'Researchers in a university laboratory', width: 1600, height: 900 },
    { src: '', alt: 'The Swat valley campus in the mountains', width: 1600, height: 900 },
  ] satisfies SiteImage[],
  campus: { src: '', alt: 'University of Swat campus building with mountains behind', width: 1200, height: 800 } satisfies SiteImage,
  newsThumbs: {
    niibs: { src: '', alt: '', width: 640, height: 420 },
    climate: { src: '', alt: '', width: 640, height: 420 },
    climateAlt: { src: '', alt: '', width: 640, height: 420 },
    solar: { src: '', alt: '', width: 640, height: 420 },
  } satisfies Record<string, SiteImage>,
}
