import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Economics and Development Studies, laid out like the DCST department page (the owner's blueprint, 2026-11-24). It replaces the
   office-style page built on 2026-11-25 from the same saved copy, so the facts are the ones that page carried.
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction, the vision, the mission, the chairman's message, the
   five objectives, the programmes (BS Economics, BS Development Studies; MPhil and PhD in preparation), the eight named staff, the 2021 Board of Studies
   item and the department mailbox.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plans) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-economics-and-development-studies/'
export const SLUG = 'economics-and-development-studies'
export const ECON = 'bs-economics-2'
export const DEV = 'bs-development-studies-2'

export const economics: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Economics and Development Studies',
  tagline: 'Economics and development, taught with the real problems of the region in view.',
  intro: 'BS Economics and BS Development Studies from one of the pioneer departments of the university, with MPhil and PhD programmes in preparation.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Economics and Development Studies. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Economics and Development Studies'),
  levelText: 'BS',
  programmesLede: 'The department offers the BS in Economics and the BS in Development Studies; MPhil and PhD programmes are in preparation.',
  about: [
    'Pakistan, and Khyber Pakhtunkhwa in particular, faces weak governance, population growth, poverty, conflict, water-food-energy insecurity, climate change, biodiversity loss, depletion of natural capital and macroeconomic instability. Academic and research institutions have a role in suggesting options. The Department of Economics and Development Studies (DEDS) designs and teaches courses and inquires freely into real-world issues at home and abroad.',
    'DEDS is one of the pioneer departments of the University of Swat. Its graduates pursue higher studies at prestigious institutions or serve in private and public sector organisations. It offers BS degrees in Economics and in Development Studies and is in the process of launching MPhil and PhD programmes in both.',
    'The department also plans a Research Centre for Sustainable Development, to give input to government departments and policy makers on key provincial and national issues.',
  ],
  vision:
    'To impart quality education in the fields of economics and development studies, to excel in research at par with reputed international institutions, and to establish linkages with national and international institutions.',
  mission:
    'To develop critical thinking among students and enable them to take informed decisions in practical life. Students are engaged in seminars, training, workshops and research activities to keep them updated and prepared for any job of responsibility assigned to them in future.',
  highlights: [
    { icon: 'chart', title: 'Theory and applied work', text: 'Sound theoretical and applied knowledge in line with international standards.' },
    { icon: 'globe', title: 'Real problems', text: 'Students study the economic and development challenges of the country and the world.' },
    { icon: 'search', title: 'Research skills', text: 'Graduates are prepared with research skills to contribute to institutions and society.' },
    { icon: 'briefcase', title: 'Policy input', text: 'The department gives input on key economic issues through policy briefs and scholarly articles.' },
    { icon: 'users', title: 'Linkages', text: 'It builds links with national and international institutions for research and academic activities.' },
    { icon: 'cap', title: 'MPhil and PhD planned', text: 'The page says MPhil and PhD programmes in both subjects are in preparation.' },
  ],
  disciplines: [ECON, DEV],
  labs: [
    {
      title: 'Computer and data laboratory',
      text: 'Statistical and econometric software for the data work in economics courses.',
      art: officeHero(SLUG),
      tools: ['Statistical software', 'Spreadsheet tools', 'Shared workstations'],
    },
    {
      title: 'Research centre (planned)',
      text: 'The page says the department plans a Research Centre for Sustainable Development; this card stands for it until it exists.',
      art: officeHero(ECON),
      tools: ['Survey tools', 'Policy brief templates', 'Meeting room'],
    },
    {
      title: 'Seminar room',
      text: 'Where students present and defend papers and hear visiting speakers.',
      art: officeHero(SLUG),
      tools: ['Projector', 'Whiteboard', 'Seminar schedule'],
    },
    {
      title: 'Reading room',
      text: 'Journals, reports and datasets for course and thesis work.',
      art: officeHero(DEV),
      tools: ['Journals', 'Government reports', 'Open datasets'],
    },
  ],
  research: [
    { icon: 'chart', title: 'Macroeconomics and public finance', text: 'Growth, inflation, budgets and debt in Pakistan.', tags: ['Growth', 'Inflation', 'Public finance'] },
    { icon: 'users', title: 'Poverty, labour and development', text: 'Poverty, jobs and how households cope in the region.', tags: ['Poverty', 'Labour', 'Households'] },
    { icon: 'globe', title: 'Environment and sustainable development', text: 'Water, food, energy and climate as development problems.', tags: ['Climate', 'Natural capital', 'Sustainability'] },
    { icon: 'briefcase', title: 'Governance and institutions', text: 'How institutions and conflict shape development.', tags: ['Governance', 'Conflict', 'Policy'] },
  ],
  careers: [
    { icon: 'chart', title: 'Economist or analyst', text: 'Government, banks and research organisations.' },
    { icon: 'users', title: 'Development professional', text: 'NGOs, donors and development programmes.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD, then research posts.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and policy posts.' },
    { icon: 'briefcase', title: 'Private sector', text: 'Banking, trade and planning roles.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Economics society', text: 'Student-run debates, quiz nights and talks.' },
    { icon: 'book', title: 'Seminars and workshops', text: 'Students take part in seminars, training and workshops.' },
    { icon: 'spark', title: 'Guest lectures', text: 'Economists and development workers speak about careers.' },
    { icon: 'trophy', title: 'Policy brief contest', text: 'Student teams write short briefs on a local problem.' },
  ],
  faq: [
    { q: 'Which programmes does the department offer?', a: 'The BS in Economics and the BS in Development Studies. MPhil and PhD programmes are in preparation, according to the page.' },
    { q: 'What do I need to apply?', a: 'The department’s page does not state an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    { q: 'Who leads the department?', a: 'The page lists Dr. Umar Hayat as Professor and Chairman and Dr. Anwar Hussain as Professor and Dean.' },
    { q: 'Has a Board of Studies met?', a: 'The page records that the second meeting of the Board of Studies, on 11 March 2021, approved and recommended the scheme of studies for the BS, MPhil and PhD programmes in Economics.' },
    { q: 'How do I contact the department?', a: 'The page gives the department mailbox deds@uswat.edu.pk.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The eight staff named on the department’s page, with the titles it gives.',
  alumni: ['inflation-and-household-spending', 'remittances-and-village-schooling', 'microfinance-and-women-shopkeepers'],
  reference: {
    sources: [{ label: 'Department of Economics and Development Studies page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    emails: ['deds@uswat.edu.pk'],
    openPoints: [
      'The chairman’s message on the page is unsigned. The page lists Dr. Umar Hayat as Professor and Chairman and Dr. Anwar Hussain as Professor and Dean, while its 2021 Board of Studies item calls Dr. Anwar Hussain the Chairman.',
      'The page gives no phone number or address.',
      'The 2021 item says the Board recommended MPhil and PhD schemes of studies in Economics, while the page elsewhere says the department is still in the process of launching them; the page does not say whether they have started.',
      'The BS Economics and BS Development Studies programme pages on the old site hold only a name and links, so their study plans, outcomes and careers are illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department. Dr. Fazal Rabbi is also named on the Department of Agricultural Sciences and Forestry page.',
    ],
  },
  team: [
    { id: 'umar-hayat', name: 'Dr. Umar Hayat', title: 'Professor and Chairman', role: 'head', roleLabel: 'Chairman' },
    { id: 'anwar-hussain', name: 'Dr. Anwar Hussain', title: 'Professor and Dean', role: 'member' },
    { id: 'shahid-ali-econ', name: 'Dr. Shahid Ali', title: 'Associate Professor', role: 'member', qualifications: ['Gold Medalist'] },
    { id: 'fazal-rabbi', name: 'Dr. Fazal Rabbi', title: 'Assistant Professor', role: 'member' },
    { id: 'muhammad-imad-khan', name: 'Dr. Muhammad Imad Khan', title: 'Lecturer', role: 'member' },
    { id: 'naveed-ali', name: 'Dr. Naveed Ali', title: 'Lecturer', role: 'member', qualifications: ['Gold Medalist'] },
    { id: 'tariq-ziad-khwaja', name: 'Mr. Tariq Ziad Khwaja', title: 'Lecturer', role: 'member' },
    { id: 'jawad-mohammad', name: 'Mr. Jawad Mohammad', title: 'Lecturer (on study leave)', role: 'member' },
  ],
}

const lede =
  'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.'
const applyFaq = {
  q: 'What do I need to apply?',
  a: 'The department has not published an entry requirement for this programme. The merit criteria are announced with each intake on the admissions page.',
}

export const bsEconomics: DisciplineProfile = {
  slug: ECON,
  department: SLUG,
  status: 'draft',
  name: 'BS Economics',
  shortName: 'Economics',
  curriculumLede: lede,
  tagline: 'Understand how economies work, and how to improve them.',
  summary: 'Micro and macroeconomics, econometrics, public finance and development, with research and policy writing.',
  ...pictures(ECON, SLUG, 'BS Economics. Department of Economics and Development Studies, University of Swat.', 'Illustration for BS Economics'),
  about: [
    'BS Economics gives students sound theoretical and applied knowledge of economics in line with international standards, and the research skills to use it on the problems of the region.',
    'The programme joins theory with data work, seminars and policy writing, and ends with a research project.',
  ],
  whyStudy: [
    { icon: 'chart', title: 'A toolkit for decisions', text: 'Learn how to weigh costs, benefits and trade-offs.' },
    { icon: 'search', title: 'Data and evidence', text: 'Econometrics and statistics are built in.' },
    { icon: 'globe', title: 'Real problems', text: 'Growth, poverty and inflation are studied with local examples.' },
    { icon: 'cap', title: 'A route to MPhil and PhD', text: 'The department plans postgraduate programmes in Economics.' },
  ],
  outcomes: [
    'Explain the main theories of micro and macroeconomics and apply them to real cases.',
    'Use statistics and econometrics to analyse economic data.',
    'Describe the economic and development challenges of Pakistan.',
    'Write a policy brief or research paper with evidence.',
    'Present and defend an argument in a seminar.',
  ],
  years: [
    year(1, ['Principles of Microeconomics', 'Calculus for Economists', 'Functional English', 'Islamic Studies', 'Introduction to Sociology'], ['Principles of Macroeconomics', 'Statistics I', 'Expository Writing', 'Pakistan Studies', 'Computer Skills']),
    year(2, ['Intermediate Microeconomics', 'Statistics II', 'Economic History of Pakistan', 'Mathematical Economics', 'Research Methods'], ['Intermediate Macroeconomics', 'Money and Banking', 'Development Economics', 'Public Finance', 'Linear Algebra']),
    year(3, ['Econometrics I', 'International Trade', 'Labour Economics', 'Islamic Economics', 'Environmental Economics'], ['Econometrics II', 'International Finance', 'Economic Growth', 'Agricultural Economics', 'Scientific Writing']),
    year(4, ['Economics of Pakistan', 'Elective I', 'Elective II', 'Research Project I'], ['Project Appraisal', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'chart', title: 'Macroeconomics and public finance', text: 'Growth, money and budgets.' },
    { icon: 'search', title: 'Econometrics and data', text: 'Estimating relationships from data.' },
    { icon: 'globe', title: 'International and development economics', text: 'Trade, aid and growth.' },
    { icon: 'users', title: 'Labour and social economics', text: 'Jobs, wages and welfare.' },
  ],
  skills: [
    { group: 'Analysis', items: ['Statistics', 'Econometrics', 'Mathematical modelling'] },
    { group: 'Tools', items: ['Spreadsheet modelling', 'Statistical software', 'Data visualisation'] },
    { group: 'Professional', items: ['Policy writing', 'Presenting', 'Teamwork', 'Research ethics'] },
  ],
  careers: [
    { icon: 'chart', title: 'Economist or analyst', text: 'Government, banks and research organisations.' },
    { icon: 'briefcase', title: 'Banking and finance', text: 'Banks and financial firms.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD, then research posts.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and policy posts.' },
  ],
  faq: [applyFaq, ...scienceFaq('Economics', 4)],
}

export const bsDevelopmentStudies: DisciplineProfile = {
  slug: DEV,
  department: SLUG,
  status: 'draft',
  name: 'BS Development Studies',
  shortName: 'Development Studies',
  curriculumLede: lede,
  tagline: 'Study how societies change, and how to help them change for the better.',
  summary: 'Poverty, governance, sustainable development and social change, with research methods and fieldwork.',
  ...pictures(DEV, SLUG, 'BS Development Studies. Department of Economics and Development Studies, University of Swat.', 'Illustration for BS Development Studies'),
  about: [
    'BS Development Studies looks at poverty, inequality, governance, conflict and sustainability, and at the policies and projects that try to improve lives. It draws on economics, sociology, politics and environment.',
    'Students learn research methods and project planning, take part in fieldwork, and finish with a research project.',
  ],
  whyStudy: [
    { icon: 'users', title: 'People at the centre', text: 'Study the lives that development is meant to improve.' },
    { icon: 'globe', title: 'Many disciplines', text: 'Economics, sociology, politics and environment together.' },
    { icon: 'search', title: 'Research and fieldwork', text: 'Surveys, interviews and project evaluation.' },
    { icon: 'briefcase', title: 'Work in development', text: 'NGOs, donors and government programmes hire graduates.' },
  ],
  outcomes: [
    'Explain the main concepts and theories of development.',
    'Describe the development challenges of Pakistan and Khyber Pakhtunkhwa.',
    'Design and carry out a small survey or interview study.',
    'Plan and appraise a development project.',
    'Write a policy brief on a development problem.',
  ],
  years: [
    year(1, ['Introduction to Development Studies', 'Principles of Economics', 'Functional English', 'Islamic Studies', 'Introduction to Sociology'], ['Social Change and Development', 'Statistics I', 'Expository Writing', 'Pakistan Studies', 'Computer Skills']),
    year(2, ['Development Economics', 'Research Methods I', 'Political Economy', 'Rural Development', 'Statistics II'], ['Gender and Development', 'Research Methods II', 'Governance and Institutions', 'Population and Society', 'Urban Development']),
    year(3, ['Project Planning and Management', 'Poverty and Inequality', 'Environment and Sustainable Development', 'Conflict and Peace', 'Monitoring and Evaluation'], ['Development Policy', 'Community Development', 'Microfinance', 'Field Course', 'Scientific Writing']),
    year(4, ['Development Communication', 'Elective I', 'Elective II', 'Research Project I'], ['International Development', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'users', title: 'Community and social development', text: 'Local organisations, gender and social change.' },
    { icon: 'chart', title: 'Poverty and policy', text: 'Measuring poverty and judging policy.' },
    { icon: 'globe', title: 'Environment and sustainability', text: 'Natural resources and climate.' },
    { icon: 'briefcase', title: 'Project management', text: 'Planning, budgeting and evaluating projects.' },
  ],
  skills: [
    { group: 'Research', items: ['Survey design', 'Interviews', 'Statistics', 'Report writing'] },
    { group: 'Practice', items: ['Project planning', 'Monitoring and evaluation', 'Community engagement'] },
    { group: 'Professional', items: ['Policy writing', 'Presenting', 'Teamwork', 'Research ethics'] },
  ],
  careers: [
    { icon: 'users', title: 'Development professional', text: 'NGOs, donors and development programmes.' },
    { icon: 'briefcase', title: 'Project officer', text: 'Planning and running projects.' },
    { icon: 'chart', title: 'Research officer', text: 'Think tanks and research organisations.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and policy posts.' },
  ],
  faq: [applyFaq, ...scienceFaq('Development Studies', 4)],
}
