import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/alumni/'

export const alumni: OfficeProfile = {
  slug: 'alumni',
  lists: ['administration'],
  group: 'Centres and associations',
  name: 'Alumni Association',
  shortName: 'Alumni',
  lead: 'The university’s alumni relations office, with a registration form for graduates on the CMS portal.',
  banner: officeBanner('alumni', 'Alumni Association. University of Swat.'),
  hero: officeHero('alumni'),
  stats: [{ value: 2, label: 'staff listed on the alumni page' }],
  people: [
    { id: 'fida-hussain-alumni', name: 'Mr. Fida Hussain', title: 'Director Alumni Relations' },
    { id: 'imran-alumni', name: 'Dr. Imran', title: 'Deputy Director Alumni Relations' },
  ],
  emails: ['alumni@uswat.edu.pk'],
  links: [{ label: 'Alumni registration form', href: 'https://cms1.uswat.edu.pk/alumni/reg/form' }],
  officialPage: PAGE,
  sources: [
    { label: 'Alumni page, University of Swat', url: PAGE },
    { label: 'Alumni form, University of Swat CMS portal', url: 'https://cms1.uswat.edu.pk/alumni/reg/form' },
  ],
  verifiedAt: '2026-11-05',
  openPoints: ['The page does not state the office’s name, so “Alumni Association” follows the university’s menu. It gives no phone number or address.'],
}
