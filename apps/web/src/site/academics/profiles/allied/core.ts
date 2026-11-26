import { officeBanner, officeHero } from '../../../offices/art'
import type { Faq } from '../../types'

/* Shared by the Allied Health Sciences profiles. Pictures are the office-style art drawn by scripts/make-office-banners.mjs and
   scripts/make-academic-art.mjs, kept until the faculty supplies photographs. */
export const FACULTY = 'allied-health-sciences'

export const pictures = (key: string, bannerAlt: string, figureAlt: string) => ({
  hero: officeHero(key),
  banner: officeBanner(key, bannerAlt),
  tile: officeHero(key, figureAlt),
  figure: officeHero(FACULTY, figureAlt),
})

/** Questions that are the same for every Allied Health programme. */
export const ahFaq = (shortName: string, years: number): Faq[] => [
  {
    q: 'How long is the programme?',
    a: `The ${shortName} programme is planned over ${years} years, in ${years * 2} semesters. The first year covers the basic sciences the programme builds on.`,
  },
  {
    q: 'Do students train in a hospital or clinic?',
    a: 'Yes. The last year includes supervised clinical or laboratory attachments, and students keep a log of the procedures they have done.',
  },
  {
    q: 'Where can I read the admission rules?',
    a: 'The admissions portal opens when an intake is announced, and merit lists are published on the university notices page. The eligibility is shown on this page once the faculty has confirmed it.',
  },
]
