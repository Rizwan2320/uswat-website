import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Pashto, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the welcome text, the mission, the sections
   on programmes, faculty and research, cultural outreach and community engagement, the BS in Pashto and the one named staff member. The page is general:
   it gives no year of founding, no eligibility and no courses. A second saved page, "Department of Pashto and Local Languages", holds only a title.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-pashto/'
export const SLUG = 'pashto'
// The old address list has no programme page for Pashto; this slug is new.
export const BS = 'bs-pashto'

export const pashto: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Pashto',
  tagline: 'The Pashto language, literature and culture: kept, studied and passed on.',
  intro: 'A department for Pashto language, literature and culture, with a BS in Pashto and an active programme of cultural events.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Pashto. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Pashto'),
  levelText: 'BS',
  programmesLede: 'The department offers the BS in Pashto.',
  about: [
    'The Department of Pashto celebrates the cultural heritage and linguistic diversity of the Pashtun people. Its page says it was set up to preserve, promote and advance the Pashto language, literature and culture.',
    'Its undergraduate programme gives students a foundation in Pashto language, literature and culture, so they can explore the Pashto literary tradition and become proficient in the language.',
    'Beyond teaching, the department says it promotes Pashto culture through poetry recitations, literary seminars, cultural festivals and exhibitions, and works with local schools, cultural organisations and community groups.',
  ],
  vision: 'To be a beacon of excellence in Pashto studies, rooted in cultural diversity and mutual understanding.',
  mission:
    'To foster a deep understanding and appreciation of Pashto language, literature and culture among students, scholars and the wider community, through rigorous academic programmes, research and cultural activities, so students can engage critically with Pashto literature and contribute to its development.',
  highlights: [
    { icon: 'book', title: 'Language and literature', text: 'The undergraduate programme builds proficiency in Pashto and knowledge of its literature.' },
    { icon: 'spark', title: 'Poetry and festivals', text: 'Poetry recitations, literary seminars, festivals and exhibitions are listed.' },
    { icon: 'users', title: 'Community links', text: 'Partnerships with local schools, cultural organisations and community groups.' },
    { icon: 'globe', title: 'Culture and heritage', text: 'Pashto arts and traditions sit alongside the academic work.' },
    { icon: 'search', title: 'Faculty research', text: 'The page says faculty research advances Pashto studies.' },
    { icon: 'cap', title: 'Open to all', text: 'Students, scholars and admirers of Pashto are invited to join.' },
  ],
  disciplines: [BS],
  labs: [
    { title: 'Literature reading room', text: 'Classical and modern Pashto poetry and prose.', art: officeHero(SLUG), tools: ['Poetry collections', 'Prose anthologies', 'Reference dictionaries'] },
    { title: 'Language practice room', text: 'Listening, speaking and writing practice.', art: officeHero(BS), tools: ['Audio devices', 'Writing boards', 'Flashcards'] },
    { title: 'Recording corner', text: 'Recording poets, storytellers and folk songs for an archive.', art: officeHero(SLUG), tools: ['Recorders', 'Transcription software', 'Catalogue cards'] },
    { title: 'Seminar room', text: 'Literary talks and poetry readings.', art: officeHero(BS), tools: ['Microphones', 'Projector', 'Seating for a reading'] },
  ],
  research: [
    { icon: 'book', title: 'Pashto literature', text: 'Poetry, prose and criticism, old and new.', tags: ['Poetry', 'Prose', 'Criticism'] },
    { icon: 'search', title: 'Language and linguistics', text: 'Grammar, dialects and the written form.', tags: ['Grammar', 'Dialects', 'Orthography'] },
    { icon: 'globe', title: 'Folklore and culture', text: 'Songs, tales and traditions of the Pashtun people.', tags: ['Folklore', 'Music', 'Customs'] },
    { icon: 'users', title: 'Language in society', text: 'Pashto in schools, media and public life.', tags: ['Education', 'Media', 'Identity'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'book', title: 'Writer or editor', text: 'Publishing, magazines and newspapers.' },
    { icon: 'search', title: 'Translator', text: 'Pashto, Urdu and English translation.' },
    { icon: 'rocket', title: 'Media', text: 'Radio, television and online content in Pashto.' },
    { icon: 'globe', title: 'Cultural work', text: 'Cultural organisations and heritage bodies.' },
    { icon: 'flask', title: 'Researcher', text: 'Research bodies and postgraduate study.' },
  ],
  studentLife: [
    { icon: 'spark', title: 'Poetry evenings', text: 'Student recitations and readings.' },
    { icon: 'users', title: 'Literary society', text: 'Student-run talks and book discussions.' },
    { icon: 'trophy', title: 'Speech and recitation contests', text: 'Yearly contests in Pashto.' },
    { icon: 'globe', title: 'Culture week', text: 'A week of exhibitions and performances.' },
  ],
  faq: [
    { q: 'Which programme does the department offer?', a: 'The BS in Pashto.' },
    { q: 'What do I need to apply?', a: 'The page states no eligibility rule. Admission rules are published with each intake on the admissions pages.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Rafi Ullah as In-charge.' },
    { q: 'When did the department start?', a: 'The page gives no year of founding.' },
    { q: 'What does the department do besides teaching?', a: 'The page lists poetry recitations, literary seminars, cultural festivals, exhibitions and partnerships with schools and community groups.' },
  ],
  peopleTitle: 'In-charge',
  peopleLede: 'The one staff member named on the department’s page.',
  alumni: ['the-pashto-ghazal-after-1950', 'proverbs-of-the-upper-swat-valley', 'women-poets-of-the-landay'],
  reference: {
    sources: [{ label: 'Department of Pashto page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page is general: it gives no year of founding, eligibility, courses, department mailbox, phone number, fees or intake dates. The old site’s address list holds a news item dated 2023/11 and titled “University of Swat launches Department of Pashto”; it has not been read, so no year is stated here.',
      'The page names one person, Dr. Rafi Ullah, as In-charge, without a rank; the Media and Communication Studies page lists him as a lecturer. Only the personal e-mail address is given and it is not shown here.',
      'The old address list also has “Department of Pashto and Local Languages”, whose saved page holds only a title. It is treated here as the same department.',
      'The old address list has no programme page for Pashto; the BS page is new. The study plan on it is illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [{ id: 'rafi-ullah', name: 'Dr. Rafi Ullah', title: 'In-charge', role: 'head', roleLabel: 'In-charge' }],
}

export const bsPashto: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Pashto',
  shortName: 'Pashto',
  curriculumLede:
    'This study plan is illustrative: the department’s page gives no scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Read, write and think in Pashto.',
  summary: 'Pashto language, literature and culture over four years, with a research project.',
  ...pictures(BS, SLUG, 'BS Pashto. Department of Pashto, University of Swat.', 'Illustration for BS Pashto'),
  about: [
    'The BS in Pashto gives students a solid foundation in Pashto language, literature and culture. It helps them explore the richness of the Pashto literary tradition and become proficient in the language.',
    'The department also invites students into its poetry readings, seminars and festivals, so study and cultural life go together.',
  ],
  whyStudy: [
    { icon: 'book', title: 'Know a literature', text: 'Poetry and prose in a living tradition.' },
    { icon: 'spark', title: 'Culture alive', text: 'Poetry readings, seminars and festivals.' },
    { icon: 'users', title: 'Serve the community', text: 'The department works with schools and community groups.' },
    { icon: 'cap', title: 'Teach or write', text: 'Teaching, writing, translation and media.' },
  ],
  outcomes: [
    'Read, write and speak Pashto with confidence.',
    'Describe the history and main forms of Pashto literature.',
    'Analyse a poem or a piece of prose using literary tools.',
    'Collect and describe examples of folklore.',
    'Present Pashto language and culture to a public audience.',
    'Carry out and report a small study.',
  ],
  years: [
    year(1, ['Introduction to Pashto Literature', 'Pashto Grammar I', 'Functional English', 'Islamic Studies', 'Computer Skills'], ['Pashto Prose', 'Pashto Grammar II', 'Expository Writing', 'Pakistan Studies', 'Introduction to Linguistics']),
    year(2, ['Classical Pashto Poetry', 'Pashto Composition', 'Research Methods', 'Folklore I', 'History of the Pashto Language'], ['Modern Pashto Poetry', 'Pashto Fiction', 'Folklore II', 'Statistics', 'Literary Criticism']),
    year(3, ['Pashto Drama', 'Dialects of Pashto', 'Translation Studies', 'Pashto Journalism', 'Comparative Literature'], ['Pashto Linguistics', 'Culture and Society', 'Oral Tradition', 'Elective I', 'Scientific Writing']),
    year(4, ['Elective II', 'Elective III', 'Editing and Publishing', 'Research Project I'], ['Elective IV', 'Seminar', 'Internship', 'Research Project II']),
  ],
  tracks: [
    { icon: 'book', title: 'Literature', text: 'Poetry, prose, drama and criticism.' },
    { icon: 'search', title: 'Language and linguistics', text: 'Grammar and dialects.' },
    { icon: 'globe', title: 'Folklore and culture', text: 'Songs, tales and customs.' },
    { icon: 'rocket', title: 'Media and translation', text: 'Writing, editing and translation.' },
  ],
  skills: [
    { group: 'Language', items: ['Writing in Pashto', 'Reading classical texts', 'Translation', 'Editing'] },
    { group: 'Research', items: ['Close reading', 'Recording and transcribing', 'Report writing'] },
    { group: 'Professional', items: ['Public speaking', 'Teaching', 'Event organising', 'Teamwork'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'book', title: 'Writer or editor', text: 'Publishing and the press.' },
    { icon: 'search', title: 'Translator', text: 'Pashto, Urdu and English.' },
    { icon: 'rocket', title: 'Media', text: 'Radio, television and online.' },
    { icon: 'globe', title: 'Cultural work', text: 'Cultural and heritage organisations.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: 'The page states no eligibility rule; the admissions pages publish the rules with each intake.' }, ...scienceFaq('Pashto', 4)],
}
