import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/central-library-office/'

export const library: OfficeProfile = {
  slug: 'central-library-office',
  lists: [],
  path: '/administration/central-library-office',
  trail: [{ label: 'Administration', href: '/administration' }],
  group: 'Academic services',
  name: 'Central Library',
  shortName: 'Central Library',
  lead: 'The university’s central library: who works there, when it is open and how to write to it.',
  banner: officeBanner('central-library-office', 'Central Library. University of Swat.'),
  hero: officeHero('central-library-office'),
  people: [
    { id: 'wajid-rashid', name: 'Dr. Wajid Rashid', title: 'Librarian' },
    { id: 'muhammad-salman-raziq', name: 'Mr. Muhammad Salman Raziq', title: 'Library Assistant' },
    { id: 'painda-mand', name: 'Mr. Painda Mand', title: 'Library Assistant' },
    { id: 'fazal-rabbi', name: 'Mr. Fazal Rabbi', title: 'Senior Library Attendant' },
  ],
  hours: '08:30 AM – 04:30 PM, Monday – Friday',
  emails: ['librarian@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Central Library page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives only the staff, the opening hours and one e-mail address. Collections, borrowing rules, a telephone number and the library’s address are not published there.',
    'The university’s menu also points to a separate Digital Library; it is not described on this page.',
  ],
}
