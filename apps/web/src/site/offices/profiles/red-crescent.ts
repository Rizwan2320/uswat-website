import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/red-crescent-building/'

export const redCrescent: OfficeProfile = {
  slug: 'red-crescent-building',
  path: '/red-crescent-building',
  trail: [{ label: 'Campus life', href: '/campuses/main' }],
  lists: [],
  group: 'Departments',
  name: 'Red Crescent Building',
  shortName: 'Red Crescent',
  lead: 'The department the university lists in its Red Crescent building.',
  banner: officeBanner('red-crescent-building', 'Red Crescent Building. University of Swat.'),
  hero: officeHero('red-crescent-building'),
  stats: [{ value: 1, label: 'department listed' }],
  itemLists: [{ title: 'Departments in Red Crescent', items: ['Department of Environmental and Conservation Sciences'] }],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'Red Crescent page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page lists one department and nothing else: no address or contact details.',
    'The Main Campus page lists a Department of Environmental Sciences; the university will confirm whether it is the same department.',
  ],
}
