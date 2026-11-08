import type { SiteImage } from './types'

/* Every image reference lives here. `src: ''` renders the on-brand fallback (SafeImage).
   Real photos are in the project's Google Drive folder uswat_data/assets/images (crawled from the public site);
   Large Drive downloads are saved to a file by the connector, so they can be decoded and copied into apps/web/public/images/.
   TODO(images): add the chosen files there and set `src` here (root-relative, e.g. '/images/hero-gate.jpg').
   Suggested Drive files: cover-photo-c4f9957e.jpg, 5-a4f2119b.jpg, 3-443b3b5d.jpg, 1-1-1a2b66d0.jpg (campus),
   River-Swat-Pakistan-3-5caeb332.jpg (valley), WhatsApp-Image-* (news photos; check each for faces and consent). */

export const images = {
  /** Supplied by the user on 2026-11-07 for the leadership section. The studio backdrop was removed (segmentation model, 2026-11-08) so the portrait stands on the campus photo; 450x438 is not upscaled. */
  vc: {
    src: '/images/vc-husnul-amin-cutout.webp',
    alt: 'Portrait of Prof. Dr. Husnul Amin, Vice Chancellor of the University of Swat',
    width: 450,
    height: 438,
  } satisfies SiteImage,
  /** Supplied by the project owner on 2026-11-08 (event photographs from the university). Slider arrows and the dot strip
   *  that were in the screenshots are cropped off; about 830x550 px each, shown at about 600 px wide. Alt text describes the
   *  scene only; it does not name anyone. TODO(images): swap for full-resolution originals when available. */
  heroSlides: [
    { src: '/images/hero/hero-1-lecture-hall.jpg', alt: 'Faculty, staff and students gathered for a group photograph in a lecture hall', width: 850, height: 556 },
    { src: '/images/hero/hero-2-hec-meeting.jpg', alt: 'Officials in a meeting in an office with the Higher Education Commission emblem on the wall', width: 820, height: 555 },
    { src: '/images/hero/hero-3-group-outside.jpg', alt: 'Faculty, staff and students gathered for a group photograph outside a university building', width: 828, height: 550 },
    { src: '/images/hero/hero-4-conference-hall.jpg', alt: 'A seminar in progress in a conference hall', width: 854, height: 535 },
    { src: '/images/hero/hero-5-corridor.jpg', alt: 'Faculty members walking along a corridor in a university building', width: 813, height: 535 },
  ] satisfies SiteImage[],
  campus: { src: '', alt: 'University of Swat campus building with mountains behind', width: 1200, height: 800 } satisfies SiteImage,
  /* Decorative backdrops for the Vice Chancellor section (supplied by the project owner, 2026-11-08). The left one
     fades to near-white and is multiplied into the ivory; the right one (a campus building, replaced 2026-11-08) is
     faded into the ivory with a CSS mask. */
  vcBackdropLeft: { src: '/images/leadership/bg-left.webp', alt: '', width: 900, height: 1031 } satisfies SiteImage,
  vcBackdropRight: { src: '/images/leadership/bg-right-campus.webp', alt: '', width: 800, height: 1067 } satisfies SiteImage,
  /* Photos from the university's own news posts (copied from the project's Drive crawl, resized to 900 px wide).
     Alt text describes the scene only, with no names. Not yet confirmed by the owner for public use (people are visible). */
  newsThumbs: {
    niibs: { src: '/images/news/niibs-visit.webp', alt: 'University of Swat hosts the visiting delegation with a welcome bouquet', width: 900, height: 600 },
    climate: { src: '/images/news/climate-plaque.webp', alt: 'A commemorative shield is presented at the climate resilience conference at Bara Gali', width: 900, height: 600 },
    solar: { src: '', alt: '', width: 640, height: 420 },
  } satisfies Record<string, SiteImage>,
}
