import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Home Economics, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGES, saved copies on the owner's Drive (read 2026-11-27; the copies date from 2026-11-06): the Department of Home Economics page
   (the degree, the eligibility, the five named staff) and the College of Home Sciences page, whose introduction, vision, mission, seven programme
   objectives, career list and five fields of specialisation are folded in here because both pages describe the same women's-campus department.
   EVERYTHING ELSE (highlights, laboratories, research areas, student life, questions and the study plan) is illustrative text for the template that
   nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-home-economics/'
const COLLEGE_PAGE = 'https://uswat.edu.pk/college-of-home-sciences/'
export const SLUG = 'home-economics'
export const BS = 'bs-home-economics'

const ELIGIBILITY = 'FA, F.Sc or an equivalent qualification with at least second division.'

export const homeEconomics: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Home Economics',
  fullName: 'Department of Home Economics (College of Home Sciences)',
  tagline: 'Specialised skills for the well-being of individuals, families and the nation.',
  intro: 'A constituent department of the Women Campus, with five fields of specialisation from art and design to food and nutrition.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Home Economics. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Home Economics'),
  levelText: 'BS',
  programmesLede: 'The department offers the BS in Home Economics, with a specialisation chosen from five fields.',
  about: [
    'The Department of Home Economics is a constituent department of the Women Campus. It offers professional, highly specialised and technical courses in five disciplines of home economics: Art and Design, Food and Nutrition, Human Development and Family Studies, Management Studies, and Textile and Clothing.',
    'The page says these subjects add to the professional and transferable skills of young women and prepare them to lead positive and productive change in their communities and nationwide.',
    'It describes the department as the second government inclusion of home economics in Khyber Pakhtunkhwa. The degree awarded is the BS in Home Economics, with a specialisation.',
  ],
  vision: 'To produce outstanding graduates who use the specialised skills and knowledge of home economics to influence the well-being of individuals, families, the nation and its people.',
  mission:
    'To bring social change based on a healthy environment where individuals live in mutual coexistence, with tolerance and mutual understanding. Home economics recognises homes as the foundation of development and the integrity of the family as a requisite for homes. The department works to improve the quality of day-to-day living of families and consumers and to prepare them for the issues that need an understanding of local, national and international developments. It aims to give women full opportunities of expression and entry into a noble profession, and to build on quality education, equal access and merit.',
  highlights: [
    { icon: 'spark', title: 'Five specialisations', text: 'Art and Design; Textile and Clothing; Food and Nutrition Sciences; Human Development and Family Studies; Resource and Facility Management.' },
    { icon: 'users', title: 'On the Women Campus', text: 'A constituent department of the university’s Women Campus.' },
    { icon: 'briefcase', title: 'Wide career choice', text: 'The page lists roles from teacher and designer to nutritionist and HR officer.' },
    { icon: 'book', title: 'Quality, access and merit', text: 'The department says it builds on these three principles.' },
    { icon: 'rocket', title: 'Modern knowledge and technology', text: 'One programme objective is to familiarise students with advances in industry.' },
    { icon: 'globe', title: 'Community focus', text: 'Graduates are prepared to develop their community and environment.' },
  ],
  disciplines: [BS],
  labs: [
    { title: 'Food and nutrition laboratory', text: 'Cooking, food analysis and diet planning.', art: officeHero(SLUG), tools: ['Cooking stations', 'Weighing scales', 'Food models'] },
    { title: 'Textile and clothing studio', text: 'Pattern making, cutting, stitching and fabric study.', art: officeHero(BS), tools: ['Sewing machines', 'Dress forms', 'Fabric swatches'] },
    { title: 'Art and design studio', text: 'Drawing, colour and design work for textiles and interiors.', art: officeHero(SLUG), tools: ['Drawing boards', 'Colour sets', 'Design software'] },
    { title: 'Child development corner', text: 'A place to observe and plan activities for young children.', art: officeHero(BS), tools: ['Play materials', 'Observation sheets', 'Story books'] },
  ],
  research: [
    { icon: 'flask', title: 'Food and nutrition', text: 'Diet, health and the food of families and consumers.', tags: ['Nutrition', 'Diet', 'Food science'] },
    { icon: 'users', title: 'Human development and family studies', text: 'Children, parenting and family life.', tags: ['Child development', 'Family', 'Parenting'] },
    { icon: 'spark', title: 'Textiles and design', text: 'Fabrics, clothing and local crafts.', tags: ['Textiles', 'Design', 'Crafts'] },
    { icon: 'briefcase', title: 'Resource management', text: 'How households and facilities use money, time and space.', tags: ['Management', 'Consumers', 'Budgeting'] },
  ],
  careers: [
    { icon: 'cap', title: 'Instructor or teacher', text: 'Vocational institutes, colleges, and arts and home economics schools.' },
    { icon: 'briefcase', title: 'Manager or officer', text: 'Banker, supervisor, manager, HR officer, quality control officer, event organiser.' },
    { icon: 'spark', title: 'Designer or artist', text: 'Textile, interior, furniture and fashion designer; artist, painter, calligrapher.' },
    { icon: 'flask', title: 'Nutritionist', text: 'Consultant and adviser on the diet of children and women.' },
    { icon: 'users', title: 'Community work', text: 'Community mobiliser and NGO worker.' },
    { icon: 'book', title: 'Writer or researcher', text: 'Creative writer, creative editor and researcher.' },
  ],
  studentLife: [
    { icon: 'spark', title: 'Exhibitions', text: 'Students show their work to the university community.' },
    { icon: 'users', title: 'Home economics society', text: 'Student-run talks, demonstrations and craft days.' },
    { icon: 'globe', title: 'Field visits', text: 'Visits to workshops, kitchens and community projects.' },
    { icon: 'trophy', title: 'Competitions', text: 'Cooking, design and poster competitions.' },
  ],
  faq: [
    { q: 'Which programme does the department offer?', a: 'The BS in Home Economics, with a specialisation.' },
    { q: 'What do I need to apply?', a: ELIGIBILITY },
    { q: 'Which specialisations are there?', a: 'Art and Design; Textile and Clothing; Food and Nutrition Sciences; Human Development and Family Studies; and Resource and Facility Management.' },
    { q: 'Who leads the department?', a: 'The page names Ms. Hina Khan, Lecturer, as In-Charge.' },
    { q: 'Is the department on the Women Campus?', a: 'Yes. The College of Home Sciences page calls it a constituent department of the Women Campus.' },
  ],
  peopleTitle: 'In-charge and faculty',
  peopleLede: 'The five staff named on the department’s page, with the titles it gives.',
  alumni: ['a-week-of-balanced-meals-for-a-family', 'block-printed-cloth-from-a-swat-workshop', 'play-and-language-in-nursery-children'],
  reference: {
    sources: [
      { label: 'Department of Home Economics page, University of Swat', url: PAGE },
      { label: 'College of Home Sciences page, University of Swat', url: COLLEGE_PAGE },
    ],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The two pages describe the same department under two names (Department of Home Economics, College of Home Sciences). The old address list sends the college address to a separate page, `home-sciences`, which this page does not replace.',
      'The department page heads a section “Career Choices” and “Emerging Technologies” but gives no text under them; the career list here is from the College of Home Sciences page.',
      'The page gives no department mailbox or phone number; only personal addresses of three staff, which are not shown here.',
      'The page links a Board of Studies meeting item (August 2024) that is not reproduced here. The study plan on the programme page is illustrative.',
      'Highlights, laboratories, research areas and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'hina-khan', name: 'Ms. Hina Khan', title: 'Lecturer', role: 'head', roleLabel: 'In-charge' },
    { id: 'rabia-siraj', name: 'Ms. Rabia Siraj', title: 'Lecturer', role: 'member' },
    { id: 'samreen-fareed-khan', name: 'Ms. Samreen Fareed Khan', title: 'Lecturer', role: 'member' },
    { id: 'bibi-zainab', name: 'Ms. Bibi Zainab', title: 'Lecturer', role: 'member' },
    { id: 'sana-burhan', name: 'Ms. Sana Burhan', title: 'Lecturer', role: 'member' },
  ],
}

