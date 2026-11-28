import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Tourism and Hospitality, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the introduction, the vision, the mission,
   the four aims and five objectives, the two degrees, the eligibility, the Food and Beverages Laboratory item (15 October 2024), the two named staff, the
   mailbox and the telephone number.
   EVERYTHING ELSE (highlights apart from the laboratory, research areas, careers, student life, questions and the study plans) is illustrative text for the
   template that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-tourism-and-hospitality/'
export const SLUG = 'tourism-and-hospitality'
export const TH = 'bs-tourism-and-hospitality-2'
// The old address list has no programme page for Culinary Arts; this slug is new.
export const CUL = 'bs-culinary-arts'

const ELIGIBILITY = 'FA, F.Sc or an equivalent qualification with at least 45% marks.'

export const tourism: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Tourism and Hospitality',
  tagline: 'Future leaders of tourism and hospitality, trained in the Swat Valley.',
  intro: 'The valley’s natural beauty and culture as a living laboratory, with BS Tourism and Hospitality and BS Culinary Arts.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Tourism and Hospitality. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Tourism and Hospitality'),
  levelText: 'BS',
  programmesLede: 'The department offers two degrees: BS Tourism and Hospitality and BS Culinary Arts.',
  about: [
    'The Department of Tourism and Hospitality is dedicated to shaping future leaders of the global tourism and hospitality industry. It uses the natural beauty and cultural richness of the Swat Valley as a living laboratory for learning, research and innovation.',
    'Its programmes balance academic rigour with practical experience and focus on sustainable tourism, hospitality excellence, culinary innovation and destination development. The page says graduates are prepared for roles from international hotel management and travel operations to event management and tourism entrepreneurship.',
    'The department hopes to add MPhil and PhD programmes and to strengthen partnerships with industry, government bodies and international institutions. It has used the Higher Education Commission’s curriculum with minor modifications since it began.',
  ],
  vision:
    'To be recognised as a leading centre of excellence in tourism and hospitality education, research and innovation, producing globally competitive graduates who promote sustainable tourism, celebrate cultural diversity and advance the hospitality industry nationally and internationally.',
  mission:
    'To provide world-class education that blends academic rigour with practical experience in tourism and hospitality, fostering innovation, leadership and entrepreneurship so graduates are ready for dynamic roles in the global industry.',
  highlights: [
    { icon: 'globe', title: 'The valley as a classroom', text: 'Swat’s scenery and culture are used for learning and research.' },
    { icon: 'flask', title: 'Food and Beverages Laboratory', text: 'Inaugurated on 15 October 2024 by the Vice Chancellor, Prof. Dr. Hassan Sher.' },
    { icon: 'briefcase', title: 'Practical experience', text: 'Internships, fieldwork, industry projects and study tours are listed.' },
    { icon: 'rocket', title: 'Entrepreneurship', text: 'Students are encouraged to create new ventures.' },
    { icon: 'users', title: 'Industry partners', text: 'The department seeks ties with industry, government and international bodies.' },
    { icon: 'cap', title: 'Gold medallist staff', text: 'Both named staff are noted as gold medallists.' },
  ],
  disciplines: [TH, CUL],
  labs: [
    {
      title: 'Food and Beverages Laboratory',
      text: 'Inaugurated on 15 October 2024 at the Institute of Cultural Heritage, Tourism and Hospitality Management by Vice Chancellor Prof. Dr. Hassan Sher. Dr. Aatif Iqbal said it gives practical training for national and international hospitality careers; students hosted and served the guests.',
      art: officeHero(SLUG),
      tools: ['Training kitchen', 'Service area', 'Practice covers'],
    },
    { title: 'Front-office practice room', text: 'Reservations, check-in and guest service role plays.', art: officeHero(TH), tools: ['Reservation software', 'Reception desk', 'Guest folios'] },
    { title: 'Travel planning room', text: 'Itineraries, tour costing and destination guides.', art: officeHero(SLUG), tools: ['Maps', 'Tour cost sheets', 'Booking systems'] },
    { title: 'Pastry and bakery corner', text: 'Baking and dessert work for culinary students.', art: officeHero(CUL), tools: ['Ovens', 'Mixers', 'Piping sets'] },
  ],
  research: [
    { icon: 'globe', title: 'Sustainable tourism', text: 'Tourism that protects culture, communities and nature.', tags: ['Sustainability', 'Heritage', 'Communities'] },
    { icon: 'briefcase', title: 'Hospitality management', text: 'Hotels, restaurants and service quality.', tags: ['Hotels', 'Service', 'Quality'] },
    { icon: 'flask', title: 'Culinary innovation', text: 'Local food, new dishes and food safety.', tags: ['Cuisine', 'Food safety', 'Innovation'] },
    { icon: 'chart', title: 'Destination development', text: 'Planning and marketing destinations.', tags: ['Planning', 'Marketing', 'Policy'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Hotel management', text: 'National and international hotels.' },
    { icon: 'globe', title: 'Travel operations', text: 'Tour operators and travel agencies.' },
    { icon: 'users', title: 'Event management', text: 'Events, conferences and weddings.' },
    { icon: 'rocket', title: 'Tourism entrepreneur', text: 'Your own tour, guesthouse or restaurant business.' },
    { icon: 'flask', title: 'Chef or food service manager', text: 'Kitchens and catering companies.' },
    { icon: 'cap', title: 'Teacher or researcher', text: 'Training institutes and postgraduate study.' },
  ],
  studentLife: [
    { icon: 'globe', title: 'Study tours', text: 'Visits to destinations, hotels and heritage sites.' },
    { icon: 'users', title: 'Hospitality society', text: 'Student-run events and guest services.' },
    { icon: 'trophy', title: 'Cooking and service contests', text: 'Competitions in the kitchen and at the table.' },
    { icon: 'spark', title: 'Workshops and certifications', text: 'The department lists workshops and certifications with industry experts.' },
  ],
  faq: [
    { q: 'Which degrees does the department offer?', a: 'BS Tourism and Hospitality and BS Culinary Arts.' },
    { q: 'What do I need to apply?', a: ELIGIBILITY },
    { q: 'Who leads the department?', a: 'The page names Dr. Aatif Iqbal, Assistant Professor, as In-charge.' },
    { q: 'How do I contact the department?', a: 'The page gives the mailbox dth@uswat.edu.pk and the telephone number 0092-946-920885.' },
    { q: 'Are MPhil and PhD programmes planned?', a: 'The page says the department aspires to add them; it gives no date.' },
  ],
  peopleTitle: 'In-charge and faculty',
  peopleLede: 'The two staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['a-guesthouse-trail-for-visitors-to-upper-swat', 'service-quality-in-three-valley-hotels', 'a-menu-of-swati-dishes-for-visitors'],
  reference: {
    sources: [{ label: 'Department of Tourism and Hospitality page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    emails: ['dth@uswat.edu.pk'],
    phones: [{ label: 'Department', number: '0092-946-920885' }],
    openPoints: [
      'The laboratory item still names the “Institute of Cultural Heritage, Tourism, and Hospitality Management (ICHTHM)” and calls Dr. Zarawar Khan its In-Charge, while the same page names Dr. Aatif Iqbal as In-charge of this department; the Archaeology page says the institute was split in 2025.',
      'The page gives no year of founding, fees, seat numbers or intake dates, and no scheme of studies. The study plans on the programme pages are illustrative.',
      'The old address list has no programme page for Culinary Arts; its page is new.',
      'The page says the department offers two degrees; MPhil and PhD programmes are an aim, not an offer.',
      'Highlights (except the laboratory), research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    {
      id: 'aatif-iqbal',
      name: 'Dr. Aatif Iqbal',
      title: 'Assistant Professor',
      role: 'head',
      roleLabel: 'In-charge',
      qualifications: ['PhD in Tourism, Universiti Putra Malaysia', 'Gold Medalist'],
    },
    {
      id: 'farhad-nazir',
      name: 'Mr. Farhad Nazir',
      title: 'Lecturer',
      role: 'member',
      qualifications: ['MA in Tourism and Hospitality, Hazara University, Mansehra', 'Gold Medalist'],
    },
  ],
}

export const bsTourismHospitality: DisciplineProfile = {
  slug: TH,
  department: SLUG,
  status: 'draft',
  name: 'BS Tourism and Hospitality',
  shortName: 'Tourism and Hospitality',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department follows the HEC curriculum with minor modifications and its page gives no scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Welcome the world to Swat, and beyond.',
  summary: 'Tourism, hotel and event management over four years, with internships, fieldwork and a project.',
  ...pictures(TH, SLUG, 'BS Tourism and Hospitality. Department of Tourism and Hospitality, University of Swat.', 'Illustration for BS Tourism and Hospitality'),
  about: [
    'BS Tourism and Hospitality prepares graduates for roles from hotel management and travel operations to event management and tourism entrepreneurship.',
    'It emphasises sustainable tourism and destination development, and learns from internships, fieldwork, industry projects and study tours.',
  ],
  whyStudy: [
    { icon: 'globe', title: 'A famous destination', text: 'Study tourism in a valley visitors already come to see.' },
    { icon: 'flask', title: 'A training laboratory', text: 'The Food and Beverages Laboratory opened in October 2024.' },
    { icon: 'briefcase', title: 'Hands-on learning', text: 'Internships and fieldwork are listed.' },
    { icon: 'rocket', title: 'Start your own venture', text: 'Entrepreneurship is a stated objective.' },
  ],
  outcomes: [
    'Explain how the tourism and hospitality industry works.',
    'Plan a tour or an event with a budget.',
    'Deliver guest service to a professional standard.',
    'Apply the ideas of sustainable and responsible tourism.',
    'Use research to study a destination or a service.',
    'Start and manage a small tourism venture.',
  ],
  years: [
    year(1, ['Introduction to Tourism', 'Introduction to Hospitality', 'Functional English', 'Islamic Studies', 'Computer Skills'], ['Front Office Operations', 'Expository Writing', 'Pakistan Studies', 'Principles of Management', 'Food and Beverage Basics']),
    year(2, ['Tour Operations', 'Housekeeping Operations', 'Marketing for Tourism', 'Research Methods', 'Accounting'], ['Travel Agency Management', 'Food and Beverage Service', 'Tourism Geography', 'Statistics', 'Cultural Heritage and Tourism']),
    year(3, ['Event Management', 'Destination Management', 'Hotel Management', 'Tourism Law', 'Internship I'], ['Sustainable Tourism', 'Tourism Entrepreneurship', 'Service Quality', 'Elective I', 'Scientific Writing']),
    year(4, ['Elective II', 'Elective III', 'Tourism Policy and Planning', 'Project I'], ['Elective IV', 'Seminar', 'Internship II', 'Project II']),
  ],
  tracks: [
    { icon: 'globe', title: 'Tourism and travel', text: 'Tours, travel agencies and destinations.' },
    { icon: 'briefcase', title: 'Hotel management', text: 'Front office, housekeeping and food service.' },
    { icon: 'users', title: 'Events', text: 'Planning and running events.' },
    { icon: 'rocket', title: 'Tourism entrepreneurship', text: 'Starting your own venture.' },
  ],
  skills: [
    { group: 'Industry', items: ['Reservations', 'Guest service', 'Tour costing', 'Event planning'] },
    { group: 'Business', items: ['Budgeting', 'Marketing', 'Negotiation', 'Accounting basics'] },
    { group: 'Professional', items: ['Communication', 'Teamwork', 'Languages', 'Problem solving'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Hotel management', text: 'Hotels and resorts.' },
    { icon: 'globe', title: 'Travel operations', text: 'Tour operators and travel agencies.' },
    { icon: 'users', title: 'Event management', text: 'Events and conferences.' },
    { icon: 'rocket', title: 'Entrepreneur', text: 'Guesthouses and tour companies.' },
    { icon: 'cap', title: 'Teacher or researcher', text: 'Training and further study.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: ELIGIBILITY }, ...scienceFaq('Tourism and Hospitality', 4)],
}

export const bsCulinaryArts: DisciplineProfile = {
  slug: CUL,
  department: SLUG,
  status: 'draft',
  name: 'BS Culinary Arts',
  shortName: 'Culinary Arts',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department follows the HEC curriculum with minor modifications and its page gives no scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Cook, create and run a kitchen.',
  summary: 'Cooking, baking, menu design and kitchen management over four years, with the training laboratory and internships.',
  ...pictures(CUL, SLUG, 'BS Culinary Arts. Department of Tourism and Hospitality, University of Swat.', 'Illustration for BS Culinary Arts'),
  about: [
    'BS Culinary Arts is the department’s second degree. It stresses culinary innovation and practical training, and the department’s Food and Beverages Laboratory, inaugurated in October 2024, supports it.',
    'Students learn to cook, to design menus and to run a kitchen safely, and to take part in tourism and hospitality in the valley.',
  ],
  whyStudy: [
    { icon: 'flask', title: 'A training kitchen', text: 'The Food and Beverages Laboratory gives practical training.' },
    { icon: 'spark', title: 'Culinary innovation', text: 'A stated focus of the department.' },
    { icon: 'globe', title: 'Local and global food', text: 'Swat’s food alongside wider cuisines.' },
    { icon: 'rocket', title: 'Your own kitchen', text: 'Entrepreneurship is encouraged.' },
  ],
  outcomes: [
    'Prepare a range of dishes and baked goods to a professional standard.',
    'Keep a kitchen clean, safe and well organised.',
    'Design and cost a menu.',
    'Serve and present food well.',
    'Create new dishes using local ingredients.',
    'Plan and manage a small food business.',
  ],
  years: [
    year(1, ['Introduction to Culinary Arts', 'Food Safety and Hygiene', 'Functional English', 'Islamic Studies', 'Computer Skills'], ['Kitchen Fundamentals', 'Basic Nutrition', 'Expository Writing', 'Pakistan Studies', 'Food and Beverage Basics']),
    year(2, ['Pakistani Cuisine', 'Bakery and Pastry I', 'Menu Planning', 'Research Methods', 'Accounting'], ['Continental Cuisine', 'Bakery and Pastry II', 'Food Costing', 'Statistics', 'Food and Beverage Service']),
    year(3, ['Asian Cuisines', 'Garde Manger', 'Kitchen Management', 'Food Science', 'Internship I'], ['Culinary Innovation', 'Catering and Events', 'Food Entrepreneurship', 'Elective I', 'Scientific Writing']),
    year(4, ['Elective II', 'Elective III', 'Restaurant Operations', 'Project I'], ['Elective IV', 'Seminar', 'Internship II', 'Project II']),
  ],
  tracks: [
    { icon: 'flask', title: 'Cooking', text: 'Pakistani and world cuisines.' },
    { icon: 'spark', title: 'Bakery and pastry', text: 'Baking, desserts and decoration.' },
    { icon: 'briefcase', title: 'Kitchen management', text: 'Costing, safety and teams.' },
    { icon: 'rocket', title: 'Food entrepreneurship', text: 'Catering and food businesses.' },
  ],
  skills: [
    { group: 'Kitchen', items: ['Knife skills', 'Cooking methods', 'Baking', 'Plating'] },
    { group: 'Safety and management', items: ['Food hygiene', 'Menu costing', 'Stock control'] },
    { group: 'Professional', items: ['Teamwork', 'Time management', 'Customer service'] },
  ],
  careers: [
    { icon: 'flask', title: 'Chef', text: 'Hotels, restaurants and catering.' },
    { icon: 'briefcase', title: 'Food service manager', text: 'Kitchens and dining operations.' },
    { icon: 'rocket', title: 'Food entrepreneur', text: 'Cafés, bakeries and catering.' },
    { icon: 'users', title: 'Events caterer', text: 'Weddings and conferences.' },
    { icon: 'cap', title: 'Trainer', text: 'Culinary training institutes.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: ELIGIBILITY }, ...scienceFaq('Culinary Arts', 4)],
}
