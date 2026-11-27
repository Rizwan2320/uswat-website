import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Pakistan Studies, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the introduction (a newly established
   multi-disciplinary department; Master and BS programmes; area studies of Caucasia, Asia and China), the vision, the mission, the five objectives, the
   degree and its eligibility, and the two named staff.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department_of_pakistan_studies/'
export const SLUG = 'pakistan-studies'
export const BS = 'bs-pakistan-studies-2'

const ELIGIBILITY = 'FA, F.Sc or an equivalent qualification with at least 45% marks.'

export const pakistanStudies: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Pakistan Studies',
  tagline: 'The land and people of Pakistan, studied across the social sciences.',
  intro: 'A multi-disciplinary department with a BS and a Master’s in Pakistan Studies, and a wish to grow area studies of Caucasia, Asia and China.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Pakistan Studies. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Pakistan Studies'),
  levelText: 'BS to Master’s',
  programmesLede: 'The department offers the BS in Pakistan Studies and a Master’s in the same discipline.',
  about: [
    'The Department of Pakistan Studies is, in its own words, a newly established multi-disciplinary department. It aims at excellence in area studies, especially Caucasia, Asia and China, countries of great historical, cultural and economic importance, particularly in relation to India and Pakistan.',
    'At present it has started Master’s and BS programmes in Pakistan Studies, and it intends to start degrees on Caucasia, Asia and China in the near future.',
    'Pakistan Studies draws on political science, international relations, geography, history, law, arts and languages, economics, sociology and socio-cultural anthropology, philosophy and comparative religions. Alongside major and specialisation subjects, students research social, cultural, political and economic issues that link these fields.',
  ],
  vision: 'To offer quality education about the land and people of Pakistan, using state-of-the-art academic skills and robust, rigorous research practices in a multidisciplinary programme.',
  mission:
    'To educate, train and produce highly skilled scholars in Pakistan Studies and related areas, and to promote a culture of excellent research and quality education.',
  highlights: [
    { icon: 'globe', title: 'Area studies', text: 'Plans extend to Caucasia, Asia and China.' },
    { icon: 'book', title: 'Many disciplines', text: 'Courses come from history, law, economics, sociology, philosophy and more.' },
    { icon: 'search', title: 'Research on real issues', text: 'Students research social, cultural, political and economic questions.' },
    { icon: 'shield', title: 'Human rights', text: 'The page gives human-rights issues equal weight.' },
    { icon: 'users', title: 'Vision of Pakistan', text: 'Students study the vision of the founding leaders and the nature of the state they envisioned.' },
    { icon: 'cap', title: 'BS and Master’s', text: 'Two degree levels have started.' },
  ],
  disciplines: [BS],
  labs: [
    { title: 'Seminar library', text: 'Books and journals on Pakistan and its region.', art: officeHero(SLUG), tools: ['Books and journals', 'Maps', 'Newspaper archive'] },
    { title: 'Map and data room', text: 'Maps, census tables and survey data.', art: officeHero(BS), tools: ['Wall maps', 'Statistics software', 'Atlases'] },
    { title: 'Oral history corner', text: 'Recording and cataloguing interviews with elders.', art: officeHero(SLUG), tools: ['Recorders', 'Transcription software', 'Catalogue cards'] },
    { title: 'Research room', text: 'Writing and presenting a research paper.', art: officeHero(BS), tools: ['Reference manager', 'Presentation screen', 'Writing desks'] },
  ],
  research: [
    { icon: 'globe', title: 'Politics and international relations', text: 'The state, its neighbours and the region.', tags: ['Politics', 'Region', 'Security'] },
    { icon: 'book', title: 'History and culture', text: 'From ancient times to the present.', tags: ['History', 'Culture', 'Heritage'] },
    { icon: 'users', title: 'Society and rights', text: 'Human rights, society and change.', tags: ['Human rights', 'Society', 'Gender'] },
    { icon: 'chart', title: 'Economy and development', text: 'Economic questions of Pakistan and the region.', tags: ['Economy', 'Development', 'Trade'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'briefcase', title: 'Civil service', text: 'Competitive examinations and public administration.' },
    { icon: 'book', title: 'Researcher', text: 'Think tanks and postgraduate study.' },
    { icon: 'globe', title: 'Diplomacy and international work', text: 'Foreign affairs and international bodies.' },
    { icon: 'search', title: 'Journalism and writing', text: 'Newspapers, media and publishing.' },
    { icon: 'users', title: 'Development work', text: 'NGOs and public programmes.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Debating society', text: 'Debates on current affairs and history.' },
    { icon: 'globe', title: 'Heritage visits', text: 'Visits to historical places of the valley.' },
    { icon: 'book', title: 'Reading groups', text: 'Groups that read and discuss a book a month.' },
    { icon: 'trophy', title: 'Essay contests', text: 'Yearly essay contests on a national theme.' },
  ],
  faq: [
    { q: 'Which programmes does the department offer?', a: 'The BS in Pakistan Studies and a Master’s in Pakistan Studies.' },
    { q: 'What do I need to apply for the BS?', a: ELIGIBILITY },
    { q: 'Who leads the department?', a: 'The page names Dr. Sarfaraz Khan, Assistant Professor, as In-charge.' },
    { q: 'Will there be programmes on Caucasia, Asia and China?', a: 'The page says the department intends to start them in the near future; it gives no date.' },
    { q: 'Which curricula does the BS follow?', a: 'The page links BS Pakistan Studies documents of 2013 (revised) and 2019.' },
  ],
  peopleTitle: 'In-charge and faculty',
  peopleLede: 'The two staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['the-pashtun-tribal-code-in-modern-courts', 'trade-routes-through-the-valley-in-the-1900s', 'what-schoolbooks-say-about-the-founders'],
  reference: {
    sources: [{ label: 'Department of Pakistan Studies page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page calls the unit a department and a “Centre”, and describes plans for programmes on Caucasia, Asia and China without a date.',
      'The page gives no department mailbox or phone number; only personal e-mail addresses of the two staff, which are not shown here.',
      'The page links BS Pakistan Studies curricula of 2013 (revised) and 2019; the courses are not reproduced here. The study plan on the programme page is illustrative.',
      'The page does not say when the Master’s programme started or its eligibility; it gives no fees or intake dates.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'sarfaraz-khan', name: 'Dr. Sarfaraz Khan', title: 'Assistant Professor', role: 'head', roleLabel: 'In-charge', qualifications: ['PhD in Asian Studies'] },
    { id: 'zahid-nasir', name: 'Mr. Zahid Nasir', title: 'Lecturer', role: 'member' },
  ],
}

export const bsPakistanStudies: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Pakistan Studies',
  shortName: 'Pakistan Studies',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department links its BS curricula of 2013 (revised) and 2019 on the university’s site. Elective courses are chosen from the tracks below.',
  tagline: 'Understand Pakistan from many angles.',
  summary: 'A four-year, multi-disciplinary degree on the history, politics, society, economy and culture of Pakistan, with a research thesis.',
  ...pictures(BS, SLUG, 'BS Pakistan Studies. Department of Pakistan Studies, University of Swat.', 'Illustration for BS Pakistan Studies'),
  about: [
    'The BS in Pakistan Studies teaches the land and people of Pakistan through courses taken from other social sciences, and asks students to research important social, cultural, political and economic issues.',
    'The course framework is issue-oriented. It covers Pakistan’s image and its evolution from ancient times to now, and gives human-rights questions equal weight.',
  ],
  whyStudy: [
    { icon: 'book', title: 'Many fields in one', text: 'History, politics, law, economics, sociology and more.' },
    { icon: 'search', title: 'Research real questions', text: 'Students research issues that cross disciplines.' },
    { icon: 'shield', title: 'Human rights', text: 'Rights are given equal weight.' },
    { icon: 'globe', title: 'A wider region', text: 'The department plans area studies beyond Pakistan.' },
  ],
  outcomes: [
    'Describe the evolution of Pakistan from ancient times to the present across political, historical, cultural, social and economic fields.',
    'Explain the vision of Pakistan as given by its founding leaders.',
    'Apply ideas from several social sciences to one question.',
    'Discuss human-rights issues in Pakistani society.',
    'Carry out and report a research study on a social, cultural, political or economic issue.',
    'Connect with scholars in area studies at country, regional and global levels.',
  ],
  years: [
    year(1, ['Introduction to Pakistan Studies', 'Functional English', 'Islamic Studies', 'Computer Skills', 'Introduction to Political Science'], ['History of the Subcontinent', 'Expository Writing', 'Introduction to Sociology', 'Geography of Pakistan', 'Introduction to Economics']),
    year(2, ['Political History of Pakistan', 'Constitutional Development', 'Research Methods', 'Statistics', 'Culture and Society of Pakistan'], ['Foreign Policy of Pakistan', 'Economy of Pakistan', 'Languages and Literature of Pakistan', 'Introduction to Anthropology', 'Human Rights']),
    year(3, ['Ideology and Movement for Pakistan', 'Regional Studies: South Asia', 'Social Change in Pakistan', 'Comparative Religions', 'Public Policy'], ['Regional Studies: Central Asia and China', 'Governance and Law', 'Security Studies', 'Elective I', 'Scientific Writing']),
    year(4, ['Elective II', 'Elective III', 'Contemporary Issues', 'Thesis I'], ['Elective IV', 'Seminar', 'Internship', 'Thesis II']),
  ],
  tracks: [
    { icon: 'globe', title: 'Politics and regional studies', text: 'The state and the region.' },
    { icon: 'book', title: 'History and culture', text: 'From ancient times to the present.' },
    { icon: 'users', title: 'Society and rights', text: 'Society, anthropology and human rights.' },
    { icon: 'chart', title: 'Economy and policy', text: 'Economy, governance and policy.' },
  ],
  skills: [
    { group: 'Research', items: ['Source reading', 'Survey design', 'Interviews', 'Report writing'] },
    { group: 'Analysis', items: ['Comparing evidence', 'Policy analysis', 'Argument writing'] },
    { group: 'Professional', items: ['Presenting', 'Debating', 'Teamwork', 'Time management'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'briefcase', title: 'Civil service', text: 'Competitive examinations.' },
    { icon: 'book', title: 'Researcher', text: 'Think tanks and further study.' },
    { icon: 'globe', title: 'International work', text: 'Foreign affairs and international bodies.' },
    { icon: 'search', title: 'Journalism', text: 'Newspapers and media.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: ELIGIBILITY }, ...scienceFaq('Pakistan Studies', 4)],
}
