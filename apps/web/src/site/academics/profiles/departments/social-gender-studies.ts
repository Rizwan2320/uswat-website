import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Social and Gender Studies, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the introduction, the four degrees
   (BS Sociology, BS Criminology, MPhil Sociology, PhD Sociology), the vision, the mission, the three objectives, the eligibility statement (HEC policies from
   Fall 2024), the five named staff and the mailbox and address.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plans) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-social-and-gender-studies/'
export const SLUG = 'social-and-gender-studies'
export const SOC = 'bs-sociology'
// The old address list has no programme page for Criminology; this slug is new.
export const CRIM = 'bs-criminology'

const ELIGIBILITY = 'As set by the HEC Undergraduate Education Policy 2023, from Fall 2024.'

export const socialGender: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Social and Gender Studies',
  tagline: 'Understanding the social world, from classic theory to new ideas.',
  intro: 'A multidisciplinary approach to the social sciences, with BS Sociology, BS Criminology, an MPhil and a PhD in Sociology.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Social and Gender Studies. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Social and Gender Studies'),
  levelText: 'BS to PhD',
  programmesLede: 'The department lists BS Sociology, BS Criminology, the MPhil in Sociology and the PhD in Sociology. The two BS degrees have pages of their own here.',
  about: [
    'The Department of Social and Gender Studies takes a multidisciplinary approach to the social sciences, from orthodox sociological theory to heterodox sociological concepts. It says this gives students an environment in which their natural potential is recognised and unleashed.',
    'The page says the department does not focus only on conventional methods of learning, but helps students learn the way they are interested in. Students are equipped to contribute to local and global development and to narrow the gap between their actual and potential understanding of the social world.',
  ],
  vision: 'To help students understand the social world more practically, in a positive and better way.',
  mission: 'To contribute to society at local and international level, with greater devotion to humanity, belief, peace and harmony.',
  highlights: [
    { icon: 'users', title: 'Four degrees', text: 'BS Sociology, BS Criminology, MPhil Sociology and PhD Sociology.' },
    { icon: 'book', title: 'Theory old and new', text: 'From orthodox to heterodox sociological concepts.' },
    { icon: 'search', title: 'Learning your way', text: 'The page says teaching follows students’ own interests.' },
    { icon: 'globe', title: 'Local and global', text: 'Students are prepared to contribute to development at both levels.' },
    { icon: 'shield', title: 'Crime and society', text: 'The In-charge’s PhD is in the sociology of crime.' },
    { icon: 'trophy', title: 'Gold medallists', text: 'Two named staff are noted as gold medallists.' },
  ],
  disciplines: [SOC, CRIM],
  labs: [
    { title: 'Survey and data laboratory', text: 'Designing questionnaires and analysing responses.', art: officeHero(SLUG), tools: ['Statistics software', 'Survey tablets', 'Coding sheets'] },
    { title: 'Field research kit', text: 'Interviews, observation and community mapping.', art: officeHero(SOC), tools: ['Recorders', 'Field notebooks', 'Consent forms'] },
    { title: 'Criminology workroom', text: 'Case studies of crime, policing and justice.', art: officeHero(CRIM), tools: ['Case files', 'Crime statistics', 'Mapping software'] },
    { title: 'Seminar room', text: 'Talks and student presentations.', art: officeHero(SLUG), tools: ['Projector', 'Whiteboards', 'Seating for a seminar'] },
  ],
  research: [
    { icon: 'users', title: 'Social structure and change', text: 'Family, class, community and change.', tags: ['Family', 'Community', 'Change'] },
    { icon: 'shield', title: 'Crime and deviance', text: 'Causes of crime and responses to it.', tags: ['Crime', 'Policing', 'Justice'] },
    { icon: 'globe', title: 'Gender and society', text: 'Gender roles and inequality.', tags: ['Gender', 'Inequality', 'Work'] },
    { icon: 'chart', title: 'Development', text: 'Poverty, education and social programmes.', tags: ['Poverty', 'Education', 'Programmes'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Social researcher', text: 'Research organisations and surveys.' },
    { icon: 'users', title: 'Development worker', text: 'NGOs and public programmes.' },
    { icon: 'shield', title: 'Criminal justice', text: 'Police, prisons and probation services.' },
    { icon: 'briefcase', title: 'Public administration', text: 'Government posts and competitive examinations.' },
    { icon: 'book', title: 'Social work', text: 'Community and welfare organisations.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Sociology society', text: 'Student-run talks and film nights.' },
    { icon: 'globe', title: 'Community fieldwork', text: 'Visits to villages and institutions.' },
    { icon: 'search', title: 'Research showcase', text: 'A yearly day for student research.' },
    { icon: 'trophy', title: 'Debates', text: 'Debates on social questions.' },
  ],
  faq: [
    { q: 'Which degrees does the department list?', a: 'BS Sociology, BS Criminology, the Master of Philosophy in Sociology and the PhD in Sociology.' },
    { q: 'What are the eligibility rules?', a: 'The page says the department follows the eligibility criteria from Fall 2024 set by the HEC Undergraduate Education Policy 2023 and Graduate Education Policy 2023.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Ihsan Ullah Khan, Assistant Professor in Sociology, as In-charge.' },
    { q: 'How do I contact the department?', a: 'The page gives the mailbox deptsgs@uswat.edu.pk and the address Academic Block-B, University of Swat.' },
  ],
  peopleTitle: 'In-charge and faculty',
  peopleLede: 'The five staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['dowry-and-marriage-choices-in-a-valley-town', 'why-young-men-leave-for-the-gulf', 'a-village-view-of-theft-and-trust'],
  reference: {
    sources: [{ label: 'Department of Social and Gender Studies page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    emails: ['deptsgs@uswat.edu.pk'],
    openPoints: [
      'The page does not state a rule of its own for eligibility; it points to the HEC policies (UEP-2023 and GEP-2023) in force from Fall 2024.',
      'The page lists its degree programmes twice and gives no phone number, fees or intake dates.',
      'Despite its name, the page names no gender-studies degree; the four degrees are in sociology and criminology.',
      'The page gives no scheme of studies; the study plans on the programme pages are illustrative.',
      'The old address list has no programme page for Criminology; its page is new.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    {
      id: 'ihsan-ullah-khan',
      name: 'Dr. Ihsan Ullah Khan',
      title: 'Assistant Professor in Sociology',
      role: 'head',
      roleLabel: 'In-charge',
      qualifications: ['PhD in Sociology (Sociology of Crime), University of Peshawar'],
    },
    { id: 'sheraz-ali', name: 'Dr. Sheraz Ali', title: 'Assistant Professor in Sociology', role: 'member', qualifications: ['PhD in Sociology, University of Malakand'] },
    { id: 'imran', name: 'Dr. Imran', title: 'Assistant Professor in Sociology', role: 'member', qualifications: ['PhD in Sociology, University of Peshawar', 'Gold Medalist'] },
    { id: 'abdullah', name: 'Dr. Abdullah', title: 'Assistant Professor in Social Work', role: 'member', qualifications: ['PhD in Social Work, University of Peshawar'] },
    {
      id: 'muhammad-asghar-khan',
      name: 'Dr. Muhammad Asghar Khan',
      title: 'Assistant Professor in Sociology',
      role: 'member',
      qualifications: ['PhD in Sociology, University of Malakand', 'Gold Medalist'],
    },
  ],
}

export const bsSociology: DisciplineProfile = {
  slug: SOC,
  department: SLUG,
  status: 'draft',
  name: 'BS Sociology',
  shortName: 'Sociology',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department’s page gives no scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'See how society works, and how it changes.',
  summary: 'Sociological theory, research methods and social problems over four years, with a research thesis.',
  ...pictures(SOC, SLUG, 'BS Sociology. Department of Social and Gender Studies, University of Swat.', 'Illustration for BS Sociology'),
  about: [
    'BS Sociology trains students to understand the social world and social problems through a multidisciplinary approach, from classical to newer sociological ideas.',
    'The department aims to train socially active and productive citizens and to help students meet their academic and professional goals.',
  ],
  whyStudy: [
    { icon: 'users', title: 'Understand people', text: 'Families, communities and institutions.' },
    { icon: 'search', title: 'Learn to research', text: 'Surveys, interviews and field work.' },
    { icon: 'globe', title: 'Local and global', text: 'Prepared to contribute to development.' },
    { icon: 'briefcase', title: 'Varied careers', text: 'Research, development, public service and teaching.' },
  ],
  outcomes: [
    'Explain the main sociological theories and apply them to social problems.',
    'Design a survey or interview study and analyse the results.',
    'Describe how family, class, gender and community shape life.',
    'Discuss local and global development processes.',
    'Write a clear research report.',
    'Act as a socially active and productive citizen.',
  ],
  years: [
    year(1, ['Introduction to Sociology', 'Functional English', 'Islamic Studies', 'Computer Skills', 'Introduction to Psychology'], ['Social Problems', 'Expository Writing', 'Pakistan Studies', 'Introduction to Anthropology', 'Introduction to Political Science']),
    year(2, ['Classical Sociological Theory', 'Research Methods I', 'Rural Sociology', 'Sociology of Family', 'Statistics'], ['Contemporary Sociological Theory', 'Research Methods II', 'Urban Sociology', 'Gender and Society', 'Social Stratification']),
    year(3, ['Sociology of Development', 'Social Psychology', 'Sociology of Religion', 'Demography', 'Qualitative Methods'], ['Sociology of Education', 'Social Change', 'Social Work', 'Elective I', 'Scientific Writing']),
    year(4, ['Elective II', 'Elective III', 'Sociology of Health', 'Thesis I'], ['Elective IV', 'Seminar', 'Internship', 'Thesis II']),
  ],
  tracks: [
    { icon: 'users', title: 'Social theory', text: 'Classical and contemporary ideas.' },
    { icon: 'globe', title: 'Development and change', text: 'Rural, urban and global change.' },
    { icon: 'book', title: 'Gender and family', text: 'Gender roles and family life.' },
    { icon: 'chart', title: 'Research methods', text: 'Quantitative and qualitative methods.' },
  ],
  skills: [
    { group: 'Research', items: ['Survey design', 'Interviewing', 'Data analysis', 'Report writing'] },
    { group: 'Analysis', items: ['Applying theory', 'Critical reading', 'Argument writing'] },
    { group: 'Professional', items: ['Presenting', 'Community engagement', 'Teamwork'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'flask', title: 'Social researcher', text: 'Research organisations.' },
    { icon: 'users', title: 'Development worker', text: 'NGOs and public programmes.' },
    { icon: 'briefcase', title: 'Public administration', text: 'Government posts.' },
    { icon: 'book', title: 'Social work', text: 'Welfare organisations.' },
  ],
  faq: [{ q: 'What are the eligibility rules?', a: ELIGIBILITY }, ...scienceFaq('Sociology', 4)],
}

export const bsCriminology: DisciplineProfile = {
  slug: CRIM,
  department: SLUG,
  status: 'draft',
  name: 'BS Criminology',
  shortName: 'Criminology',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department’s page gives no scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Why crime happens, and what to do about it.',
  summary: 'The causes of crime, policing, courts and corrections over four years, with a research thesis.',
  ...pictures(CRIM, SLUG, 'BS Criminology. Department of Social and Gender Studies, University of Swat.', 'Illustration for BS Criminology'),
  about: [
    'BS Criminology is listed on the department’s page beside BS Sociology. It studies crime, deviance and the criminal justice system with the tools of sociology.',
    'Students learn to study crime with evidence, to weigh responses to it, and to see its place in society.',
  ],
  whyStudy: [
    { icon: 'shield', title: 'Crime and society', text: 'The department’s In-charge specialised in the sociology of crime.' },
    { icon: 'search', title: 'Evidence first', text: 'Research methods are central.' },
    { icon: 'users', title: 'Justice in context', text: 'Courts, police and communities.' },
    { icon: 'briefcase', title: 'Public-service careers', text: 'Justice, security and policy roles.' },
  ],
  outcomes: [
    'Explain the main theories of crime and deviance.',
    'Describe how police, courts and corrections work.',
    'Read and use crime data.',
    'Design and run a small study of crime in a community.',
    'Discuss ethics and rights in criminal justice.',
    'Write a clear research report.',
  ],
  years: [
    year(1, ['Introduction to Criminology', 'Introduction to Sociology', 'Functional English', 'Islamic Studies', 'Computer Skills'], ['Criminal Justice System', 'Social Problems', 'Expository Writing', 'Pakistan Studies', 'Introduction to Psychology']),
    year(2, ['Theories of Crime', 'Research Methods I', 'Criminal Law', 'Policing', 'Statistics'], ['Juvenile Delinquency', 'Research Methods II', 'Law of Evidence', 'Courts and Procedure', 'Victimology']),
    year(3, ['Corrections and Punishment', 'Forensic Psychology', 'Cybercrime', 'Crime Analysis', 'Qualitative Methods'], ['Organised and White-collar Crime', 'Crime Prevention', 'Human Rights', 'Elective I', 'Scientific Writing']),
    year(4, ['Elective II', 'Elective III', 'Comparative Criminal Justice', 'Thesis I'], ['Elective IV', 'Seminar', 'Internship', 'Thesis II']),
  ],
  tracks: [
    { icon: 'shield', title: 'Theory of crime', text: 'Causes and explanations.' },
    { icon: 'briefcase', title: 'Justice system', text: 'Police, courts and corrections.' },
    { icon: 'search', title: 'Crime analysis', text: 'Data, mapping and prevention.' },
    { icon: 'users', title: 'Rights and victims', text: 'Human rights and victim support.' },
  ],
  skills: [
    { group: 'Analytical', items: ['Crime data reading', 'Case analysis', 'Mapping', 'Report writing'] },
    { group: 'Research', items: ['Survey design', 'Interviewing', 'Ethics in research'] },
    { group: 'Professional', items: ['Presenting', 'Teamwork', 'Reasoned argument'] },
  ],
  careers: [
    { icon: 'shield', title: 'Criminal justice', text: 'Police, prisons and probation.' },
    { icon: 'briefcase', title: 'Public administration', text: 'Government and security posts.' },
    { icon: 'flask', title: 'Researcher', text: 'Crime and policy research.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'users', title: 'Victim and community support', text: 'NGOs and welfare bodies.' },
  ],
  faq: [{ q: 'What are the eligibility rules?', a: ELIGIBILITY }, ...scienceFaq('Criminology', 4)],
}
