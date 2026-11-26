import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/developmental-projects/'

export const developmentalProjects: OfficeProfile = {
  slug: 'developmental-projects',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Developmental Projects',
  shortName: 'Developmental Projects',
  lead: 'The page the university keeps for its building projects. It names three pictures: Academic Block-C, the University Canteen and an eagle-eye view of the university.',
  banner: officeBanner('developmental-projects', 'Developmental Projects. University of Swat.'),
  hero: officeHero('developmental-projects'),
  stats: [{ value: 3, label: 'pictures named on the page' }],
  itemLists: [{ title: 'Captions on the page', items: ['Academic Block-C', 'University Canteen', 'Eagle eye view of the University'] }],
  people: [],
  officialPage: PAGE,
  sources: [{ label: 'Developmental Projects page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page is three captions with no text, dates, costs or contacts. The pictures themselves are not reproduced here.',
    'The Directorate of Planning and Development has its own page; the university does not say how the two relate.',
  ],
}
