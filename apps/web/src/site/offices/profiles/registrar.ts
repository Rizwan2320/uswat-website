import { officeBanner, officeHero } from '../art'
import type { OfficeProfile } from '../types'

const PAGE = 'https://uswat.edu.pk/registeror-office/'

export const registrar: OfficeProfile = {
  slug: 'registeror-office',
  lists: ['administration'],
  group: 'Offices and boards',
  name: 'Office of the Registrar',
  shortName: 'Registrar',
  lead: 'The Registrar, two Deputy Registrars and the PS to Registrar, with the office’s two telephone lines.',
  banner: officeBanner('registeror-office', 'Office of the Registrar. University of Swat.'),
  hero: officeHero('registeror-office'),
  stats: [{ value: 4, label: 'officers named on the office page' }],
  statements: [
    {
      title: 'Message on the Registrar’s page',
      paragraphs: [
        'Around the world universities are considered as a catalyst for change. These are centers of promoting creative ideas, rational and critical thinking, policy formulation and value orientation. University of Swat is looking forward to achieve excellence in imparting quality teaching and skills, promoting research culture, and develop an ideal industry-academia linkage programme. We are looking forward to the desired change, change that we need to prosper as a nation, but one individual cannot bring a change.',
        'An individual can only provide quality leadership, which is needed to take people along for achieving desired goals. I request my students, faculty, and staff to help me in bringing change in the life of our nation through achieving academic excellence and adhering to our values, customs, and traditions. We expect every individual to respect and help others in matters that do not discriminate against others. Students and faculty form the backbone of our university and they have a duty to perform.',
        'We shall work with dedication, devotion, and commitment, in a congenial atmosphere of mutual trust, unity, discipline and love free from all kinds of prejudices. May Allah shower his blessings upon all of us and help us develop a greater seat of learning in the valley of Swat. This website reflects our humble efforts towards the development of a world class institution in the region, something that our generations will be proud of. We are a team of motivated academics, aiming at working selflessly to make the dream of a high ranking university in Swat come true. Together we can and together we will, Insha’Allah.',
      ],
    },
  ],
  people: [
    { id: 'arshad-ali-khan', name: 'Dr. Arshad Ali Khan', title: 'Registrar' },
    { id: 'tariq-kamal', name: 'Mr. Tariq Kamal', title: 'Deputy Registrar (Establishment)' },
    { id: 'sadiq-ahmed', name: 'Mr. Sadiq Ahmed', title: 'Deputy Registrar (Academics)' },
    { id: 'asghar-khan', name: 'Mr. Asghar Khan', title: 'PS to Registrar' },
  ],
  address: 'Main Campus at Charbagh',
  phones: [
    { label: 'Meeting Section', number: '0946-920859' },
    { label: 'PS to Registrar', number: '0946-920814' },
  ],
  emails: ['registrar@uswat.edu.pk', 'pstoregistrar@uswat.edu.pk'],
  officialPage: PAGE,
  sources: [{ label: 'Registrar’s Office page, University of Swat', url: PAGE }],
  verifiedAt: '2026-11-06',
  openPoints: [
    'The message is not signed in the copy that was read; the page places it under the Registrar’s name. The office should confirm who it is from.',
    'The page lists personal e-mails for the Deputy Registrars; only the office addresses are shown here.',
  ],
}
