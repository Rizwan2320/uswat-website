import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

import { admissions } from './admissions'

const PAGE = 'https://uswat.edu.pk/directorate-of-admissions/'
const U = 'https://uswat.edu.pk'

export const admissionsHub: OfficeProfile = {
  slug: 'admissions',
  path: '/admissions',
  trail: [],
  lists: [],
  group: 'Academic services',
  name: 'Admissions',
  shortName: 'Admissions',
  lead: 'Where to apply, the notices of each admission round, merit lists, scholarships, loans and the forms and policies, with the Directorate of Admissions behind them.',
  banner: officeBanner('admissions', 'Admissions. University of Swat.'),
  hero: officeHero('admissions'),
  stats: [
    { value: 15, label: 'admission notices on the Directorate’s page' },
    { value: 18, label: 'merit list titles on the merit list page' },
  ],
  about: [
    'The university announces each admission round as a notice. The Directorate of Admissions’ page lists fifteen of them, from Fall 2020 to Fall 2026, for undergraduate programmes and for MS, MPhil and PhD.',
    'Applications go through the university’s admission portal. The pages below hold the latest undergraduate notice, the scholarship and loan schemes, the provisional merit lists, and the forms, rules and policies.',
  ],
  links: [
    { label: 'Admission portal (apply online)', href: 'https://cms1.uswat.edu.pk/admission/program/list' },
    { label: 'Undergraduate Admissions Fall 2026, Phase II', href: `${U}/2026/10/undergraduate-admissions-fall-2026-phase-ii/` },
    { label: 'KPEF Merit-cum-Inaffordability Scholarship Scheme 2025-26', href: `${U}/2026/11/kpef-merit-cum-inaffordability-scholarship-scheme-2025-26/` },
    { label: 'Student loan schemes', href: `${U}/2026/10/students-loan-shemes/` },
    { label: 'Merit lists', href: '/admissions/merit-lists' },
    { label: 'Forms, rules, policies and manuals', href: '/downloads' },
    { label: 'Open Day for Admissions', href: '/open-day' },
    { label: 'University Advancement and Financial Aid Office', href: '/administration/university-advancement-financial-aid-office' },
    { label: 'Directorate of Admissions', href: '/administration/directorate-of-admissions' },
  ],
  itemLists: admissions.itemLists,
  people: admissions.people,
  address: admissions.address,
  emails: admissions.emails,
  officialPage: PAGE,
  sources: [
    { label: 'Directorate of Admissions page, University of Swat', url: PAGE },
    { label: 'Undergraduate Admissions Fall 2026, Phase II, University of Swat', url: `${U}/2026/10/undergraduate-admissions-fall-2026-phase-ii/` },
    { label: 'KPEF Merit-cum-Inaffordability Scholarship Scheme 2025-26, University of Swat', url: `${U}/2026/11/kpef-merit-cum-inaffordability-scholarship-scheme-2025-26/` },
    { label: 'Student loan schemes, University of Swat', url: `${U}/2026/10/students-loan-shemes/` },
  ],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The university’s old Admission Rules, Online Admissions and Fee Structure pages are empty, so this site has no fee table or admission rules page. The “Forms, rules, policies and manuals” page holds the titles of the fee notifications and the admission policies.',
    'No closing dates or seat numbers are shown: the notices carry them and the copies that were read did not.',
  ],
}
