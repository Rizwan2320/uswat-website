import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/department-of-english-and-foreign-languages/'

export const defl: OfficeProfile = {
  slug: 'english-and-foreign-languages',
  lists: [],
  path: '/academics/departments/english-and-foreign-languages',
  trail: [
    { label: 'Academics', href: '/academics' },
    { label: 'Departments', href: '/academics/departments' },
  ],
  group: 'Departments',
  name: 'Department of English and Foreign Languages',
  shortName: 'English and Foreign Languages',
  lead: 'Teaches English literature and linguistics, with BS English and an MPhil in Linguistics.',
  banner: officeBanner('english-and-foreign-languages', 'Department of English and Foreign Languages. University of Swat.'),
  hero: officeHero('english-and-foreign-languages'),
  stats: [
    { value: 2, label: 'programmes listed' },
    { value: 5, label: 'faculty listed on the department page' },
  ],
  about: [
    'In today’s world, English has assumed increasing significance because of its global relevance and as a key language for knowledge acquisition, dissemination, and as a medium of international communication. The program we offer in the department aims at producing graduates who will have strong written, oral and analytical skills in the English language that would help them fulfill their economic and socio-cultural needs.',
    'Moreover, the syllabus is designed to inculcate a creative, analytical and reflective mindset in our students. Their critical ability and independent thinking will not only help them groom into more conscientious individuals but they will also be able to respond in a more meaningful way to the opportunities and challenges in their societies in a rapidly changing world.',
  ],
  statements: [
    {
      title: 'Vision',
      paragraphs: [
        'To be a leading department nationally and internationally recognized for the study of English literature and linguistics. In the future, we aim to establish an excellence center for foreign language studies including English, Chinese, Japanese, German, Spanish, and French languages.',
      ],
    },
    {
      title: 'Mission',
      paragraphs: [
        'To establish a high quality department that provides a high quality academic environment and relevant education for the needs of the students. We inculcate and groom creativity and independent thinking through student-centered participatory teaching methods.',
      ],
    },
  ],
  servicesTitle: 'Core values',
  servicesKicker: 'What the department stands for',
  services: [
    { icon: 'trophy', title: 'Excellence', text: 'We provide high-quality education relevant to the needs of the students and focused on outcomes.' },
    { icon: 'rocket', title: 'Ambition', text: 'We support our students to develop and achieve their personal and career-oriented aspirations.' },
    { icon: 'users', title: 'Collaboration', text: 'Students and faculty work together to help every student achieve potential to the maximum.' },
    { icon: 'search', title: 'Inquisitiveness', text: 'We value and foster inquisitive minds who question taken for granted ways of thinking.' },
  ],
  itemLists: [
    {
      title: 'Programmes',
      items: ['BS English', 'MPhil (Linguistics)'],
    },
    {
      title: 'Objectives',
      items: [
        'become proficient users of English in written and oral forms',
        'comprehend, appreciate and evaluate different genres of literature',
        'understand and analyze English language from Linguistics and Applied Linguistics perspectives',
        'demonstrate the ability to engage in comparative analysis of literary texts',
        'have motivation to be lifelong learners',
        'understand and practice research related to their field of study',
      ],
      note: 'The page introduces these with “After successful completion of their courses, our students should be able to”.',
    },
  ],
  people: [
    { id: 'syed-hanif-rasool', name: 'Dr. Syed Hanif Rasool', title: 'Associate Professor and Chairman' },
    { id: 'syed-shujaat-ali', name: 'Dr. Syed Shujaat Ali', title: 'Associate Professor' },
    { id: 'imdad-ullah-khan', name: 'Dr. Imdad Ullah Khan', title: 'Assistant Professor, PhD in Applied Linguistics, University of Auckland, Aotearoa New Zealand' },
    { id: 'zakirullah', name: 'Mr. Zakirullah', title: 'Lecturer, M.Phil in English Literature' },
    { id: 'sadiq-hussain', name: 'Mr. Sadiq Hussain', title: 'Lecturer' },
  ],
  emails: ['defl@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Department of English and Foreign Languages page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The page gives no phone number or address. Duration, eligibility, fees, seats and curriculum are not on the page.',
    'The first two objectives run together in the page’s text (“…oral forms comprehend, appreciate and evaluate…”); they are split here the way the sentence reads.',
    'The vision speaks of a future centre for English, Chinese, Japanese, German, Spanish and French; the page lists only BS English and MPhil (Linguistics) as programmes today.',
  ],
}
