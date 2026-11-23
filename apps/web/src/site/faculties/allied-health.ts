import { officeBanner, officeHero } from '../offices/art'

import type { FacultyProfile, FacultyProgramme } from './types'

/* Faculty of Allied Health Sciences. Read on 2026-11-06 (crawl of the university's own site, kept in the register on the owner's Drive):
   the old site's /faculty/ page, the Quality Enhancement Cell page with its list of programmes (letter UoS/QEC/2025/X-8, 26 August 2025),
   and the tender category page. Nothing else is stated: curriculum, duration, eligibility, fees and seats are not on any of them. */

const FACULTY_PAGE = 'https://uswat.edu.pk/faculty/'
const QEC_PAGE = 'https://uswat.edu.pk/quality-enhancement-cell/'
const TENDER_PAGE = 'https://uswat.edu.pk/category/tender/page/3/'
const VERIFIED = '2026-11-06'

const facultySource = { label: 'Faculty of Allied Health Sciences page, University of Swat', url: FACULTY_PAGE }
const qecSource = {
  label: 'Quality Enhancement Cell page: list of programmes eligible for SAR 2024-2025 (letter UoS/QEC/2025/X-8, 26 August 2025)',
  url: QEC_PAGE,
}

const programmeOpen = [
  'The duration, eligibility, fee, number of seats and intake dates are not given on any page the university has published, so none is shown here.',
  'The curriculum and semester courses are not published either.',
]

export const alliedHealthProgrammes: FacultyProgramme[] = [
  {
    slug: 'bs-medical-laboratory-technology',
    faculty: 'allied-health-sciences',
    name: 'BS Medical Laboratory Technology (MLT)',
    shortName: 'MLT',
    centre: 'Centre for Medical Technologies',
    banner: officeBanner('bs-medical-laboratory-technology', 'BS Medical Laboratory Technology (MLT). Faculty of Allied Health Sciences, University of Swat.'),
    hero: officeHero('bs-medical-laboratory-technology'),
    summary: 'A degree programme of the Faculty of Allied Health Sciences, listed under the Centre for Medical Technologies.',
    about: [
      'BS Medical Laboratory Technology (MLT) is one of the degree programmes of the Faculty of Allied Health Sciences. The university’s Quality Enhancement Cell lists it under the Centre for Medical Technologies.',
    ],
    listedOn: ['faculty-page', 'qec-list'],
    openPoints: programmeOpen,
    sources: [facultySource, qecSource],
    verifiedAt: VERIFIED,
  },
  {
    slug: 'bs-dental-technology',
    faculty: 'allied-health-sciences',
    name: 'BS Dental Technology',
    shortName: 'Dental Technology',
    centre: 'Centre for Medical Technologies',
    banner: officeBanner('bs-dental-technology', 'BS Dental Technology. Faculty of Allied Health Sciences, University of Swat.'),
    hero: officeHero('bs-dental-technology'),
    summary: 'A degree programme of the Faculty of Allied Health Sciences, listed under the Centre for Medical Technologies.',
    about: [
      'BS Dental Technology is one of the degree programmes of the Faculty of Allied Health Sciences. The university’s Quality Enhancement Cell lists it under the Centre for Medical Technologies.',
    ],
    listedOn: ['faculty-page', 'qec-list'],
    openPoints: programmeOpen,
    sources: [facultySource, qecSource],
    verifiedAt: VERIFIED,
  },
  {
    slug: 'doctor-of-physical-therapy',
    faculty: 'allied-health-sciences',
    name: 'Doctor of Physical Therapy (DPT)',
    shortName: 'DPT',
    centre: 'Centre for Pharmaceutical and Rehabilitation Sciences',
    banner: officeBanner('doctor-of-physical-therapy', 'Doctor of Physical Therapy (DPT). Faculty of Allied Health Sciences, University of Swat.'),
    hero: officeHero('doctor-of-physical-therapy'),
    summary: 'A degree programme of the Faculty of Allied Health Sciences, listed under the Centre for Pharmaceutical and Rehabilitation Sciences.',
    about: [
      'Doctor of Physical Therapy (DPT) is one of the degree programmes of the Faculty of Allied Health Sciences. The university’s Quality Enhancement Cell lists it under the Centre for Pharmaceutical and Rehabilitation Sciences.',
    ],
    listedOn: ['faculty-page', 'qec-list'],
    openPoints: programmeOpen,
    sources: [facultySource, qecSource],
    verifiedAt: VERIFIED,
  },
  {
    slug: 'bs-radiography-and-imaging-technology',
    faculty: 'allied-health-sciences',
    name: 'BS Radiography & Imaging Technology',
    shortName: 'Radiography & Imaging',
    banner: officeBanner('bs-radiography-and-imaging-technology', 'BS Radiography and Imaging Technology. Faculty of Allied Health Sciences, University of Swat.'),
    hero: officeHero('bs-radiography-and-imaging-technology'),
    summary: 'A degree programme listed on the faculty page. The centre that runs it is not named.',
    about: [
      'BS Radiography & Imaging Technology is listed among the degree programmes of the Faculty of Allied Health Sciences on the faculty’s page.',
    ],
    listedOn: ['faculty-page'],
    openPoints: [
      'The university’s Quality Enhancement Cell list of August 2025 does not include this programme, and no page says which centre runs it. Please confirm whether admission has opened.',
      ...programmeOpen,
    ],
    sources: [facultySource, qecSource],
    verifiedAt: VERIFIED,
  },
]

