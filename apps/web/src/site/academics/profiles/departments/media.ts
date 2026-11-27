import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Media and Communication Studies, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the introduction on journalism education,
   the aim of the degrees, the mission, the four commitments, the BS and MS descriptions, the BS eligibility, the MS eligibility and entry-test rule, the five
   named staff and the mailbox and address.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-media-and-communication-studies/'
export const SLUG = 'media-and-communication-studies'
// The old address list names this programme "bs-journalism-and-mass-communication-2"; the department page calls the degree BS Media and Communication Studies.
export const BS = 'bs-journalism-and-mass-communication-2'

const ELIGIBILITY = 'HSSC or equivalent with at least 45% marks.'

export const media: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Media and Communication Studies',
  tagline: 'Journalists and communicators for print, broadcast and online media.',
  intro: 'Hands-on, multi-platform journalism and communication education, with a BS and an MS in Media and Communication Studies.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Media and Communication Studies. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Media and Communication Studies'),
  levelText: 'BS to MS',
  programmesLede: 'The department lists a four-year BS and an MS in Media and Communication Studies. The BS has a page of its own here.',
  about: [
    'The department’s page starts from the point that journalism is changing fast: the lines between print, broadcast and online are fading, and reporters must now produce stories for every platform. Universities worldwide are moving from theory to hands-on, skills-based classes and to a single multi-platform major.',
    'The Department of Media and Communication Studies has designed degree programmes to give students advanced theory and practical skills, with critical thinking, media literacy, storytelling and research, so that graduates can work in the media industry, digital communication, public relations and journalism.',
    'The page says the department’s curricular standards were developed by subject experts from across the country. It lists the BS (four years) and the MS, structured under the HEC Graduate Education Policy 2023.',
  ],
  vision: 'To provide the best possible quality education in journalism and mass communication in the country.',
  mission:
    'To serve the country by producing qualified and skilled journalists and scholars who can meet the market demand: keeping advanced standards of excellence in media studies, competing with journalism programmes at national and international level, assessing current trends and meeting the challenges ahead, and passing the value and benefits of journalism education to students, academia and the field.',
  highlights: [
    { icon: 'rocket', title: 'Multi-platform skills', text: 'Print, broadcast and online work are learned together.' },
    { icon: 'search', title: 'Hands-on learning', text: 'The page says the curriculum is skills-based, with theory and practicals.' },
    { icon: 'users', title: 'A station manager on staff', text: 'One staff member is named as Lecturer, Station Manager and PRO.' },
    { icon: 'cap', title: 'BS and MS', text: 'A four-year BS and an MS under the HEC Graduate Education Policy 2023.' },
    { icon: 'book', title: 'Ethical journalism', text: 'The aim is well-trained, ethical and responsible journalists.' },
    { icon: 'globe', title: 'National standards', text: 'The standards were developed by subject experts from across the country.' },
  ],
  disciplines: [BS],
  labs: [
    { title: 'Broadcast studio', text: 'Practice in audio production; the page names a Station Manager among the staff.', art: officeHero(SLUG), tools: ['Microphones', 'Mixing desk', 'Recording software'] },
    { title: 'Newsroom', text: 'A working newsroom for reporting and editing.', art: officeHero(BS), tools: ['Editing computers', 'Style guide', 'Story planning wall'] },
    { title: 'Video and photo studio', text: 'Shooting and editing for broadcast and online.', art: officeHero(SLUG), tools: ['Cameras', 'Lighting', 'Editing software'] },
    { title: 'Media research room', text: 'Surveys and content analysis with a supervisor.', art: officeHero(BS), tools: ['Statistics software', 'Content coding sheets', 'Archive access'] },
  ],
  research: [
    { icon: 'search', title: 'Journalism and news', text: 'How stories are found, checked and told.', tags: ['Reporting', 'News', 'Ethics'] },
    { icon: 'globe', title: 'Digital and social media', text: 'How audiences use and trust online media.', tags: ['Social media', 'Digital', 'Audiences'] },
    { icon: 'users', title: 'Public relations', text: 'How organisations speak to the public.', tags: ['PR', 'Campaigns', 'Crisis'] },
    { icon: 'book', title: 'Media and society', text: 'Media regulation, literacy and culture.', tags: ['Regulation', 'Literacy', 'Culture'] },
  ],
  careers: [
    { icon: 'search', title: 'Reporter or editor', text: 'Newspapers, television, radio and online outlets.' },
    { icon: 'rocket', title: 'Digital content', text: 'Social media, video and web production.' },
    { icon: 'users', title: 'Public relations', text: 'Organisations, government and NGOs.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'book', title: 'Researcher', text: 'Media research and postgraduate study.' },
    { icon: 'globe', title: 'Development communication', text: 'Campaigns for NGOs and international bodies.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Media society', text: 'Student-run talks and screenings.' },
    { icon: 'rocket', title: 'Student audio shows', text: 'Programmes hosted and produced by students.' },
    { icon: 'search', title: 'Student newsletter', text: 'A newsletter written and edited by students.' },
    { icon: 'globe', title: 'Newsroom visits', text: 'Visits to newspapers and broadcasters.' },
  ],
  faq: [
    { q: 'Which programmes does the department list?', a: 'A four-year BS in Media and Communication Studies and an MS in Media and Communication Studies.' },
    { q: 'What do I need for the BS?', a: ELIGIBILITY },
    { q: 'What do I need for the MS?', a: 'An undergraduate degree of 16 years in media and communication studies or a related area from an HEC-recognised university, with at least second division or a 2.5 CGPA of 4.0; other relevant degrees may be accepted with deficiency courses of up to 9 credit hours. The entry-test pass mark is 50%.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Jamal ud Din, Associate Professor, as Chairman.' },
    { q: 'How do I contact the department?', a: 'The page gives the mailbox mediastudies@uswat.edu.pk and the address Academic Block A, University of Swat.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The five staff named on the department’s page, with the titles it gives.',
  alumni: ['how-a-hill-district-reads-its-local-news', 'a-photo-essay-on-the-vegetable-market', 'whatsapp-groups-and-rumours-in-a-village'],
  reference: {
    sources: [{ label: 'Department of Media and Communication Studies page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    emails: ['mediastudies@uswat.edu.pk'],
    openPoints: [
      'The page says the department “intends to start” the BS “this year” without naming the year, and lists the BS Journalism and the BS Media and Communication Studies under different names; the old address list calls the programme “bs-journalism-and-mass-communication-2”.',
      'Three of the five named staff are marked “on study leave”.',
      'The page gives no phone number, fees or intake dates.',
      'The page links a BS and an MS scheme of studies; the courses are not reproduced here. The study plan on the programme page is illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'jamal-ud-din', name: 'Dr. Jamal ud Din', title: 'Associate Professor', role: 'head', roleLabel: 'Chairman' },
    { id: 'rafi-ullah', name: 'Dr. Rafi Ullah', title: 'Lecturer, Station Manager and PRO', role: 'member' },
    { id: 'khayam-hassan', name: 'Mr. Khayam Hassan', title: 'Lecturer (on study leave)', role: 'member' },
    { id: 'sadia-younus', name: 'Ms. Sadia Younus', title: 'Lecturer (on study leave)', role: 'member' },
    { id: 'khalid-khan', name: 'Mr. Khalid Khan', title: 'Assistant Professor (on study leave)', role: 'member' },
  ],
}

export const bsMedia: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Media and Communication Studies',
  shortName: 'Media and Communication Studies',
  eligibility: ELIGIBILITY,
  curriculumLede:
    'This study plan is illustrative: the department links its real BS scheme of studies on the university’s site. Elective courses are chosen from the tracks below.',
  tagline: 'Tell stories on every platform.',
  summary: 'A four-year BS in journalism and communication: reporting, editing, broadcast, digital media, public relations and research.',
  ...pictures(BS, SLUG, 'BS Media and Communication Studies. Department of Media and Communication Studies, University of Swat.', 'Illustration for BS Media and Communication Studies'),
  about: [
    'The four-year BS aims to produce a cadre of graduates who can meet the challenges of the field. During the four years students are equipped with theory and practicals.',
    'It follows the shift in journalism education from theory-heavy classes to hands-on, multi-platform work, with media literacy, storytelling and research.',
  ],
  whyStudy: [
    { icon: 'rocket', title: 'All platforms', text: 'Print, broadcast and online skills together.' },
    { icon: 'search', title: 'Learn by doing', text: 'Practical classes sit beside theory.' },
    { icon: 'book', title: 'Ethics first', text: 'The aim is ethical and responsible journalists.' },
    { icon: 'cap', title: 'Room to go further', text: 'The department also lists an MS.' },
  ],
  outcomes: [
    'Report, write and edit stories for print, broadcast and online media.',
    'Apply media theory and critical thinking to current events.',
    'Produce audio and video with basic technical skill.',
    'Plan and run a communication campaign.',
    'Work within media ethics and law.',
    'Carry out and report a small media research study.',
  ],
  years: [
    year(1, ['Introduction to Mass Communication', 'Functional English', 'Islamic Studies', 'Computer Skills', 'Introduction to Journalism'], ['News Writing', 'Expository Writing', 'Pakistan Studies', 'Media and Society', 'Photography']),
    year(2, ['Reporting', 'Editing', 'Media Law and Ethics', 'Research Methods', 'Radio Production'], ['Feature Writing', 'Television Production', 'Public Relations', 'Statistics', 'Digital Media']),
    year(3, ['Investigative Reporting', 'Media Theories', 'Advertising', 'Video Editing', 'Development Communication'], ['Multimedia Journalism', 'Media Management', 'Communication Research', 'Elective I', 'Internship']),
    year(4, ['Elective II', 'Elective III', 'Media Criticism', 'Capstone Project I'], ['Elective IV', 'Seminar', 'Portfolio', 'Capstone Project II']),
  ],
  tracks: [
    { icon: 'search', title: 'Print and online journalism', text: 'Reporting and editing.' },
    { icon: 'rocket', title: 'Broadcast', text: 'Radio and television.' },
    { icon: 'users', title: 'Public relations and advertising', text: 'Campaigns and strategy.' },
    { icon: 'globe', title: 'Digital and development communication', text: 'Social media and public campaigns.' },
  ],
  skills: [
    { group: 'Craft', items: ['News writing', 'Interviewing', 'Editing', 'Audio and video production'] },
    { group: 'Research', items: ['Survey design', 'Content analysis', 'Fact checking'] },
    { group: 'Professional', items: ['Storytelling', 'Presenting', 'Ethics', 'Teamwork'] },
  ],
  careers: [
    { icon: 'search', title: 'Reporter or editor', text: 'Newspapers, television, radio and online outlets.' },
    { icon: 'rocket', title: 'Digital content', text: 'Social media and video.' },
    { icon: 'users', title: 'Public relations', text: 'Organisations and government.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Colleges and universities.' },
    { icon: 'book', title: 'Researcher', text: 'Media research and further study.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: ELIGIBILITY }, ...scienceFaq('Media and Communication Studies', 4)],
}
