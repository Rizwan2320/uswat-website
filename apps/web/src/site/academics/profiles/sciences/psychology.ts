import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'

import { pictures, scienceFaq } from './core'

/* Department of Psychological Studies, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGES, read 2026-11-06 (saved copies on the owner's Drive): the introduction (working since 17 October 2012; BS offered first),
   the five aims and objectives, the programme listed (BS in Psychology), and the named staff with their titles. The women's campus section
   (department-of-psychological-studies-wc) names five staff; one is also on the main page, so four more are shown here with the tag "Women Campus".
   EVERYTHING ELSE (vision, highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the
   template that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-psychological-studies/'
const PAGE_WC = 'https://uswat.edu.pk/department-of-psychological-studies-wc/'
export const SLUG = 'psychological-studies'
export const BS = 'bs-psychology-2'

const WC = 'Women Campus'

export const psychology: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Psychological Studies',
  tagline: 'Understand people: how they think, feel and grow.',
  intro: 'A BS in Psychology that joins the understanding of psychology in theory and in practice with moral grooming and integrity.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Psychological Studies. University of Swat. BS Psychology.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Psychological Studies'),
  levelText: 'BS',
  programmesLede: 'The department’s page lists the BS in Psychology.',
  about: [
    'The Department of Psychological Studies was opened to develop in students the qualities that fit them to fill their places in their homes and in society. It has worked since 17 October 2012, and the BS programme was the first it offered.',
    'The page describes the department as being in its initial period. Besides developing understanding of psychology both in practice and in theory, it focuses on moral grooming and integrity, and gives weight to Valued Education Classes.',
    'The department aims to keep results at a standard, with a well-qualified and painstaking faculty, and expects its students to have a special concern for the environment and respect for life in all its forms.',
  ],
  vision:
    'To be a department where students learn psychology as a science and as a practice, and graduate as scholars and practitioners who help their communities.',
  mission:
    'To provide excellent education. To train graduates for careers in scientific psychology and scientifically based professional practice. To work on the principles of scholarly excellence, interdisciplinary collaboration and wide-ranging psychological services. To help students build the skills and knowledge they need after the degree, in a congenial learning environment, so that they become effective practitioners and scholars who contribute to the country by working on psychological and social problems.',
  highlights: [
    { icon: 'brain', title: 'Science and practice together', text: 'Courses teach how the mind and behaviour are studied, and how that knowledge is used with people.' },
    { icon: 'search', title: 'Research methods', text: 'Students learn to design a study, collect data and read the results with statistics.' },
    { icon: 'users', title: 'Services to the community', text: 'The aims include wide-ranging psychological services and work on social problems.' },
    { icon: 'shield', title: 'Ethics and integrity', text: 'Moral grooming and professional ethics run through the programme.' },
    { icon: 'rocket', title: 'A final-year research project', text: 'Each student carries out a study with a supervisor and presents the result.' },
    { icon: 'cap', title: 'A base for further study', text: 'The BS prepares graduates for postgraduate study in psychology.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'Experimental psychology laboratory',
      text: 'Attention, memory and perception experiments, run and analysed by students.',
      art: officeHero(SLUG),
      tools: ['Response-time software', 'Stimulus displays', 'Data-analysis workstations'],
    },
    {
      title: 'Psychological testing room',
      text: 'Where students learn to give, score and interpret standard tests under supervision.',
      art: officeHero(BS),
      tools: ['Test kits', 'Scoring sheets', 'Observation notes'],
    },
    {
      title: 'Counselling skills practice room',
      text: 'A quiet room for role-play and practice of listening and interviewing skills.',
      art: officeHero(SLUG),
      tools: ['Role-play scripts', 'Case notes', 'Feedback forms'],
    },
    {
      title: 'Statistics and data room',
      text: 'Analysis of survey and experimental data with standard software.',
      art: officeHero(BS),
      tools: ['Statistical software', 'Survey tools', 'Shared workstations'],
    },
  ],
  research: [
    { icon: 'brain', title: 'Cognition and learning', text: 'How students attend, remember and learn.', tags: ['Memory', 'Attention', 'Learning'] },
    { icon: 'users', title: 'Social and community psychology', text: 'Attitudes, relationships and the social problems of the district.', tags: ['Community', 'Attitudes', 'Social problems'] },
    { icon: 'spark', title: 'Mental health and well-being', text: 'Stress, coping and how people look for help.', tags: ['Stress', 'Coping', 'Well-being'] },
    { icon: 'chart', title: 'Measurement and research methods', text: 'Building and checking scales and questionnaires.', tags: ['Testing', 'Scales', 'Statistics'] },
  ],
  careers: [
    { icon: 'users', title: 'Counsellor or psychologist', text: 'Schools, clinics and community services, with further training.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'Postgraduate study, then research posts.' },
    { icon: 'briefcase', title: 'Human resources', text: 'Recruitment, training and staff well-being.' },
    { icon: 'shield', title: 'Social welfare', text: 'Government and non-profit services.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and technical posts in the public sector.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Psychology society', text: 'Student-run talks, film nights and discussions for first-year students.' },
    { icon: 'spark', title: 'Awareness days', text: 'Student-led events on mental health and well-being.' },
    { icon: 'book', title: 'Research circles', text: 'Peer groups that read and discuss papers together.' },
    { icon: 'trophy', title: 'Newsletter', text: 'The department publishes a newsletter; the page links the 2025-26 issue.' },
  ],
  faq: [
    { q: 'Which programme does the department list?', a: 'The department’s page lists the BS in Psychology.' },
    { q: 'What do I need to apply for the BS?', a: 'The department’s page does not state its entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    { q: 'Who leads the department?', a: 'The page names Ms. Palwasha Rahim, Lecturer, as In-Charge.' },
    { q: 'Is there a Women Campus section?', a: 'Yes. The university keeps a separate Women Campus page for Psychological Studies; its staff are shown on this page with the tag “Women Campus”.' },
    { q: 'Where can I find the latest notices?', a: 'Merit lists, timetables and announcements are published on the university notices page.' },
  ],
  peopleTitle: 'In-charge and faculty',
  peopleLede: 'The staff named on the department’s pages, with the titles they give. Women Campus staff are tagged.',
  alumni: ['exam-stress-among-university-students', 'screen-time-and-sleep-in-adolescents', 'a-short-scale-for-study-motivation'],
  reference: {
    sources: [
      { label: 'Department of Psychological Studies page, University of Swat', url: PAGE },
      { label: 'Department of Psychological Studies page for the Women Campus, University of Swat', url: PAGE_WC },
    ],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page lists the BS in Psychology only. It gives no entry requirement, seat numbers, fees or intake dates.',
      'The page has no vision statement. The vision on this page is illustrative text for the template.',
      'The page calls the department “in its initial period”. It names Ms. Roya Shahhiman Zada as on study leave, while the Women Campus page calls her In-Charge; this page uses the first.',
      'The page links a 2025-26 newsletter that is not read here. Staff e-mail addresses on the page are not shown.',
      'The BS Psychology programme pages on the old site hold only links to scheme-of-studies files (the Women Campus one is a separate address), so the study plan, outcomes and careers on the programme page are illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'palwasha-rahim', name: 'Ms. Palwasha Rahim', title: 'Lecturer', role: 'head', roleLabel: 'In-Charge' },
    { id: 'faheem-ud-din', name: 'Dr. Faheem Ud Din', title: 'Lecturer', role: 'member' },
    { id: 'roya-shahhiman-zada', name: 'Ms. Roya Shahhiman Zada', title: 'Lecturer (on study leave)', role: 'member', qualifications: ['Gold Medalist'] },
    { id: 'aafra-zeb', name: 'Ms. Aafra Zeb', title: 'Lecturer (Psychology)', role: 'member', roleLabel: WC },
    { id: 'maryam-kausar', name: 'Ms. Maryam Kausar', title: 'Lecturer (Psychology)', role: 'member', roleLabel: WC },
    { id: 'sana-khurshid', name: 'Ms. Sana Khurshid', title: 'Lecturer (Psychology)', role: 'member', roleLabel: WC },
    { id: 'hawa-khan', name: 'Ms. Hawa Khan', title: 'Lecturer (Psychology)', role: 'member', roleLabel: WC },
  ],
}

export const bsPsychology: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Psychology',
  shortName: 'Psychology',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Learn how people think, feel and behave.',
  summary: 'Cognitive, developmental, social and clinical psychology, with research methods and statistics throughout.',
  ...pictures(BS, SLUG, 'BS Psychology. Department of Psychological Studies, University of Swat.', 'Illustration for BS Psychology'),
  about: [
    'BS Psychology teaches how the mind and behaviour are studied scientifically, and how that knowledge is used to help people. It covers cognitive, developmental, social, personality and clinical psychology.',
    'Research methods and statistics run through all four years. In the last year students choose electives and carry out a research project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'brain', title: 'A science of people', text: 'Learn how experiments, tests and surveys explain behaviour.' },
    { icon: 'users', title: 'Skills for helping', text: 'Listening, interviewing and ethical practice are taught and practised.' },
    { icon: 'chart', title: 'Evidence and numbers', text: 'Statistics and research design are built in from year one.' },
    { icon: 'cap', title: 'A route to further study', text: 'The degree prepares graduates for postgraduate study.' },
  ],
  outcomes: [
    'Explain the main theories and findings in cognitive, developmental, social and clinical psychology.',
    'Design a study, collect data, analyse it with statistics and report the result.',
    'Give and score standard psychological tests under supervision.',
    'Use basic listening and interviewing skills ethically.',
    'Discuss how psychology applies to education, health and community problems.',
  ],
  years: [
    year(1, ['Introduction to Psychology', 'Biological Psychology', 'Statistics I', 'Functional English', 'Islamic Studies'], ['Developmental Psychology', 'Social Psychology', 'Statistics II', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Cognitive Psychology', 'Personality Theories', 'Research Methods I', 'Psychological Testing', 'Computer Skills'], ['Learning and Motivation', 'Abnormal Psychology', 'Research Methods II', 'Educational Psychology', 'Sociology']),
    year(3, ['Clinical Psychology', 'Counselling Psychology', 'Health Psychology', 'Experimental Psychology', 'Professional Ethics'], ['Industrial and Organisational Psychology', 'Community Psychology', 'Psychological Assessment', 'Cross-cultural Psychology', 'Scientific Writing']),
    year(4, ['Neuropsychology', 'Elective I', 'Elective II', 'Research Project I'], ['Positive Psychology', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'users', title: 'Clinical and counselling', text: 'Understanding distress, and the basics of helping.' },
    { icon: 'cap', title: 'Educational and developmental', text: 'How children and young people learn and grow.' },
    { icon: 'briefcase', title: 'Organisational psychology', text: 'People, work and well-being in organisations.' },
    { icon: 'brain', title: 'Cognitive and experimental', text: 'Attention, memory and how to test ideas about the mind.' },
  ],
  skills: [
    { group: 'Research', items: ['Study design', 'Survey and interview methods', 'Statistical analysis', 'Report writing'] },
    { group: 'Practice', items: ['Test administration', 'Active listening', 'Case notes', 'Ethical practice'] },
    { group: 'Professional', items: ['Presenting', 'Teamwork', 'Confidentiality', 'Reflective practice'] },
  ],
  careers: [
    { icon: 'users', title: 'Counsellor or psychologist', text: 'Schools, clinics and community services, with further training.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'flask', title: 'Researcher', text: 'Postgraduate study, then research posts.' },
    { icon: 'briefcase', title: 'Human resources', text: 'Recruitment, training and staff well-being.' },
    { icon: 'shield', title: 'Social welfare', text: 'Government and non-profit services.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'The department has not published an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    ...scienceFaq('Psychology', 4),
  ],
}
