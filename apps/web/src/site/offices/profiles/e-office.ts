import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/e-office/'

export const eOffice: OfficeProfile = {
  slug: 'e-office',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'E-Office',
  shortName: 'E-Office',
  lead: 'The digital workspace that replaces paper files in the university’s administration.',
  banner: officeBanner('e-office', 'E-Office. University of Swat.'),
  hero: officeHero('e-office'),
  about: [
    'The E-Office application at the University of Swat is transforming administrative operations by replacing traditional paper-based processes with a modern digital workspace. Developed to enhance institutional efficiency, the platform streamlines file management by eliminating delays associated with the physical movement and manual handling of documents.',
    'It enables authorized officials and staff to securely access, update, track, and share files in real time, resulting in faster decision-making, improved transparency, and enhanced accountability. By reducing the risk of document loss, misplacement, or unauthorized access, the E-Office system supports a more efficient and secure administrative environment.',
    'Through this digital transformation, the University of Swat is strengthening its governance, improving service delivery, and achieving substantial savings in time, operational costs, and paper consumption while promoting a sustainable and technology-driven campus.',
  ],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'E-Office page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: ['The page is one description. It names no officer, link to the application, telephone or e-mail.'],
}
