import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/proctorial-board/'

export const proctor: OfficeProfile = {
  slug: 'proctorial-board',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Proctorial Board',
  shortName: 'Proctorial Board',
  lead: 'The Chief Proctor and four Deputy Chief Proctors, drawn from the university’s teaching staff.',
  banner: officeBanner('proctorial-board', 'Proctorial Board. University of Swat.'),
  hero: officeHero('proctorial-board'),
  stats: [{ value: 5, label: 'members listed on the board’s page' }],
  people: [
    { id: 'sheraz-ali', name: 'Mr. Sheraz Ali', title: 'Chief Proctor, Assistant Professor, DSGS' },
    { id: 'arshad-iqbal', name: 'Dr. Arshad Iqbal', title: 'Deputy Chief Proctor, Assistant Professor, CBM' },
    { id: 'islahudin', name: 'Mr. Islahudin', title: 'Deputy Chief Proctor, Assistant Professor, DLS' },
    { id: 'rohi-naz', name: 'Ms. Rohi Naz', title: 'Deputy Chief Proctor, Lecturer in Zoology' },
    { id: 'shazia', name: 'Ms. Shazia', title: 'Deputy Chief Proctor, Lecturer in Botany' },
  ],
  officialPage: PAGE,
  sources: [{ label: 'Proctorial Board page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-05',
  openPoints: ['The page gives no phone number, e-mail or address for the board.'],
}
