import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/kamyab-jawan-markaz/'

export const ydc: OfficeProfile = {
  slug: 'kamyab-jawan-markaz',
  lists: ['administration'],
  group: 'Centres and associations',
  name: 'Youth Development Centre (YDC)',
  shortName: 'YDC',
  lead: 'A centre near the main gate with a focal person and facilitation officers for education, employment and engagement services.',
  banner: officeBanner('kamyab-jawan-markaz', 'Youth Development Centre (YDC). University of Swat.'),
  hero: officeHero('kamyab-jawan-markaz'),
  stats: [
    { value: 3, label: 'service areas' },
    { value: 4, label: 'staff listed on the centre’s page' },
  ],
  servicesTitle: 'Facilitation services',
  services: [
    { icon: 'cap', title: 'Education services', text: 'Facilitation Officer: Dr. Imran.' },
    { icon: 'briefcase', title: 'Employment services', text: 'Facilitation Officer: Mr. Tariq Ziad.' },
    { icon: 'users', title: 'Engagement services', text: 'Facilitation Officer: Dr. Amjad Ali.' },
  ],
  people: [
    { id: 'fida-hussain', name: 'Mr. Fida Hussain', title: 'Focal Person' },
    { id: 'imran', name: 'Dr. Imran', title: 'Facilitation Officer for Education Services' },
    { id: 'tariq-ziad', name: 'Mr. Tariq Ziad', title: 'Facilitation Officer for Employment Services' },
    { id: 'amjad-ali', name: 'Dr. Amjad Ali', title: 'Facilitation Officer for Engagement Services' },
  ],
  address: 'Youth Development Centre (YDC), Near Main Gate, University of Swat, Charbagh, Swat, Khyber Pakhtunkhwa, Pakistan',
  emails: ['ydc@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Youth Development Centre page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-05',
  openPoints: ['The page gives no phone number. Mr. Fida Hussain and Dr. Imran also appear on the alumni page with other titles; the university has not reconciled this.'],
}
