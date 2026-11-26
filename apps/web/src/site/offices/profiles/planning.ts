import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/directorate-of-planning-and-development/'

export const planning: OfficeProfile = {
  slug: 'directorate-of-planning-and-development',
  lists: ['administration'],
  group: 'Directorates',
  name: 'Directorate of Planning and Development',
  shortName: 'Planning and Development',
  lead: 'The Director, two Deputy Directors and an Assistant Director of Planning and Development, with the office’s hours and telephone.',
  banner: officeBanner('directorate-of-planning-and-development', 'Directorate of Planning and Development. University of Swat.'),
  hero: officeHero('directorate-of-planning-and-development'),
  stats: [{ value: 4, label: 'officers named on the office page' }],
  people: [
    { id: 'mahboob-ur-rahman', name: 'Mr. Mahboob Ur Rahman', title: 'Director Planning and Development' },
    { id: 'azam-khan', name: 'Dr. Azam Khan', title: 'Deputy Director Planning and Development' },
    { id: 'tahir-alam', name: 'Mr. Tahir Alam', title: 'Deputy Director Planning and Development' },
    { id: 'muhammad-imran', name: 'Mr. Muhammad Imran', title: 'Assistant Director Planning and Development' },
  ],
  address: 'Main Campus at Charbagh',
  phones: [{ label: 'Landline', number: '0946-730515' }],
  emails: ['pnd@uswat.edu.pk'],
  hours: '08:30 AM – 04:30 PM, Monday – Friday',
  officialPage: PAGE,
  sources: [{ label: 'Directorate of Planning and Development page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: ['The page lists names, a location, one telephone, one e-mail and hours. It does not describe the directorate’s work or its projects.'],
}
