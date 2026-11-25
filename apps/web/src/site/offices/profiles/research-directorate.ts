import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/directorate-of-research-and-technological-development/'

export const researchDirectorate: OfficeProfile = {
  slug: 'directorate-of-research-and-technological-development',
  lists: ['research', 'administration'],
  group: 'Directorates',
  name: 'Directorate of Research and Technological Development',
  shortName: 'Research and Technological Development',
  lead: 'A directorate whose listed functions include preparing and sharing the annual progress report on research and technological development.',
  banner: officeBanner('directorate-of-research-and-technological-development', 'Directorate of Research and Technological Development. University of Swat.'),
  hero: officeHero('directorate-of-research-and-technological-development'),
  stats: [{ value: 1, label: 'function listed on the office page' }],
  itemLists: [
    {
      title: 'Function listed on the office page',
      items: ['To prepare and disseminate annual progress report on research and technological development.'],
      note: 'The page numbers this function 6. The first five are not in the copy of the page that was read.',
    },
  ],
  people: [{ id: 'ahmad-ali', name: 'Dr. Ahmad Ali', title: 'Listed on the office page' }],
  officialPage: PAGE,
  sources: [{ label: 'Directorate of Research and Technological Development page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page is nearly empty: one numbered function and one name without a title. It gives no telephone, e-mail, address or hours.',
    'The university’s Research menu points to ORIC and DASR for the research offices; how this directorate relates to them is not stated on the page.',
  ],
}
