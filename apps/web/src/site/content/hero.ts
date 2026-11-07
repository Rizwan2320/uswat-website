import { images } from './images'
import type { SiteImage } from './types'

export type HeroSlide = {
  id: string
  eyebrow: string
  /** Two headline lines; `accent` is the part set in gold. */
  lines: { text: string; accent?: string }[]
  sub: string
  primary: { label: string; href: string; icon: 'cap' | 'document' }
  secondary: { label: string; href: string; icon: 'cap' | 'document' }
  image: SiteImage
}

/* Slide 1 is the mockup's copy. Slides 2-4 reuse the layout; their destinations are real pages on uswat.edu.pk.
   The line "Join a vibrant academic community committed to excellence, innovation and service to society." is the mockup's. */
export const heroSlides: HeroSlide[] = [
  {
    id: 'learn',
    eyebrow: 'UNIVERSITY OF SWAT',
    lines: [{ text: 'A place to learn.' }, { text: 'A future to ', accent: 'shape.' }],
    sub: 'Join a vibrant academic community committed to excellence, innovation and service to society.',
    primary: { label: 'Explore Programs', href: 'https://uswat.edu.pk/faculty/', icon: 'cap' },
    secondary: { label: 'Admissions Fall 2026', href: 'https://uswat.edu.pk/2026/10/undergraduate-admissions-fall-2026-phase-ii/', icon: 'document' },
    image: images.heroSlides[0]!,
  },
  {
    id: 'admissions',
    eyebrow: 'ADMISSIONS',
    lines: [{ text: 'Begin your journey' }, { text: 'at ', accent: 'Swat.' }],
    sub: 'Check notices and merit lists, then apply through the online admission portal.',
    primary: { label: 'Admission Portal', href: 'https://cms1.uswat.edu.pk/admission/program/list', icon: 'document' },
    secondary: { label: 'Scholarships', href: 'https://uswat.edu.pk/2026/11/kpef-merit-cum-inaffordability-scholarship-scheme-2025-26/', icon: 'cap' },
    image: images.heroSlides[1]!,
  },
  {
    id: 'research',
    eyebrow: 'RESEARCH',
    lines: [{ text: 'Ideas that' }, { text: 'serve ', accent: 'society.' }],
    sub: 'Research, innovation and quality assurance, led by ORIC and the Quality Enhancement Cell.',
    primary: { label: 'Explore Research', href: 'https://uswat.edu.pk/oric-2/', icon: 'cap' },
    secondary: { label: 'SUJRIS Journal', href: 'https://sujris.uswat.edu.pk/', icon: 'document' },
    image: images.heroSlides[2]!,
  },
  {
    id: 'campus',
    eyebrow: 'CAMPUS LIFE',
    lines: [{ text: 'Learn in the heart' }, { text: 'of the ', accent: 'valley.' }],
    sub: 'Two campuses, a lively student community and the natural beauty of Swat.',
    primary: { label: 'Main Campus', href: 'https://uswat.edu.pk/maincampus/', icon: 'cap' },
    secondary: { label: 'Women Campus', href: 'https://uswat.edu.pk/women-campus/', icon: 'document' },
    image: images.heroSlides[3]!,
  },
]
