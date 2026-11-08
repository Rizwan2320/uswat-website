import { images } from './images'
import { site } from './site'
import type { SiteImage } from './types'

const U = 'https://uswat.edu.pk'

type Cta = { label: string; href: string; icon?: 'cap' | 'document' | 'book' | 'calendar' | 'people' | 'badge' }

export type HeroSlide = { image: SiteImage; primary: Cta; secondary: Cta }

export type HeroContent = {
  eyebrow: string
  /** Headline lines; `accent` is the part set in gold. Together they spell the tagline. */
  lines: { text: string; accent?: string }[]
  sub: string
}

/* Layout: photographs on one side, the text on the other. The headline (the tagline) and the sub line never change
   (user decision 2026-11-07: "sticky, not changing"). The photograph AND the two buttons change together, one slide
   every 5 seconds (user decision 2026-11-08). Every destination is a real uswat.edu.pk page already used in nav.ts. Labels are short so each pair stays on one row beside the photo. */
export const hero: HeroContent = {
  eyebrow: 'UNIVERSITY OF SWAT',
  lines: [{ text: 'Aspiring for' }, { text: 'Quality Education' }, { text: 'with ', accent: 'Relevance' }],
  sub: 'Join a vibrant academic community committed to excellence, innovation and service to society.',
}

// Guard: the headline must spell the tagline exactly.
if (hero.lines.map((l) => l.text + (l.accent ?? '')).join(' ') !== site.tagline) {
  throw new Error('hero headline must equal site.tagline')
}

export const heroSlides: HeroSlide[] = [
  {
    image: images.heroSlides[0]!,
    primary: { label: 'Explore Programs', href: `${U}/faculty/`, icon: 'cap' },
    secondary: { label: 'Admissions Fall 2026', href: `${U}/2026/10/undergraduate-admissions-fall-2026-phase-ii/`, icon: 'document' },
  },
  {
    image: images.heroSlides[1]!,
    primary: { label: 'Research', href: `${U}/oric-2/`, icon: 'book' },
    secondary: { label: 'Quality Enhancement', href: `${U}/quality-enhancement-cell/`, icon: 'badge' },
  },
  {
    image: images.heroSlides[2]!,
    primary: { label: 'Campus Life', href: `${U}/maincampus/`, icon: 'people' },
    secondary: { label: 'Student Services', href: `${U}/campus-management-system-uswat/`, icon: 'document' },
  },
  {
    image: images.heroSlides[3]!,
    primary: { label: 'Latest News', href: `${U}/category/latestnews/`, icon: 'document' },
    secondary: { label: 'Upcoming Events', href: `${U}/category/events/`, icon: 'calendar' },
  },
  {
    image: images.heroSlides[4]!,
    primary: { label: 'About Us', href: `${U}/about-university/`, icon: 'cap' },
    secondary: { label: 'Vice Chancellor’s Message', href: `${U}/vice-chancellors-message-2/`, icon: 'people' },
  },
]
