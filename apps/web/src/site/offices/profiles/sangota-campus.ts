import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/sangota-campus/'

export const sangotaCampus: OfficeProfile = {
  slug: 'sangota-campus',
  path: '/campuses/sangota',
  trail: [{ label: 'Campus life', href: '/campuses/main' }],
  lists: [],
  group: 'Departments',
  name: 'Sangota Campus',
  shortName: 'Sangota Campus',
  lead: 'The departments the university lists at its Sangota campus.',
  banner: officeBanner('sangota-campus', 'Sangota Campus. University of Swat.'),
  hero: officeHero('sangota-campus'),
  stats: [{ value: 2, label: 'departments listed' }],
  itemLists: [
    {
      title: 'Departments in Sangota',
      items: ['Department of Law and Sharia’h', 'Institute of Cultural Heritage, Tourism and Hospitality Management'],
    },
  ],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'Sangota Campus page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page lists two departments and nothing else: no address, contact details, history or programmes.',
    'The Main Campus page also lists a Department of Law and Shariah in Academic Block B; the university will confirm whether these are the same department.',
  ],
}