export const bsHomeEconomics: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Home Economics',
  shortName: 'Home Economics',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department’s real scheme of studies is held by the department. A specialisation is chosen from the tracks below.',
  tagline: 'Specialised skills for homes, families and communities.',
  summary: 'A BS with five fields of specialisation, from art and design to food, child development and resource management.',
  ...pictures(BS, SLUG, 'BS Home Economics. Department of Home Economics, University of Swat.', 'Illustration for BS Home Economics'),
  about: [
    'The BS in Home Economics is awarded with a specialisation. It prepares women for professional careers and to play their part as effective members of a family and as nation builders.',
    'Students learn modern knowledge and technology, build social sensibilities and are prepared to manage their different roles as individuals, family members and citizens.',
  ],
  whyStudy: [
    { icon: 'spark', title: 'Choose a field', text: 'Five specialisations, from design to nutrition.' },
    { icon: 'users', title: 'A women’s campus', text: 'A department of the university’s Women Campus.' },
    { icon: 'briefcase', title: 'Many careers', text: 'Teaching, design, nutrition, management and community work.' },
    { icon: 'globe', title: 'Serve your community', text: 'Programme objectives centre on community and environment.' },
  ],
  outcomes: [
    'Use specialised knowledge of home economics to improve the well-being of individuals and families.',
    'Prepare for a professional career in a chosen field of specialisation.',
    'Manage the roles of individual, family member and citizen with social sensibility.',
    'Use modern knowledge and technology in the field.',
    'Contribute to the quality of day-to-day living of families and consumers.',
  ],
  years: [
    year(1, ['Introduction to Home Economics', 'Functional English', 'Islamic Studies', 'Computer Skills', 'Introduction to Art and Design'], ['Principles of Nutrition', 'Expository Writing', 'Pakistan Studies', 'Human Development', 'Fabric Study']),
    year(2, ['Family Studies', 'Food Science', 'Clothing Construction', 'Research Methods', 'Statistics'], ['Resource Management', 'Meal Planning', 'Textile Design', 'Child Care and Guidance', 'Consumer Studies']),
    year(3, ['Specialisation I', 'Specialisation II', 'Home Management', 'Community Development', 'Field Work I'], ['Specialisation III', 'Specialisation IV', 'Entrepreneurship', 'Field Work II', 'Scientific Writing']),
    year(4, ['Specialisation V', 'Elective I', 'Elective II', 'Capstone Project I'], ['Specialisation VI', 'Internship', 'Seminar', 'Capstone Project II']),
  ],
  tracks: [
    { icon: 'spark', title: 'Art and design', text: 'Drawing, colour and design.' },
    { icon: 'briefcase', title: 'Textile and clothing', text: 'Fabric, pattern and garment work.' },
    { icon: 'flask', title: 'Food and nutrition sciences', text: 'Food, diet and health.' },
    { icon: 'users', title: 'Human development and family studies', text: 'Children, family and community.' },
    { icon: 'chart', title: 'Resource and facility management', text: 'Households, budgets and facilities.' },
  ],
  skills: [
    { group: 'Practical', items: ['Meal planning', 'Pattern making', 'Design drawing', 'Child observation'] },
    { group: 'Professional', items: ['Budgeting', 'Event organising', 'Report writing', 'Presenting'] },
    { group: 'Community', items: ['Workshop facilitation', 'Needs assessment', 'Teamwork'] },
  ],
  careers: [
    { icon: 'cap', title: 'Instructor or teacher', text: 'Vocational institutes and schools.' },
    { icon: 'spark', title: 'Designer', text: 'Textile, interior, furniture or fashion.' },
    { icon: 'flask', title: 'Nutritionist', text: 'Diet advice for children and women.' },
    { icon: 'briefcase', title: 'Manager or officer', text: 'HR, quality control and events.' },
    { icon: 'users', title: 'Community worker', text: 'NGOs and community mobilisation.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: ELIGIBILITY }, ...scienceFaq('Home Economics', 4)],
}
