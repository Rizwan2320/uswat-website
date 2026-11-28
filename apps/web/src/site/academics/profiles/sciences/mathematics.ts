import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'

import { pictures, scienceFaq } from './core'

/* Department of Mathematics and Statistics, laid out like the DCST department page.
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction, the mission, the professional opportunities,
   the programmes (BS Mathematics, BS Statistics, MPhil Mathematics, PhD Mathematics), the scheme of studies 2024 link, and nine named staff with
   titles and qualifications. The page has no vision statement; the sentence under "vision" is taken from its introduction.
   EVERYTHING ELSE (highlights, laboratories, research areas, student life, questions and the study plans) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-mathematics-and-statistics/'
export const SLUG = 'mathematics-and-statistics'
export const BS_MATH = 'bs-mathematics-2'
export const BS_STAT = 'bs-statistics'

export const mathematics: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Mathematics and Statistics',
  tagline: 'Reasoning with numbers, and deciding well from data.',
  intro: 'BS degrees in Mathematics and in Statistics, with MPhil and PhD study in Mathematics, from a department that has taught since 2010.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Mathematics and Statistics. University of Swat. Numbers, proof and data.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Mathematics and Statistics'),
  levelText: 'BS, MPhil and PhD',
  programmesLede: 'The department’s page lists BS Mathematics, BS Statistics, MPhil Mathematics and PhD Mathematics; the two BS programmes have pages here.',
  about: [
    'In today’s world we face situations every day where statistics can be applied. Statistics can be used to work out the likely outcome of thousands of things that the human mind alone could not.',
    'The department of statistics started working in 2010, with the establishment of the University of Swat. It is committed to training students to meet the demand for careers in teaching and in other government and public sector organisations.',
    'Recent advances in computer technology have opened more employment prospects for statisticians. Medical research, agricultural research, industry and education all need them, and the four-year BS programme can accommodate a student’s interest in both theoretical and applied areas.',
  ],
  vision:
    'To train students to meet the demand for careers in teaching and in other government and public sector organisations, with mathematical and statistical skills that serve the country.',
  mission:
    'The department promotes advanced learning methods and works to build creative thinking in students, so that they can make effective decisions by applying statistical methods. The use of modern statistical software has made the science of statistics more accurate.',
  highlights: [
    { icon: 'chart', title: 'Theory and application', text: 'Pure mathematics, applied mathematics and statistics are taught side by side, so students see where the ideas are used.' },
    { icon: 'layers', title: 'Proof and reasoning', text: 'Analysis, algebra and geometry courses teach students to build and check an argument.' },
    { icon: 'database', title: 'Statistical software', text: 'Students analyse real data in R and Python and learn to present the findings.' },
    { icon: 'brain', title: 'Modelling real problems', text: 'Courses turn questions about populations, markets or physical systems into models that can be solved.' },
    { icon: 'rocket', title: 'A final-year project', text: 'Each student carries out a small study with a supervisor and presents it to the department.' },
    { icon: 'cap', title: 'Paths to further study', text: 'The BS prepares graduates for MPhil and PhD study in mathematics or statistics.' },
  ],
  disciplines: [BS_MATH, BS_STAT],
  labs: [
    {
      title: 'Statistical computing laboratory',
      text: 'Workstations for data analysis, simulation and the course projects.',
      art: officeHero(SLUG),
      tools: ['R and Python', 'Spreadsheet tools', 'Shared workstations'],
    },
    {
      title: 'Mathematical software room',
      text: 'Symbolic and numerical software for calculus, algebra and differential equations.',
      art: officeHero(BS_MATH),
      tools: ['Symbolic algebra system', 'Numerical libraries', 'Plotting tools'],
    },
    {
      title: 'Survey and data collection practice room',
      text: 'Students design a questionnaire, collect a small sample and analyse it.',
      art: officeHero(BS_STAT),
      tools: ['Survey design templates', 'Data-entry stations', 'Sampling exercises'],
    },
  ],
  research: [
    { icon: 'chart', title: 'Applied and computational mathematics', text: 'Models and numerical methods for equations that cannot be solved by hand.', tags: ['Differential equations', 'Numerical methods', 'Modelling'] },
    { icon: 'layers', title: 'Algebra, analysis and geometry', text: 'Structures and proofs that later work depends on.', tags: ['Algebra', 'Analysis', 'Geometry'] },
    { icon: 'database', title: 'Statistics and data analysis', text: 'Estimation and testing for medical, agricultural and social data.', tags: ['Inference', 'Regression', 'Sampling'] },
    { icon: 'search', title: 'Probability and decision-making', text: 'Chance and risk in insurance, health and planning.', tags: ['Probability', 'Risk', 'Decision theory'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'chart', title: 'Statistician', text: 'Medical and agricultural research, industry and government.' },
    { icon: 'database', title: 'Data analyst', text: 'Companies and public bodies that work with data.' },
    { icon: 'briefcase', title: 'Planning and survey officer', text: 'Statistics bureaus, planning departments and development projects.' },
    { icon: 'shield', title: 'Actuarial or risk analyst', text: 'Insurance, banking and public finance.' },
    { icon: 'search', title: 'Researcher', text: 'MPhil and PhD study, then research posts.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Mathematics society', text: 'Problem nights, puzzle contests and peer tutoring for first-year students.' },
    { icon: 'book', title: 'Study circles', text: 'Peer groups for calculus, algebra and probability.' },
    { icon: 'spark', title: 'Seminars', text: 'Talks by visiting mathematicians and statisticians on current work and careers.' },
    { icon: 'trophy', title: 'Mathematics day', text: 'Students present models and games to schools in the district.' },
  ],
  faq: [
    { q: 'Which programmes does the department list?', a: 'BS Mathematics, BS Statistics, MPhil Mathematics and PhD Mathematics. The page also links a Scheme of Studies 2024.' },
    { q: 'How long is the BS?', a: 'The department’s page describes it as a four-year programme.' },
    { q: 'What do I need to apply?', a: 'The page does not state an eligibility. The admissions portal opens when an intake is announced, and the criteria are announced with it.' },
    { q: 'Who leads the department?', a: 'The department’s page names Dr. Faiz Muhammad Khan, Associate Professor and Chairman.' },
    { q: 'Where can I find the latest notices?', a: 'Merit lists, timetables and announcements are published on the university notices page.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The nine staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['numerical-solution-of-heat-flow', 'household-income-survey-swat', 'rainfall-trend-analysis-swat'],
  team: [
    {
      id: 'faiz-muhammad-khan',
      name: 'Dr. Faiz Muhammad Khan',
      title: 'Associate Professor and Chairman',
      role: 'head',
      roleLabel: 'Chairman',
      qualifications: ['Post-doctorate in Mathematics'],
    },
    {
      id: 'ghaus-ur-rahman',
      name: 'Dr. Ghaus ur Rahman',
      title: 'Associate Professor of Mathematics',
      role: 'member',
      qualifications: ['Post-doctorate, University of Oslo, Norway', 'PhD in Mathematics, Abdus Salam School, GCU', 'M.Sc. in Mathematics, gold medallist'],
    },
    { id: 'amir-khan', name: 'Dr. Amir Khan', title: 'Assistant Professor of Mathematics', role: 'member' },
    { id: 'iftikhar-ahmed', name: 'Dr. Iftikhar Ahmed', title: 'Assistant Professor of Mathematics', role: 'member' },
    { id: 'gohar-ayub', name: 'Dr. Gohar Ayub', title: 'Assistant Professor of Statistics', role: 'member' },
    { id: 'amjad-ali', name: 'Dr. Amjad Ali', title: 'Assistant Professor of Mathematics', role: 'member', qualifications: ['Gold medallist'] },
    { id: 'mahrukh-anum', name: 'Dr. Mahrukh Anum', title: 'Lecturer in Statistics', role: 'member' },
    { id: 'asaf-khan', name: 'Dr. Asaf Khan', title: 'Lecturer in Mathematics', role: 'member', qualifications: ['Gold medallist'] },
    { id: 'imran-ullah', name: 'Mr. Imran Ullah', title: 'Lecturer in Statistics', role: 'member' },
  ],
  reference: {
    sources: [{ label: 'Department of Mathematics and Statistics page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page has no vision statement; the vision line is taken from its introduction. It gives no eligibility, seat numbers, fees or intake dates, and no telephone number or department e-mail. Staff e-mail addresses on the page are not shown here.',
      'The page lists BS Mathematics, BS Statistics, MPhil Mathematics and PhD Mathematics. The old site has an empty page for BS Mathematics and none for BS Statistics, so both programme pages here are illustrative apart from their names.',
      'The page says the statistics department started working in 2010 with the university; it does not give a founding date for mathematics.',
      'The Scheme of Studies 2024 is a document link on the old page; its contents are not copied here, so the study plans shown are illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
}

export const bsMathematics: DisciplineProfile = {
  slug: BS_MATH,
  department: SLUG,
  status: 'draft',
  name: 'BS Mathematics',
  shortName: 'Mathematics',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Learn to reason precisely, and to model the world with equations.',
  summary: 'Calculus, algebra, analysis, differential equations and applied mathematics over four years.',
  ...pictures(BS_MATH, SLUG, 'BS Mathematics. Department of Mathematics and Statistics, University of Swat.', 'Illustration for BS Mathematics'),
  about: [
    'BS Mathematics builds from calculus and linear algebra to real and complex analysis, abstract algebra, differential equations and numerical methods. Pure and applied courses are taught together.',
    'Students learn to read and write proofs, to model a problem and to use software for the calculations. In the last year they choose electives and carry out a project with a supervisor.',
  ],
  whyStudy: [
    { icon: 'layers', title: 'A way of thinking', text: 'Proof-based courses train students to build and test an argument.' },
    { icon: 'chart', title: 'Useful everywhere', text: 'Modelling and calculation are used in science, finance, engineering and data work.' },
    { icon: 'database', title: 'Software skills', text: 'Students use computer algebra and numerical libraries throughout.' },
    { icon: 'cap', title: 'A route to MPhil and PhD', text: 'The department lists MPhil and PhD Mathematics for graduates who want to continue.' },
  ],
  outcomes: [
    'Understand and write mathematical proofs in analysis and algebra.',
    'Solve ordinary and partial differential equations by analytical and numerical methods.',
    'Build and test a mathematical model of a real problem.',
    'Use mathematical software for calculation and visualisation.',
    'Explain mathematical ideas clearly in writing and in a short talk.',
  ],
  years: [
    year(1, ['Calculus I', 'Algebra and Trigonometry', 'Introduction to Mathematical Thinking', 'Functional English', 'Islamic Studies'], ['Calculus II', 'Linear Algebra I', 'Analytical Geometry', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Multivariable Calculus', 'Real Analysis I', 'Linear Algebra II', 'Probability Theory', 'Computer Skills'], ['Ordinary Differential Equations', 'Real Analysis II', 'Abstract Algebra I', 'Mathematical Statistics', 'Programming for Mathematics']),
    year(3, ['Complex Analysis', 'Abstract Algebra II', 'Partial Differential Equations', 'Numerical Analysis I', 'Mechanics'], ['Topology', 'Numerical Analysis II', 'Mathematical Modelling', 'Optimisation', 'Research Methods']),
    year(4, ['Functional Analysis', 'Elective I', 'Elective II', 'Project I'], ['Elective III', 'Number Theory', 'Seminar', 'Project II']),
  ],
  tracks: [
    { icon: 'layers', title: 'Pure mathematics', text: 'Analysis, algebra and topology, and the proofs that join them.' },
    { icon: 'chart', title: 'Applied and computational mathematics', text: 'Differential equations, numerical methods and modelling.' },
    { icon: 'brain', title: 'Optimisation and decision-making', text: 'Linear programming and the mathematics of choosing well.' },
    { icon: 'database', title: 'Mathematics for data', text: 'Probability and linear algebra for statistics and machine learning.' },
  ],
  skills: [
    { group: 'Mathematical', items: ['Proof writing', 'Modelling', 'Differential equations', 'Numerical methods'] },
    { group: 'Computing', items: ['Computer algebra', 'Python', 'Plotting'] },
    { group: 'Professional', items: ['Technical writing', 'Presenting', 'Problem solving', 'Teamwork'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'chart', title: 'Quantitative analyst', text: 'Banking, insurance and public finance.' },
    { icon: 'database', title: 'Data analyst', text: 'Companies and public bodies that work with data.' },
    { icon: 'gear', title: 'Modelling and operations analyst', text: 'Planning, logistics and engineering teams.' },
    { icon: 'search', title: 'Researcher', text: 'MPhil and PhD study, then research posts.' },
  ],
  faq: scienceFaq('Mathematics', 4),
}

export const bsStatistics: DisciplineProfile = {
  slug: BS_STAT,
  department: SLUG,
  status: 'draft',
  name: 'BS Statistics',
  shortName: 'Statistics',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Collect data, find the pattern and decide well.',
  summary: 'Probability, inference, regression and data analysis with statistical software, over four years.',
  ...pictures(BS_STAT, SLUG, 'BS Statistics. Department of Mathematics and Statistics, University of Swat.', 'Illustration for BS Statistics'),
  about: [
    'BS Statistics teaches how to collect data, describe it, and draw sound conclusions from it. It covers probability, estimation, hypothesis testing, regression, sampling and experimental design.',
    'Students use statistical software throughout, and in the last year carry out a small study of their own with a supervisor.',
  ],
  whyStudy: [
    { icon: 'database', title: 'Real data from the start', text: 'Courses use data from health, agriculture, education and the local economy.' },
    { icon: 'chart', title: 'Decisions that hold up', text: 'Students learn to say how sure a conclusion is, and when not to trust it.' },
    { icon: 'briefcase', title: 'Wide demand', text: 'Medical and agricultural research, industry and government all employ statisticians.' },
    { icon: 'cap', title: 'Room to specialise', text: 'Electives lead toward biostatistics, survey methods or data science.' },
  ],
  outcomes: [
    'Describe and summarise data, and choose a suitable probability model.',
    'Carry out estimation and hypothesis tests and interpret the results.',
    'Design a survey or an experiment and analyse the data it gives.',
    'Fit and check regression models.',
    'Use statistical software to analyse data and present the findings.',
  ],
  years: [
    year(1, ['Introduction to Statistics', 'Calculus I', 'Computer Applications', 'Functional English', 'Islamic Studies'], ['Probability I', 'Calculus II', 'Linear Algebra', 'Expository Writing', 'Pakistan Studies']),
    year(2, ['Probability II', 'Statistical Inference I', 'Sampling Techniques I', 'Statistical Computing with R', 'Economics'], ['Statistical Inference II', 'Regression Analysis I', 'Sampling Techniques II', 'Demography', 'Data Management']),
    year(3, ['Regression Analysis II', 'Design of Experiments', 'Multivariate Analysis', 'Time Series I', 'Biostatistics'], ['Time Series II', 'Categorical Data Analysis', 'Quality Control', 'Official Statistics', 'Research Methods']),
    year(4, ['Statistical Learning', 'Elective I', 'Elective II', 'Project I'], ['Elective III', 'Survey Practice', 'Seminar', 'Project II']),
  ],
  tracks: [
    { icon: 'shield', title: 'Biostatistics', text: 'Health and clinical data, trials and survival.' },
    { icon: 'search', title: 'Survey methods and official statistics', text: 'Sampling, questionnaires and the statistics governments publish.' },
    { icon: 'database', title: 'Data science', text: 'Prediction and learning from larger data sets.' },
    { icon: 'chart', title: 'Quality and time series', text: 'Control charts, forecasting and trends over time.' },
  ],
  skills: [
    { group: 'Statistical', items: ['Estimation and testing', 'Regression', 'Sampling design', 'Forecasting'] },
    { group: 'Computing', items: ['R', 'Python', 'Spreadsheets', 'Data cleaning'] },
    { group: 'Professional', items: ['Report writing', 'Presenting results', 'Ethics in data use', 'Teamwork'] },
  ],
  careers: [
    { icon: 'chart', title: 'Statistician', text: 'Medical and agricultural research, industry and government.' },
    { icon: 'database', title: 'Data analyst', text: 'Companies and public bodies that work with data.' },
    { icon: 'briefcase', title: 'Survey and planning officer', text: 'Statistics bureaus and development projects.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'search', title: 'Researcher', text: 'MS and PhD study, then research posts.' },
  ],
  faq: scienceFaq('Statistics', 4),
}
