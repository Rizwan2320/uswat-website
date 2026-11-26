import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/convocation-2022/'

export const convocation: OfficeProfile = {
  slug: 'convocation-2022',
  path: '/convocation-2022',
  trail: [{ label: 'Campus life', href: '/campuses/main' }],
  lists: [],
  group: 'Academic services',
  name: '2nd Convocation',
  shortName: '2nd Convocation',
  lead: 'The circulars, the registration form and the registration lists by faculty that the university published for its 2nd Convocation.',
  banner: officeBanner('convocation-2022', '2nd Convocation. University of Swat.'),
  hero: officeHero('convocation-2022'),
  stats: [
    { value: 2, label: 'circulars' },
    { value: 5, label: 'faculty registration lists' },
  ],
  about: [
    'Students and applicants’ vehicles will not be allowed to enter the University of Swat on convocation day. The university will provide a shuttle service from the Main Gate to the convocation venue.',
  ],
  itemLists: [
    { title: 'Forms and circulars', items: ['Confirmation form for the registered students for the 2nd Convocation', 'Convocation as Mega Event', 'Stage Secretary'] },
    {
      title: 'Registration lists by faculty, with gold medallists (annual examination system)',
      items: [
        'Faculty of Chemical Sciences',
        'Faculty of Religious & Legal Studies',
        'Faculty of Management & Social Sciences',
        'Faculty of Physical and Numerical Sciences',
        'Faculty of Life Sciences',
      ],
    },
  ],
  people: [],
  officialPage: PAGE,
  sources: [{ label: '2nd Convocation page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no date or venue for the convocation, and the registration lists are file titles only in the copy that was read.',
    'The page has a “Convocation Preparations” picture gallery that was not part of the copy.',
  ],
}
