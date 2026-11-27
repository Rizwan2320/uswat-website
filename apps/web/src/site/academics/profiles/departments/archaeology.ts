import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Archaeology, laid out like the DCST department page (the owner's blueprint, 2026-11-24). It replaces the office-style page built on
   2026-11-25 from the same saved copy, so the facts are the ones that page carried.
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction (BS since 2018; the department began in the fall of 2025),
   the vision, the eight mission lines, the strategy, the learning outcomes, the eligibility, the two named staff, the address and the museum item.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-archaeology/'
export const SLUG = 'archaeology'
export const BS = 'bs-archaeology'

const ELIGIBILITY = 'Intermediate or an equivalent qualification with at least 45% marks.'

export const archaeology: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Archaeology',
  tagline: 'The past of the Swat Valley, dug up, read and kept.',
  intro: 'BS Archaeology in a valley rich in remains from prehistoric times to the early Islamic era, with a university museum opened in October 2025.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Archaeology. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Archaeology'),
  levelText: 'BS',
  programmesLede: 'The department offers the BS in Archaeology.',
  about: [
    'The Swat Valley is exceptionally rich in archaeological remains, from prehistoric times to the early Islamic era. The university launched a BS programme in archaeology in 2018 under the Institute of Cultural Heritage, Tourism and Hospitality. In 2025 that institute was bifurcated into the Department of Tourism and Hospitality and the Department of Archaeology, which formally started academic activities in the fall semester of 2025 in Academic Block-B.',
    'The university has signed memoranda of understanding with the Directorate General of Archaeology and Museums, Government of Khyber Pakhtunkhwa, and with the Italian Archaeological Mission to Pakistan. With these agreements the department is expected to become one of the prominent departments in exploration, excavation, conservation and joint research publications.',
    'The scheme of studies follows the HEC’s New Undergraduate Education Policy (effective from Spring 2025) and includes General Education, Disciplinary, Major, Interdisciplinary and Elective courses, with internships, capstone projects, field experience, museum management training and research papers.',
  ],
  vision:
    'To become a leading department in archaeological research, education and heritage management in Pakistan, with a special focus on the Swat Valley and the wider Indo-Pakistan region, by fostering global collaborations, advancing innovative methods of exploration, excavation and conservation, and contributing to the preservation of cultural heritage for future generations.',
  mission:
    'To prepare skilled professionals in archaeology and cultural heritage management, and to equip students with the knowledge and skills to protect and promote the cultural resources of the region. To integrate the cultural heritage sector with the tourism industry so the area can become an archaeological tourism destination. To build professional competence in the exploration, documentation, excavation and conservation of archaeological sites and monuments of Pakistan, and to prepare students to handle legal issues of cultural heritage under national law and international charters.',
  highlights: [
    { icon: 'globe', title: 'A valley full of sites', text: 'Remains from prehistoric times to the early Islamic era lie within reach of the campus.' },
    { icon: 'book', title: 'A university museum', text: 'The Uḍḍiyāna Museum of Archaeology and Ethnology was inaugurated on 15 October 2025; it educates students and the public about the region’s heritage.' },
    { icon: 'users', title: 'Agreements with specialists', text: 'Memoranda with the Directorate General of Archaeology and Museums, Khyber Pakhtunkhwa, and the Italian Archaeological Mission to Pakistan.' },
    { icon: 'search', title: 'Reading ancient writing', text: 'Students learn to identify and decipher inscriptions on coins, manuscripts, stone slabs and pottery.' },
    { icon: 'shield', title: 'Heritage law and conservation', text: 'Courses cover conservation skills and the laws and charters that protect heritage.' },
    { icon: 'rocket', title: 'Field and capstone work', text: 'Field visits, internships and capstone projects are part of the scheme of studies.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'Uḍḍiyāna Museum of Archaeology and Ethnology',
      text: 'The university museum that keeps artifacts from the Swat Valley and teaches students and the public about the region’s heritage.',
      art: officeHero(SLUG),
      tools: ['Display cases', 'Catalogue records', 'Handling kits'],
    },
    {
      title: 'Artifact analysis laboratory',
      text: 'Cleaning, sorting, drawing and recording of finds from surveys and excavations.',
      art: officeHero(BS),
      tools: ['Magnifiers', 'Drawing boards', 'Measuring tools'],
    },
    {
      title: 'Conservation workroom',
      text: 'The basics of cleaning and stabilising objects, and of caring for them in storage.',
      art: officeHero(SLUG),
      tools: ['Soft brushes', 'Archival materials', 'Humidity meters'],
    },
    {
      title: 'Survey and mapping equipment',
      text: 'The instruments used to plan, record and map a site.',
      art: officeHero(BS),
      tools: ['Total station', 'GPS units', 'Surveying tapes'],
    },
  ],
  research: [
    { icon: 'globe', title: 'Exploration and excavation', text: 'Finding and digging sites of the Swat Valley and the wider region.', tags: ['Survey', 'Excavation', 'Swat Valley'] },
    { icon: 'book', title: 'Art, architecture and numismatics', text: 'Ancient and early Islamic art, architecture, coins and inscriptions.', tags: ['Epigraphy', 'Coins', 'Architecture'] },
    { icon: 'shield', title: 'Conservation and heritage law', text: 'How sites and monuments are protected and the law that governs them.', tags: ['Conservation', 'Heritage law', 'Monuments'] },
    { icon: 'users', title: 'Museums and heritage tourism', text: 'Museum practice, and how heritage can support tourism.', tags: ['Museology', 'Tourism', 'Ethnology'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Higher education institutions.' },
    { icon: 'flask', title: 'Researcher', text: 'Research organisations and postgraduate study.' },
    { icon: 'briefcase', title: 'Archaeologist in government service', text: 'Archaeology and museums departments.' },
    { icon: 'book', title: 'Museum curator or officer', text: 'Museums and heritage organisations.' },
    { icon: 'globe', title: 'Heritage and tourism', text: 'Heritage management and archaeological tourism.' },
    { icon: 'shield', title: 'Conservation worker', text: 'Site and monument conservation projects.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Archaeology society', text: 'Student-run talks, film nights and heritage walks.' },
    { icon: 'globe', title: 'Site visits', text: 'Regular visits to archaeological sites and museums across Pakistan.' },
    { icon: 'spark', title: 'Workshops and seminars', text: 'Students take part in workshops, excavation projects and preservation initiatives.' },
    { icon: 'book', title: 'Museum volunteers', text: 'Students help with guiding and cataloguing in the university museum.' },
  ],
  faq: [
    { q: 'Which programme does the department offer?', a: 'BS Archaeology.' },
    { q: 'What do I need to apply?', a: ELIGIBILITY },
    { q: 'Who leads the department?', a: 'The page names Dr. Zarawar Khan, Assistant Professor in Archaeology, as In-charge.' },
    { q: 'Where is the department?', a: 'In Academic Block-B on the Main Campus at Charbagh, Swat.' },
    { q: 'Is there a university museum?', a: 'Yes. The Uḍḍiyāna Museum of Archaeology and Ethnology was inaugurated by the Vice Chancellor on 15 October 2025.' },
  ],
  peopleTitle: 'In-charge and faculty',
  peopleLede: 'The two staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['stone-sculpture-survey-of-a-valley-village', 'coins-from-a-local-collection', 'documenting-a-rock-inscription'],
  reference: {
    sources: [{ label: 'Department of Archaeology page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page gives no department phone number or e-mail address; only personal addresses of the two staff, which are not shown here.',
      'The page says the institute was bifurcated in 2025, yet its museum item of 15 October 2025 is still written under the “Institute of Cultural Heritage, Tourism and Hospitality Management” and calls Dr. Zarawar Khan its In-Charge. The page does not explain the overlap.',
      'The page links a scheme of studies for Fall 2025; its courses are not reproduced here. The study plan on the programme page is illustrative.',
      'The page gives no seat numbers, fees or intake dates.',
      'Laboratories (apart from the museum), research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    {
      id: 'zarawar-khan',
      name: 'Dr. Zarawar Khan',
      title: 'Assistant Professor in Archaeology',
      role: 'head',
      roleLabel: 'In-charge',
      qualifications: ['PhD in Archaeology', 'Gold Medalist'],
    },
    { id: 'muhammad-waliullah', name: 'Mr. Muhammad Waliullah', title: 'Lecturer', role: 'member', qualifications: ['Gold Medalist'] },
  ],
}

export const bsArchaeology: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Archaeology',
  shortName: 'Archaeology',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department links its real Fall 2025 scheme of studies on the university’s site. Elective courses are chosen from the tracks below.',
  tagline: 'Explore, excavate and conserve the past.',
  summary: 'Exploration, excavation, conservation, museology and heritage law, with field visits and a capstone project.',
  ...pictures(BS, SLUG, 'BS Archaeology. Department of Archaeology, University of Swat.', 'Illustration for BS Archaeology'),
  about: [
    'BS Archaeology prepares skilled professionals in archaeology and cultural heritage management. It follows the HEC’s New Undergraduate Education Policy and joins theory with training in the field, in the museum and in conservation.',
    'Students use case studies, discussions and task-oriented assignments, take part in workshops and excavations, and finish with a capstone project.',
  ],
  whyStudy: [
    { icon: 'globe', title: 'Study in a rich valley', text: 'Remains from prehistoric times to the early Islamic era.' },
    { icon: 'book', title: 'A museum of your own', text: 'The university museum is a place to learn museology.' },
    { icon: 'shield', title: 'Protect what is left', text: 'Conservation skills and heritage law are taught.' },
    { icon: 'briefcase', title: 'Varied careers', text: 'Education, research, museums and government service.' },
  ],
  outcomes: [
    'Demonstrate a sound understanding of the basic concepts of archaeology and the cultural heritage of Pakistan.',
    'Apply knowledge to protect and promote the cultural and natural resources of the region.',
    'Identify and decipher ancient inscriptions on coins, birch bark manuscripts, stone slabs, pottery, rocks and boulders.',
    'Analyze and interpret the ancient art and architecture of Pakistan, and know early Islamic art, architecture, numismatics and epigraphy.',
    'Understand the principles of museology and apply them in professional contexts.',
    'Undertake major research projects, explorations and excavations alone or in a team.',
  ],
  years: [
    year(1, ['Introduction to Archaeology', 'Prehistory of South Asia', 'Functional English', 'Islamic Studies', 'Computer Skills'], ['Ancient History of Pakistan', 'Archaeological Methods', 'Expository Writing', 'Pakistan Studies', 'Introduction to Anthropology']),
    year(2, ['Gandhara Art and Architecture', 'Archaeological Survey and Exploration', 'Numismatics', 'Research Methods', 'Statistics'], ['Early Historic Archaeology', 'Excavation Methods', 'Epigraphy', 'Field Course I', 'Cultural Heritage Management']),
    year(3, ['Early Islamic Art and Architecture', 'Museology', 'Conservation and Preservation', 'Archaeological Illustration', 'Heritage Law and Charters'], ['Archaeology of the Swat Valley', 'Archaeological Science', 'Heritage Tourism', 'Field Course II', 'Scientific Writing']),
    year(4, ['Museum Management', 'Elective I', 'Elective II', 'Capstone Project I'], ['Elective III', 'Internship', 'Seminar', 'Capstone Project II']),
  ],
  tracks: [
    { icon: 'globe', title: 'Field archaeology', text: 'Survey, excavation and recording.' },
    { icon: 'book', title: 'Art, architecture and epigraphy', text: 'Reading stone, coins and writing.' },
    { icon: 'shield', title: 'Conservation and heritage law', text: 'Caring for sites, monuments and collections.' },
    { icon: 'users', title: 'Museology and heritage tourism', text: 'Museums, interpretation and visitors.' },
  ],
  skills: [
    { group: 'Field', items: ['Survey and mapping', 'Excavation recording', 'Site photography', 'GPS use'] },
    { group: 'Laboratory and museum', items: ['Artifact cataloguing', 'Archaeological illustration', 'Basic conservation'] },
    { group: 'Professional', items: ['Report writing', 'Presenting', 'Teamwork', 'Heritage law'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Archaeologist in government service', text: 'Archaeology and museums departments.' },
    { icon: 'book', title: 'Museum curator or officer', text: 'Museums and heritage organisations.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Higher education institutions.' },
    { icon: 'flask', title: 'Researcher', text: 'Research organisations and postgraduate study.' },
    { icon: 'globe', title: 'Heritage and tourism', text: 'Heritage management and archaeological tourism.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: ELIGIBILITY }, ...scienceFaq('Archaeology', 4)],
}
