import { officeBanner, officeHero } from '../../../offices/art'
import type { Faq } from '../../types'

/* Shared by the science department profiles (Physics, Chemistry, Mathematics and Statistics). Pictures are the office-style art drawn by
   scripts/make-office-banners.mjs and scripts/make-academic-art.mjs, kept until the department supplies photographs. */
export const pictures = (key: string, departmentKey: string, bannerAlt: string, figureAlt: string) => ({
  hero: officeHero(key),
  banner: officeBanner(key, bannerAlt),
  tile: officeHero(key, figureAlt),
  figure: officeHero(departmentKey, figureAlt),
})

/** Questions that are the same for every science programme. */
export const scienceFaq = (shortName: string, years: number): Faq[] => [
  {
    q: 'How long is the programme?',
    a: `BS ${shortName} is planned over ${years} years, in ${years * 2} semesters. This plan is a draft; the department confirms the approved scheme of studies for each intake.`,
  },
  {
    q: 'Is there a final-year project?',
    a: 'Yes. In the last two semesters each student carries out a small project or research study with a supervisor and presents it to the department.',
  },
  {
    q: 'Where can I read the admission rules?',
    a: 'The admissions portal opens when an intake is announced, and merit lists are published on the university notices page.',
  },
]
