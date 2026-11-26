import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/merit-list/'

const dept = (name: string) => `Provisional merit list of ${name}, session 2019-23`
const quota = (name: string) => `Provisional merit list of the ${name} quota, session 2019-21`

export const meritLists: OfficeProfile = {
  slug: 'merit-list',
  path: '/admissions/merit-lists',
  trail: [{ label: 'Admissions', href: '/admissions' }],
  lists: [],
  group: 'Academic services',
  name: 'Merit Lists',
  shortName: 'Merit Lists',
  lead: 'The provisional merit lists the university lists on its merit list page: eleven departments for session 2019-23 and seven quotas for session 2019-21.',
  banner: officeBanner('merit-list', 'Merit lists. University of Swat.'),
  hero: officeHero('merit-list'),
  stats: [
    { value: 11, label: 'department lists, session 2019-23' },
    { value: 7, label: 'quota lists, session 2019-21' },
  ],
  itemLists: [
    {
      title: 'Provisional merit lists by department, session 2019-23',
      items: [
        dept('Botany'),
        dept('Chemistry'),
        dept('Environmental Sciences'),
        dept('Islamiyat'),
        dept('Journalism'),
        dept('Mathematics'),
        dept('MCOM'),
        dept('Microbiology'),
        dept('Pakistan Studies'),
        dept('Psychology'),
        dept('Zoology'),
      ],
    },
    {
      title: 'Provisional merit lists by quota, session 2019-21',
      items: [
        quota('Disabled'),
        quota('FATA'),
        quota('Foreigner and Afghan'),
        quota('Minority'),
        quota('Provinces and AJK'),
        quota('Sports'),
        quota('University Employee Children'),
      ],
      note: 'These are the titles on the university’s page. Later merit lists are published as notices.',
    },
  ],
  people: [],
  links: [
    { label: 'Notices', href: '/notices' },
    { label: 'Admissions', href: '/admissions' },
  ],
  officialPage: PAGE,
  sources: [{ label: 'Merit list page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'Titles only: the lists themselves are files on the old site and are not copied here.',
    'The route map folds several more old merit list pages into this one (BS Fall 2020, second shift Fall 2021, Main and Women Campus); they have not been read yet.',
  ],
}
