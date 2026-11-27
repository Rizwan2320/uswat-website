import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/dean-office-3/'

export const deanOfficeChemicalSciences: OfficeProfile = {
  slug: 'dean-office-3',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Dean’s Office, Faculty of Chemical Sciences',
  shortName: 'Dean, Chemical Sciences',
  lead: 'The Dean of the Faculty of Chemical Sciences, as the university’s office page names him.',
  banner: officeBanner('dean-office-3', 'Dean’s Office, Faculty of Chemical Sciences. University of Swat.'),
  hero: officeHero('dean-office-3'),
  stats: [{ value: 1, label: 'person named on the office page' }],
  people: [{ id: 'najeeb-ur-rehman', name: 'Dr. Najeeb Ur Rehman', title: 'Dean, Faculty of Chemical Sciences; Professor, Institute of Chemical Sciences' }],
  officialPage: PAGE,
  sources: [{ label: 'Dean Office page (Faculty of Chemical Sciences), University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page holds a faculty name and one person. It gives no telephone, address or hours.',
    'A press-release headline on the university’s site names Prof. Dr. Muhammad Qasim as Dean of this faculty. The office page, used here, names Dr. Najeeb Ur Rehman. The office should confirm.',
    'The university’s other dean-office pages (dean-office, dean-office-2, dean-office-4 and Office of the Deans) hold only a faculty name or nothing, and are not built.',
  ],
}