export const alliedHealth: FacultyProfile = {
  slug: 'allied-health-sciences',
  path: '/faculties/allied-health-sciences',
  name: 'Faculty of Allied Health Sciences',
  shortName: 'Allied Health Sciences',
  lead: 'Degree programmes in medical laboratory technology, dental technology, physical therapy and radiography and imaging, taught in four centres.',
  banner: officeBanner('allied-health-sciences', 'Faculty of Allied Health Sciences. University of Swat. Centres and programmes.'),
  hero: officeHero('allied-health-sciences'),
  about: [
    'The establishment of the Faculty of Allied Health Sciences was approved at the 9th meeting of the Senate of the University of Swat. Four departments work under the faculty, and a range of degree programmes is offered.',
    'The study programmes aim to give graduates up-to-date knowledge and skills for handling patients and health-related emergency situations professionally, following national and international standards and ethical practice.',
  ],
  visionMission: [
    'The Faculty of Allied Health Sciences is determined to develop a skilled workforce to contribute to the national and knowledge economy of the country.',
    'Study programmes in the faculty are designed to educate the students on the basic and advanced technologies related to Allied Health Sciences. The skilled graduates will contribute to the healthcare sector both nationally and internationally.',
  ],
  stats: [
    { value: 4, label: 'centres listed' },
    { value: 4, label: 'degree programmes listed' },
    { value: 3, label: 'staff named on the faculty page' },
    { value: 'Fall 2025', label: 'admission launched (QEC letter)' },
  ],
  centres: [
    { slug: 'centre-for-medical-technologies', name: 'Centre for Medical Technologies', programmes: ['bs-medical-laboratory-technology', 'bs-dental-technology'] },
    { name: 'School of Nursing and Public Health', programmes: [] },
    {
      slug: 'centre-for-pharmaceutical-and-rehabilitation-sciences',
      name: 'Centre for Pharmaceutical and Rehabilitation Sciences',
      programmes: ['doctor-of-physical-therapy'],
    },
    { name: 'Centre for Food and Nutrition Sciences', programmes: [] },
  ],
  programmes: alliedHealthProgrammes.map((p) => p.slug),
  people: [
    { id: 'ali-akbar', name: 'Dr. Ali Akbar', title: 'Professor, Focal Person and Director of the faculty' },
    { id: 'nasib-zaman', name: 'Dr. Nasib Zaman', title: 'Associate Professor' },
    { id: 'zafar-ali', name: 'Dr. Zafar Ali', title: 'Assistant Professor' },
  ],
  peopleNote:
    'Dr. Ali Akbar is also listed as Director of the Centre for Medical Technologies and of the Centre for Pharmaceutical and Rehabilitation Sciences. The faculty page does not name a dean.',
  facilities: {
    text: 'The university’s tender page lists the minutes of a pre-bid meeting for the purchase of laboratory equipment, glassware and chemicals for Allied Health Sciences, among tenders of 2025. The page gives no date for that item.',
    link: { label: 'Tender page, University of Swat', href: TENDER_PAGE },
  },
  phones: [{ label: 'Office', number: '0946 920877' }],
  emails: ['cprs@uswat.edu.pk'],
  officialPage: FACULTY_PAGE,
  sources: [facultySource, qecSource, { label: 'Tender page 3, University of Swat', url: TENDER_PAGE }],
  verifiedAt: VERIFIED,
  openPoints: [
    'The faculty page lists four centres and four programmes. The Quality Enhancement Cell letter of 26 August 2025 lists two centres (Medical Technologies, and Pharmaceutical and Rehabilitation Sciences, which it once calls Pharmaceutical Sciences) and three programmes, and says the faculty launched admission with Fall 2025. Both are shown as written.',
    'No page says which centre runs BS Radiography & Imaging Technology, or what the School of Nursing and Public Health and the Centre for Food and Nutrition Sciences offer.',
    'The telephone number and the e-mail address are given with the focal person’s entry; the page does not say whether they belong to the faculty office or to the Centre for Pharmaceutical and Rehabilitation Sciences.',
    'Curriculum, duration, eligibility, fees, number of seats and intake dates are not published on any of these pages.',
  ],
}
