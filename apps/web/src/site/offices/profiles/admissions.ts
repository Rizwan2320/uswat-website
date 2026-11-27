import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/directorate-of-admissions/'

export const admissions: OfficeProfile = {
  slug: 'directorate-of-admissions',
  lists: ['administration'],
  group: 'Directorates',
  name: 'Directorate of Admissions',
  shortName: 'Admissions',
  lead: 'The admissions directorate: who runs it, where to find it and the admission notices its page lists, from Fall 2020 to Fall 2026.',
  banner: officeBanner('directorate-of-admissions', 'Directorate of Admissions. University of Swat.'),
  hero: officeHero('directorate-of-admissions'),
  stats: [
    { value: 15, label: 'admission notices listed' },
    { value: 2, label: 'staff named on the office page' },
  ],
  itemLists: [
    {
      title: 'Admission notices listed on the office page',
      items: [
        'Undergraduate Admissions Fall 2026 (Self Finance)',
        'Undergraduate Admissions Fall 2026 (Limited Seats)',
        'Undergraduate Admissions Fall 2026',
        'Undergraduate Admissions Spring 2025',
        'Undergraduate Admission Fall 2025',
        'Undergraduate Admissions Fall 2024 (Open & Self Finance)',
        'Undergraduate Admissions Fall 2023 (Open & Self Finance)',
        'Undergraduate Admissions Fall 2022 (Self Finance)',
        'Undergraduate Admissions Fall 2022',
        'Undergraduate Admissions Fall 2020',
        'MS/MPhil & PhD Admissions Spring 2024',
        'MS/MPhil & PhD Admissions Spring 2025',
        'MS/MPhil/PhD and BS 5th Semester Admissions',
        'Master Admissions Spring 2022',
        'MS/MPhil and PhD Admissions Spring 2021',
      ],
      note: 'These are the titles on the university’s page, in its order. Open the university’s page for the notices themselves.',
    },
  ],
  people: [
    { id: 'fida-hussain', name: 'Mr. Fida Hussain', title: 'Director Admissions' },
    { id: 'osama-habib', name: 'Mr. Osama Habib', title: 'Computer Operator' },
  ],
  address: 'Administration Block, Ground Floor, Main Campus, Charbagh, Swat',
  emails: ['admissions@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Directorate of Admissions page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no telephone number or office hours, and the notices carry no dates, closing dates or links in the copy that was read.',
    'The page also lists a personal e-mail for the Computer Operator; only the office address is shown here.',
  ],
}
