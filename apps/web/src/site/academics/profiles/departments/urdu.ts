import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Urdu, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the welcome text, the mission, the sections
   on programmes, faculty and research and cultural outreach, the BS in Urdu and the one name it lists. The page is general: it gives no year of founding, no
   vision of its own, no eligibility and no courses.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-urdu/'
export const SLUG = 'urdu'
// The old address list has no programme page for Urdu; this slug is new.
export const BS = 'bs-urdu'

export const urdu: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Urdu',
  tagline: 'Urdu language, literature and culture, studied and shared.',
  intro: 'A hub for Urdu studies, with a BS in Urdu and a programme of readings, seminars and cultural events.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Urdu. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Urdu'),
  levelText: 'BS',
  programmesLede: 'The department offers the BS in Urdu.',
  about: [
    'The Department of Urdu welcomes students to the richness and diversity of the Urdu language, literature and culture. Its page says it was set up with a commitment to academic excellence and cultural understanding and serves as a hub for Urdu studies and scholarship.',
    'Its undergraduate programme gives students a strong foundation in Urdu language, literature and culture, so they can explore the Urdu literary tradition and become proficient in the language.',
    'The page also lists cultural outreach: literary readings, cultural seminars, film screenings and poetry recitations that bring students and the community into Urdu arts and letters.',
  ],
  vision: 'To be a vibrant hub for Urdu studies and scholarship, with academic excellence and cultural understanding.',
  mission:
    'To cultivate a deep appreciation and understanding of Urdu language, literature and culture among students, scholars and the wider community, through rigorous academic programmes, research and cultural initiatives, so students can engage critically with Urdu literature and help to preserve and advance it.',
  highlights: [
    { icon: 'book', title: 'Language and literature', text: 'The undergraduate programme builds proficiency in Urdu and knowledge of its literature.' },
    { icon: 'spark', title: 'Readings and poetry', text: 'Literary readings, seminars, film screenings and poetry recitations are listed.' },
    { icon: 'users', title: 'Faculty scholarship', text: 'The page says faculty research advances Urdu studies.' },
    { icon: 'globe', title: 'Culture and community', text: 'Cultural outreach brings the community into Urdu arts and letters.' },
    { icon: 'search', title: 'Critical engagement', text: 'Students learn to read Urdu literature critically.' },
    { icon: 'cap', title: 'Open to all', text: 'Students, scholars and admirers of Urdu are invited to join.' },
  ],
  disciplines: [BS],
  labs: [
    { title: 'Literature reading room', text: 'Classical and modern Urdu poetry, fiction and criticism.', art: officeHero(SLUG), tools: ['Poetry collections', 'Fiction anthologies', 'Reference dictionaries'] },
    { title: 'Language practice room', text: 'Listening, speaking and writing practice.', art: officeHero(BS), tools: ['Audio devices', 'Writing boards', 'Flashcards'] },
    { title: 'Film and reading corner', text: 'Screenings and read-aloud sessions.', art: officeHero(SLUG), tools: ['Projector', 'Speakers', 'Seating for a screening'] },
    { title: 'Seminar room', text: 'Talks, mushairas and student presentations.', art: officeHero(BS), tools: ['Microphones', 'Projector', 'Seating for a reading'] },
  ],
  research: [
    { icon: 'book', title: 'Urdu literature', text: 'Poetry, fiction and criticism, old and new.', tags: ['Ghazal', 'Fiction', 'Criticism'] },
    { icon: 'search', title: 'Language and linguistics', text: 'Grammar, usage and the history of Urdu.', tags: ['Grammar', 'Usage', 'History'] },
    { icon: 'globe', title: 'Urdu and regional languages', text: 'How Urdu meets Pashto and other local languages.', tags: ['Contact', 'Loanwords', 'Translation'] },
    { icon: 'users', title: 'Urdu in society', text: 'Urdu in schools, media and public life.', tags: ['Education', 'Media', 'Identity'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'book', title: 'Writer or editor', text: 'Publishing, magazines and newspapers.' },
    { icon: 'search', title: 'Translator', text: 'Urdu, Pashto and English translation.' },
    { icon: 'rocket', title: 'Media', text: 'Radio, television and online content in Urdu.' },
    { icon: 'briefcase', title: 'Public service', text: 'Government posts that ask for a degree in Urdu.' },
    { icon: 'flask', title: 'Researcher', text: 'Research bodies and postgraduate study.' },
  ],
  studentLife: [
    { icon: 'spark', title: 'Mushaira evenings', text: 'Student poetry readings.' },
    { icon: 'users', title: 'Literary society', text: 'Student-run talks and book discussions.' },
    { icon: 'trophy', title: 'Declamation contests', text: 'Yearly speech and recitation contests.' },
    { icon: 'globe', title: 'Film nights', text: 'Screenings of adaptations of Urdu stories.' },
  ],
  faq: [
    { q: 'Which programme does the department offer?', a: 'The BS in Urdu.' },
    { q: 'What do I need to apply?', a: 'The page states no eligibility rule. Admission rules are published with each intake on the admissions pages.' },
    { q: 'Who leads the department?', a: 'The page does not say. It lists one name, Dr. Lala Rukh, with the title Associate Professor in Finance and a PhD in Management Sciences, which looks like an error on the page.' },
    { q: 'When did the department start?', a: 'The page gives no year of founding.' },
    { q: 'What does the department do besides teaching?', a: 'The page lists literary readings, cultural seminars, film screenings and poetry recitations.' },
  ],
  peopleTitle: 'Faculty',
  peopleLede: 'The one name the department’s page lists, with the title and qualification it gives.',
  alumni: ['the-urdu-short-story-after-1947', 'the-voice-of-a-regional-poet-in-urdu', 'urdu-in-the-primary-classroom'],
  reference: {
    sources: [{ label: 'Department of Urdu page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page lists one person, Dr. Lala Rukh, as Associate Professor in Finance with a PhD in Management Sciences. That does not fit an Urdu department and looks like a page error; no head of department is named here until the department confirms who leads it.',
      'The page is general: it gives no year of founding, vision statement, eligibility, courses, department mailbox, phone number, fees or intake dates. The vision text above is written from the mission and the welcome text.',
      'The old address list has no programme page for Urdu; the BS page is new. The study plan on it is illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [{ id: 'lala-rukh', name: 'Dr. Lala Rukh', title: 'Associate Professor in Finance', role: 'member', qualifications: ['PhD in Management Sciences'] }],
}

export const bsUrdu: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Urdu',
  shortName: 'Urdu',
  curriculumLede:
    'This study plan is illustrative: the department’s page gives no scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Read, write and think in Urdu.',
  summary: 'Urdu language, literature and criticism over four years, with a research project.',
  ...pictures(BS, SLUG, 'BS Urdu. Department of Urdu, University of Swat.', 'Illustration for BS Urdu'),
  about: [
    'The BS in Urdu gives students a strong foundation in Urdu language, literature and culture. It helps them explore the Urdu literary tradition and become proficient in the language.',
    'Students take part in the department’s readings, seminars, screenings and recitations, so study and cultural life go together.',
  ],
  whyStudy: [
    { icon: 'book', title: 'Know a literature', text: 'Poetry, fiction and criticism in a rich tradition.' },
    { icon: 'spark', title: 'Culture alive', text: 'Readings, seminars, screenings and recitations.' },
    { icon: 'users', title: 'Serve the community', text: 'Outreach brings the public into the department.' },
    { icon: 'cap', title: 'Teach or write', text: 'Teaching, writing, translation and media.' },
  ],
  outcomes: [
    'Read, write and speak Urdu with confidence.',
    'Describe the history and main forms of Urdu literature.',
    'Analyse a poem or a story using literary tools.',
    'Edit and proofread Urdu text.',
    'Present Urdu language and culture to a public audience.',
    'Carry out and report a small study.',
  ],
  years: [
    year(1, ['Introduction to Urdu Literature', 'Urdu Grammar I', 'Functional English', 'Islamic Studies', 'Computer Skills'], ['Urdu Prose', 'Urdu Grammar II', 'Expository Writing', 'Pakistan Studies', 'Introduction to Linguistics']),
    year(2, ['Classical Urdu Poetry', 'Urdu Composition', 'Research Methods', 'History of the Urdu Language', 'Urdu Fiction I'], ['Modern Urdu Poetry', 'Urdu Fiction II', 'Urdu Drama', 'Statistics', 'Literary Criticism']),
    year(3, ['Urdu Essay and Biography', 'Urdu Linguistics', 'Translation Studies', 'Urdu Journalism', 'Comparative Literature'], ['Urdu Criticism', 'Urdu and Regional Languages', 'Oral Tradition', 'Elective I', 'Scientific Writing']),
    year(4, ['Elective II', 'Elective III', 'Editing and Publishing', 'Research Project I'], ['Elective IV', 'Seminar', 'Internship', 'Research Project II']),
  ],
  tracks: [
    { icon: 'book', title: 'Literature', text: 'Poetry, fiction, drama and criticism.' },
    { icon: 'search', title: 'Language and linguistics', text: 'Grammar, usage and history.' },
    { icon: 'globe', title: 'Urdu and regional languages', text: 'Contact, loanwords and translation.' },
    { icon: 'rocket', title: 'Media and publishing', text: 'Writing, editing and broadcast.' },
  ],
  skills: [
    { group: 'Language', items: ['Writing in Urdu', 'Reading classical texts', 'Translation', 'Editing'] },
    { group: 'Research', items: ['Close reading', 'Archive search', 'Report writing'] },
    { group: 'Professional', items: ['Public speaking', 'Teaching', 'Event organising', 'Teamwork'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'book', title: 'Writer or editor', text: 'Publishing and the press.' },
    { icon: 'search', title: 'Translator', text: 'Urdu, Pashto and English.' },
    { icon: 'rocket', title: 'Media', text: 'Radio, television and online.' },
    { icon: 'briefcase', title: 'Public service', text: 'Government posts.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: 'The page states no eligibility rule; the admissions pages publish the rules with each intake.' }, ...scienceFaq('Urdu', 4)],
}
