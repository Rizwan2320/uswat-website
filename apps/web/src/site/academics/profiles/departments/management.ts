import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures } from '../sciences/core'

/* Department of Management and Commerce, laid out like the DCST department page (the owner's blueprint, 2026-11-24). It replaces the office-style page
   built on 2026-11-25 from the same saved copy, so the facts are the ones that page carried.
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction, the vision and credo, the mission, the eleven degree
   programmes, the eleven named staff and the department mailbox.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`.
   Only BBA (Hons) has a programme page in the old site's address list, so it is the one programme built here; the other ten are named in the text. */

const PAGE = 'https://uswat.edu.pk/department-of-management-commerce/'
export const SLUG = 'management-commerce'
// The banner and chip art for this department were drawn under this key on 2026-11-25.
const ART = 'management-and-commerce'
export const BBA = 'bba-hons-2'

export const management: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Management and Commerce',
  tagline: 'Technological at heart, inventive in mind and socially responsible in action.',
  intro: 'Teaching, research and advisory support for industry in District Swat, with degrees from BBA to PhD.',
  hero: officeHero(ART),
  banner: officeBanner(ART, 'Department of Management and Commerce. University of Swat.'),
  tile: officeHero(ART, 'Illustration for the Department of Management and Commerce'),
  levelText: 'BBA to PhD',
  programmesLede:
    'The page lists eleven degrees, from BBA (Hons) and four BS programmes to MBA, EMBA, MS and PhD; the BBA (Hons) is shown here.',
  about: [
    'The Department of Management and Commerce sets out to steer the societal narrative in the right direction through outstanding teaching, relevant research and advisory support to local industry in the catchment area of District Swat. It aligns the expectations of industry and academia through practice-oriented degree programmes at bachelor’s, master’s and PhD levels.',
    'The BBA, MBA, MS and PhD programmes offer a complete set of expertise in human resource management, entrepreneurship, finance and marketing, with an emphasis on digitization in line with the university’s declaration of 2023 as a digital year. The department strives to create owner-managers and entrepreneurs with value-creation competencies, with internships, industry trips and market-oriented research projects.',
    'The department works to reach employers for student placement and keeps close liaison with industry and alumni. It gives room to student-led co-curricular activities, such as societies and sports.',
  ],
  vision:
    'To nurture second-to-none graduates by acting as a springboard for students to achieve their true potential. The credo is “Technological at heart, Inventive in mind and socially responsible in action”. Achieving the vision depends on adherence to the principles of access, quality, relevance, fairness, service and upholding merit, in line with the vision and mission of the University of Swat.',
  mission:
    'To develop wholesome individuals through a unique blend of curricular, co-curricular and extracurricular activities, to combat credential creep and educational inflation. To create value-creating individuals who create value for themselves and for others through useful contributions to the triple helix of academia, industry and government. The degrees are designed to relieve societal pain points and open avenues of development for District Swat, by germinating innovation and a spirit of national competitiveness.',
  highlights: [
    { icon: 'briefcase', title: 'Practice-oriented degrees', text: 'Bachelor’s, master’s and PhD programmes built around what industry and the community need.' },
    { icon: 'layers', title: 'Four domains', text: 'Human resource management, entrepreneurship, finance and marketing.' },
    { icon: 'code', title: 'Digitization', text: 'The department stresses digital skills, in line with the university’s declaration of 2023 as a digital year.' },
    { icon: 'users', title: 'Internships and industry trips', text: 'Students get internships, industry visits and market-oriented research projects.' },
    { icon: 'rocket', title: 'Entrepreneurs and owner-managers', text: 'The department aims to create people who build and run ventures.' },
    { icon: 'trophy', title: 'Societies and sports', text: 'A vibrant student body, with student-led co-curricular activities.' },
  ],
  disciplines: [BBA],
  labs: [
    {
      title: 'Computer and analytics laboratory',
      text: 'Spreadsheet, accounting and analytics software for finance and marketing courses.',
      art: officeHero(ART),
      tools: ['Accounting software', 'Spreadsheet tools', 'Statistical software'],
    },
    {
      title: 'Case-study and seminar room',
      text: 'Where students discuss business cases, present and defend proposals.',
      art: officeHero(BBA),
      tools: ['Projector', 'Whiteboard', 'Case library'],
    },
    {
      title: 'Entrepreneurship and incubation corner',
      text: 'A space to work on business ideas with mentors.',
      art: officeHero(ART),
      tools: ['Business-model canvases', 'Mentor sessions', 'Pitch practice'],
    },
    {
      title: 'Career and placement desk',
      text: 'Support for internships, interviews and employer contact.',
      art: officeHero(BBA),
      tools: ['CV clinics', 'Employer database', 'Interview practice'],
    },
  ],
  research: [
    { icon: 'users', title: 'Human resource management', text: 'How people are hired, trained and kept in local organisations.', tags: ['HR', 'Motivation', 'Leadership'] },
    { icon: 'rocket', title: 'Entrepreneurship', text: 'Starting and growing small businesses in District Swat.', tags: ['Start-ups', 'SMEs', 'Innovation'] },
    { icon: 'chart', title: 'Finance and accounting', text: 'Investment, banking and the financial decisions of firms and households.', tags: ['Finance', 'Banking', 'Accounting'] },
    { icon: 'globe', title: 'Marketing and digitization', text: 'How local firms reach customers online.', tags: ['Marketing', 'Digital', 'Consumers'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Manager or executive', text: 'Firms across trade, services and industry.' },
    { icon: 'chart', title: 'Accountant or finance officer', text: 'Banks, firms and public bodies.' },
    { icon: 'rocket', title: 'Entrepreneur', text: 'Starting and running a business.' },
    { icon: 'users', title: 'Human resource officer', text: 'Recruitment, training and staff welfare.' },
    { icon: 'globe', title: 'Marketing professional', text: 'Brands, sales and digital marketing.' },
    { icon: 'cap', title: 'Teacher or researcher', text: 'MS and PhD, then teaching and research posts.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Business society', text: 'Student-run talks, mock interviews and business plan contests.' },
    { icon: 'briefcase', title: 'Industry trips', text: 'Visits to firms and markets in and around Swat.' },
    { icon: 'trophy', title: 'Sports and co-curricular activities', text: 'Teams and events run by students.' },
    { icon: 'spark', title: 'Alumni meetings', text: 'Graduates speak about their careers.' },
  ],
  faq: [
    { q: 'Which degrees does the department list?', a: 'BBA (Hons), BS Digital Marketing, BS Business Analytics, BS Accounting and Finance, BS Islamic Banking and Finance, MBA and Executive MBA (each for business and non-business streams), MS in Management Sciences and PhD in Management Sciences.' },
    { q: 'What do I need to apply?', a: 'The department’s page does not state an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Hazrat Bilal, Professor, as Director.' },
    { q: 'Where can I find the course contents?', a: 'The department’s page links the course contents of its programmes on the university’s site.' },
    { q: 'How do I contact the department?', a: 'The page gives the department mailbox cmc@uswat.edu.pk.' },
  ],
  peopleTitle: 'Director and faculty',
  peopleLede: 'The eleven staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['pricing-and-sales-in-a-local-market', 'staff-turnover-in-small-firms', 'online-selling-by-home-businesses'],
  reference: {
    sources: [{ label: 'Department of Management and Commerce page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    emails: ['cmc@uswat.edu.pk'],
    openPoints: [
      'The page gives no phone number, address or head-of-department message. Duration, eligibility, fees and seats are not on the page.',
      'The page also lists curriculum files for “BBA (Hons) 2022” and “BBA 2025”; how the two relate is not stated, so the degree list shows the programme once.',
      'The page names the department “Department of Management and Commerce” in its text and “CM&C” once; the old address uses “management-commerce”.',
      'Only BBA (Hons) has a programme page in the old site’s address list; the other ten degrees are named in the text only. The study plan, outcomes and careers on the programme page are illustrative.',
      'Laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'hazrat-bilal', name: 'Dr. Hazrat Bilal', title: 'Professor and Director', role: 'head', roleLabel: 'Director', qualifications: ['PhD in Management Sciences'] },
    { id: 'nasir-shaheen', name: 'Dr. Nasir Shaheen', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Management Sciences'] },
    { id: 'muhammad-tariq', name: 'Dr. Muhammad Tariq', title: 'Associate Professor', role: 'member', qualifications: ['PhD in Management Sciences'] },
    { id: 'lala-rukh', name: 'Dr. Lala Rukh', title: 'Associate Professor in Finance', role: 'member', qualifications: ['PhD in Management Sciences'] },
    { id: 'badshah-hussain', name: 'Dr. Badshah Hussain', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Management Sciences'] },
    { id: 'jawad-karamat', name: 'Dr. Jawad Karamat', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Management Sciences', 'Gold Medalist'] },
    { id: 'abdul-mateen', name: 'Dr. Abdul Mateen', title: 'Lecturer in Human Resource Management', role: 'member', qualifications: ['PhD in Management Sciences'] },
    { id: 'neelam-akbar-marwat', name: 'Dr. Neelam Akbar Marwat', title: 'Lecturer in Marketing', role: 'member' },
    { id: 'khursheed-ahmad', name: 'Mr. Khursheed Ahmad', title: 'Lecturer in Finance', role: 'member', qualifications: ['PhD in progress'] },
    { id: 'mohammad-sohail', name: 'Dr. Mohammad Sohail', title: 'Lecturer in Finance', role: 'member' },
    { id: 'sangeen-khan', name: 'Dr. Sangeen Khan', title: 'Lecturer in Human Resource', role: 'member' },
  ],
}

export const bbaHons: DisciplineProfile = {
  slug: BBA,
  department: SLUG,
  status: 'draft',
  name: 'Bachelor of Business Administration (Hons)',
  shortName: 'BBA',
  badge: 'BBA (Hons)',
  level: 'BBA',
  curriculumLede:
    'This study plan is illustrative: the department links its real BBA (Hons) course contents on the university’s site. Elective courses are chosen from the tracks below.',
  tagline: 'Learn to run, grow and start a business.',
  summary: 'Management, accounting, finance, marketing, human resources and entrepreneurship, with internships and industry trips.',
  ...pictures(BBA, ART, 'BBA (Hons). Department of Management and Commerce, University of Swat.', 'Illustration for BBA (Hons)'),
  about: [
    'The BBA (Hons) is a practice-oriented degree in business administration. It covers the core of management, accounting, finance, marketing and human resources, with an emphasis on digital skills and entrepreneurship.',
    'Students take internships and industry trips, work on market-oriented projects and finish with a final-year project.',
  ],
  whyStudy: [
    { icon: 'briefcase', title: 'Learn by practice', text: 'Internships, industry trips and market-oriented projects.' },
    { icon: 'layers', title: 'A full business toolkit', text: 'Accounting, finance, marketing and human resources.' },
    { icon: 'rocket', title: 'Start your own', text: 'The department aims to create owner-managers and entrepreneurs.' },
    { icon: 'cap', title: 'A route to MBA and MS', text: 'The department lists MBA, EMBA, MS and PhD programmes.' },
  ],
  outcomes: [
    'Explain the core concepts of management, accounting, finance, marketing and human resources.',
    'Analyze a business case and recommend a course of action.',
    'Use digital and analytical tools in business decisions.',
    'Prepare a simple business plan.',
    'Work in a team and present clearly.',
  ],
  years: [
    year(1, ['Introduction to Business', 'Principles of Management', 'Financial Accounting', 'Functional English', 'Islamic Studies'], ['Principles of Marketing', 'Business Mathematics', 'Microeconomics', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Organizational Behavior', 'Cost Accounting', 'Business Statistics', 'Macroeconomics', 'Computer Applications'], ['Human Resource Management', 'Business Communication', 'Corporate Finance', 'Consumer Behavior', 'Business Law']),
    year(3, ['Operations Management', 'Entrepreneurship', 'Business Research Methods', 'Management Information Systems', 'Elective I'], ['Strategic Management', 'Digital Marketing', 'Financial Management', 'Elective II', 'Internship']),
    year(4, ['Business Ethics', 'Elective III', 'Elective IV', 'Final Project I'], ['International Business', 'Elective V', 'Seminar', 'Final Project II']),
  ],
  tracks: [
    { icon: 'chart', title: 'Accounting and finance', text: 'Reporting, banking and investment.' },
    { icon: 'globe', title: 'Marketing and digital', text: 'Customers, brands and online selling.' },
    { icon: 'users', title: 'Human resource management', text: 'Hiring, training and leading people.' },
    { icon: 'rocket', title: 'Entrepreneurship', text: 'Starting and growing a venture.' },
  ],
  skills: [
    { group: 'Business', items: ['Financial statements', 'Budgeting', 'Marketing planning', 'Negotiation'] },
    { group: 'Analysis', items: ['Spreadsheet modelling', 'Business statistics', 'Case analysis'] },
    { group: 'Professional', items: ['Business writing', 'Presenting', 'Teamwork', 'Ethics'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Manager or executive', text: 'Firms across trade, services and industry.' },
    { icon: 'chart', title: 'Accountant or finance officer', text: 'Banks, firms and public bodies.' },
    { icon: 'rocket', title: 'Entrepreneur', text: 'Starting and running a business.' },
    { icon: 'users', title: 'Human resource officer', text: 'Recruitment, training and staff welfare.' },
    { icon: 'globe', title: 'Marketing professional', text: 'Brands, sales and digital marketing.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'The department has not published an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    { q: 'How long is the programme?', a: 'The BBA (Hons) is planned over four years, in eight semesters. This plan is a draft; the department confirms the approved scheme of studies for each intake.' },
    { q: 'Is there a final-year project?', a: 'Yes. In the last two semesters each student carries out a final project with a supervisor and presents it to the department.' },
    { q: 'Where can I read the admission rules?', a: 'The admissions portal opens when an intake is announced, and merit lists are published on the university notices page.' },
  ],
}
