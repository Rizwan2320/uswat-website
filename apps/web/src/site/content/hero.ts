import { images } from './images'
import { site } from './site'
import type { SiteImage } from './types'

export type HeroContent = {
  eyebrow: string
  /** Headline lines; `accent` is the part set in gold. Together they spell the tagline. */
  lines: { text: string; accent?: string }[]
  sub: string
  primary: { label: string; href: string; icon: 'cap' | 'document' }
  secondary: { label: string; href: string; icon: 'cap' | 'document' }
}

/* The headline is the university tagline and never changes (user decision, 2026-11-07: "sticky, not changing").
   Only the background photographs rotate, and only when two or more real photos have a `src`
   (content/images.ts). With no photos the hero is a single static banner and shows no slideshow controls.
   The sub line is the mockup's. Destinations are real pages on uswat.edu.pk. */
export const hero: HeroContent = {
  eyebrow: 'UNIVERSITY OF SWAT',
  lines: [{ text: 'Aspiring for Quality Education' }, { text: 'with ', accent: 'Relevance' }],
  sub: 'Join a vibrant academic community committed to excellence, innovation and service to society.',
  primary: { label: 'Explore Programs', href: 'https://uswat.edu.pk/faculty/', icon: 'cap' },
  secondary: { label: 'Admissions Fall 2026', href: 'https://uswat.edu.pk/2026/10/undergraduate-admissions-fall-2026-phase-ii/', icon: 'document' },
}

// Guard: the headline must spell the tagline exactly.
if (hero.lines.map((l) => l.text + (l.accent ?? '')).join(' ') !== site.tagline) {
  throw new Error('hero headline must equal site.tagline')
}

export const heroBackgrounds: SiteImage[] = images.heroSlides
