import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

/* Affiliated Colleges. FROM THE UNIVERSITY'S PAGES, saved copies on the owner's Drive (read 2026-11-28; the copies date from 2026-11-06): the two sector pages
   (public and private), the associate degree press release (in Urdu; summarised in English here) and the two-part "Details List of Affiliated Colleges" from the
   Office of the Deputy Registrar Academics, which numbers 30 colleges.
   NOT SHOWN, ON PURPOSE: the list also gives principals' names and mobile numbers and the names and numbers of BS coordinators, controllers of examinations and
   QEC focal persons. That is personal data and none of it is copied here.
   A web search on 2026-11-28 found the same two sector pages on the university's site and no independent list of the colleges; the live site was not fetched. */

const PUBLIC = 'https://uswat.edu.pk/public-sector-affiliated-colleges/'
const PRIVATE = 'https://uswat.edu.pk/private-sector-affiliated-colleges/'
const ASSOCIATE = 'https://uswat.edu.pk/associate-degree-training-for-affiliated-colleges/'

export const affiliatedColleges: OfficeProfile = {
  slug: 'affiliated-colleges',
  photoHero: true,
  path: '/academics/affiliated-colleges',
  trail: [{ label: 'Academics', href: '/academics' }],
  lists: [],
  group: 'Academic services',
  name: 'Affiliated Colleges',
  shortName: 'Affiliated Colleges',
  lead: 'The thirty colleges that the university’s Office of the Deputy Registrar Academics lists as affiliated with the University of Swat, across Swat, Buner, Shangla and Dir.',
  banner: officeBanner('affiliated-colleges', 'Affiliated colleges. University of Swat.'),
  hero: officeHero('affiliated-colleges'),
  about: [
    'The university’s site has a page for public sector affiliated colleges and one for private sector affiliated colleges. Each carries a short list of the BS programmes that the colleges offer, and a link to the Details List of Affiliated Colleges, which the Office of the Deputy Registrar Academics keeps. That list names thirty colleges.',
    'A press release on the university’s site (in Urdu) reports a two-day awareness and training workshop on launching associate degree programmes in the affiliated colleges, held at the university’s Kanju Campus. Principals and faculty members of the affiliated degree colleges took part. The Vice Chancellor, Dr. Muhammad Jamal Khan, attended on the first day, and the Controller of Examinations, Muhammad Riaz, explained the different aspects of the associate degree to the participants.',
  ],
  stats: [
    { value: 30, label: 'colleges on the Deputy Registrar’s list' },
    { value: 6, label: 'BS programmes named on the two sector pages' },
    { value: 4, label: 'districts named: Swat, Buner, Shangla, Dir' },
  ],
  itemLists: [
    {
      title: 'Colleges 1 to 21 on the list',
      items: [
        'GPGGC Saidu Sharif Swat',
        'GGDC No.2 Saidu Sharif',
        'GDC Mingora Swat',
        'GDC Saidu Sharif Swat',
        'GPGJC Saidu Sharif Swat',
        'GGDC Khwazakhela',
        'GDC Khwazakhela Swat',
        'GDC Madyan Swat',
        'GGDC Madyan Swat',
        'GGDC Kanju Swat',
        'GDC Kabal Swat',
        'GCMS Sangota',
        'GGDC Barikot Swat',
        'GDC Matta',
        'GGDC Matta',
        'GDC Daggar Buner',
        'GDC Alpurai Shangla',
        'GDC Chakesar Shangla',
        'GDC Puran Shangla',
        'GCMS Besham Shangla',
        'GDC Gulabad Dir',
      ],
      note: 'Names and abbreviations are written as the list writes them; the list does not spell them out.',
    },
    {
      title: 'Colleges 22 to 30 on the list',
      items: [
        'Kabal Education Academy Kabal',
        'Siratul Jannat College Kulader Swat',
        'SECOMS College Shahdara Watkey Swat',
        'Al-Madina College Saidu Sharif Swat',
        'Swat Public School and College Girls Campus',
        'Jinnah College Guljaba, Kabal Swat',
        'New Shangla Degree College Besham Shangla',
        'Swat College of Technology Sersinai Kabal',
        'Rana School and College System Matta',
      ],
      note: 'The list is in two files; this is the second. It does not say which colleges are public and which are private.',
    },
    {
      title: 'BS programmes named on the two sector pages',
      items: ['BS Botany', 'BS Chemistry', 'BS Computer Science', 'BS English', 'BS Urdu', 'BS Zoology'],
      note: 'The saved copies list programmes in short groups without saying which college offers which, so none is tied to a college here.',
    },
  ],
  people: [],
  links: [
    { label: 'Notices', href: '/notices' },
  ],
  officialPage: PUBLIC,
  sources: [
    { label: 'Public Sector Affiliated Colleges page, University of Swat', url: PUBLIC },
    { label: 'Private Sector Affiliated Colleges page, University of Swat', url: PRIVATE },
    { label: 'Associate Degree Training for affiliated colleges (press release, in Urdu), University of Swat', url: ASSOCIATE },
  ],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The Details List of Affiliated Colleges is two PDF files from the Office of the Deputy Registrar Academics; their address on the old site was not recorded. The list does not say which colleges are public and which are private, and gives no affiliation year, address, website or programmes for a college.',
    'The list gives the names and mobile numbers of each college’s principal, BS coordinator, examinations contact and quality enhancement focal person. They are personal contact details and are not shown here; the Office of the Deputy Registrar Academics is the place to ask.',
    'Several names on the list are abbreviations (GDC, GGDC, GPGGC, GPGJC, GCMS) that the list does not spell out; they are shown as written.',
    'The sector pages list programmes without naming the colleges, and one of them repeats programme names; each name is shown once.',
    'The press release is undated on the saved copy, and names Dr. Muhammad Jamal Khan as Vice Chancellor; the university’s other pages name Prof. Dr. Hassan Sher. The summary here is in English; the source is in Urdu.',
    'A web search on 2026-11-28 found the same two sector pages on the university’s site and no independent list; the live pages were not re-read.',
  ],
}
