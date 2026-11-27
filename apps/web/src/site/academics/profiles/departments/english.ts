import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of English and Foreign Languages, laid out like the DCST department page (the owner's blueprint, 2026-11-24). It replaces the office-style
   page built on 2026-11-25 from the same saved copy, so the facts are the ones that page carried.
   FROM THE UNIVERSITY'S PAGE, read 2026-11-06 (saved copy on the owner's Drive): the introduction, the vision, the mission, the four core values, the
   programmes (BS English, MPhil in Linguistics), the six objectives, the five named staff and the department mailbox.
   EVERYTHING ELSE (laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template that nobody
   in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-english-and-foreign-languages/'
export const SLUG = 'english-and-foreign-languages'
export const BS = 'bs-english-2'

export const english: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'English and Foreign Languages',
  tagline: 'Read closely, write clearly, think for yourself.',
  intro: 'English literature and linguistics, with a BS in English and an MPhil in Linguistics.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of English and Foreign Languages. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of English and Foreign Languages'),
  levelText: 'BS',
  programmesLede: 'The department lists the BS in English and an MPhil in Linguistics; the BS in English is shown here.',
  about: [
    'English has assumed increasing significance because of its global relevance and as a key language for acquiring and passing on knowledge and for international communication. The programme aims to produce graduates with strong written, oral and analytical skills in English that help them meet their economic and socio-cultural needs.',
    'The syllabus is designed to inculcate a creative, analytical and reflective mindset. Critical ability and independent thinking help students grow into more conscientious individuals who respond in a meaningful way to the opportunities and challenges of their societies in a rapidly changing world.',
  ],
  vision:
    'To be a leading department, nationally and internationally recognized for the study of English literature and linguistics. In the future, the department aims to establish an excellence center for foreign language studies, including English, Chinese, Japanese, German, Spanish and French.',
  mission:
    'To establish a high-quality department that provides a high-quality academic environment and relevant education for the needs of its students, and to inculcate and groom creativity and independent thinking through student-centered participatory teaching methods.',
  highlights: [
    { icon: 'trophy', title: 'Excellence', text: 'High-quality education, relevant to the needs of the students and focused on outcomes.' },
    { icon: 'rocket', title: 'Ambition', text: 'Students are supported to develop and achieve their personal and career-oriented aspirations.' },
    { icon: 'users', title: 'Collaboration', text: 'Students and faculty work together to help every student reach their potential.' },
    { icon: 'search', title: 'Inquisitiveness', text: 'Inquisitive minds that question taken-for-granted ways of thinking are valued and fostered.' },
    { icon: 'book', title: 'Literature and language', text: 'Students study literary genres and also how the English language works.' },
    { icon: 'cap', title: 'An MPhil in Linguistics', text: 'The department lists an MPhil in Linguistics for graduates who want to continue.' },
  ],
  disciplines: [BS],
  labs: [
    {
      title: 'Language laboratory',
      text: 'Listening, speaking and pronunciation practice with recorded material.',
      art: officeHero(SLUG),
      tools: ['Headsets', 'Recording software', 'Listening exercises'],
    },
    {
      title: 'Reading and writing centre',
      text: 'Help with essays, reports and research papers, in small groups.',
      art: officeHero(BS),
      tools: ['Writing guides', 'Style sheets', 'Peer review sessions'],
    },
    {
      title: 'Seminar room',
      text: 'Where students present, debate and discuss literary and linguistic papers.',
      art: officeHero(SLUG),
      tools: ['Projector', 'Whiteboard', 'Seminar schedule'],
    },
    {
      title: 'Department library corner',
      text: 'Novels, plays, poetry and linguistics texts for course reading.',
      art: officeHero(BS),
      tools: ['Anthologies', 'Reference works', 'Journals'],
    },
  ],
  research: [
    { icon: 'book', title: 'English literature', text: 'Poetry, drama and fiction, read in their contexts.', tags: ['Poetry', 'Drama', 'Fiction'] },
    { icon: 'brain', title: 'Applied linguistics', text: 'How people learn and use language in classrooms and communities.', tags: ['Language learning', 'Teaching', 'Discourse'] },
    { icon: 'globe', title: 'Comparative and world literature', text: 'Reading texts from different languages and traditions side by side.', tags: ['Comparative', 'Translation', 'Culture'] },
    { icon: 'spark', title: 'Language and society', text: 'Language in the multilingual region of Swat.', tags: ['Multilingualism', 'Pashto', 'Identity'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'book', title: 'Writer or editor', text: 'Publishing, media and communication.' },
    { icon: 'briefcase', title: 'Communication professional', text: 'Corporate communication and public relations.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD, then research posts.' },
    { icon: 'globe', title: 'Translator or interpreter', text: 'Organisations that work across languages.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and administrative posts.' },
  ],
  studentLife: [
    { icon: 'users', title: 'Literary society', text: 'Student-run readings, open-mic evenings and book discussions.' },
    { icon: 'trophy', title: 'Debates and declamation', text: 'Contests in English for first-year and senior students.' },
    { icon: 'book', title: 'Student magazine', text: 'Essays, stories and poems by students.' },
    { icon: 'spark', title: 'Guest talks', text: 'Writers and linguists speak about their work.' },
  ],
  faq: [
    { q: 'Which programmes does the department list?', a: 'The BS in English and an MPhil in Linguistics.' },
    { q: 'What do I need to apply?', a: 'The department’s page does not state an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Syed Hanif Rasool, Associate Professor, as Chairman.' },
    { q: 'Does the department teach foreign languages?', a: 'The vision speaks of a future excellence center for English, Chinese, Japanese, German, Spanish and French. The page lists only BS English and the MPhil in Linguistics today.' },
    { q: 'How do I contact the department?', a: 'The page gives the department mailbox defl@uswat.edu.pk.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The five staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['voices-of-village-women-in-short-stories', 'code-switching-in-classroom-talk', 'a-reading-of-imagery-in-a-sonnet-sequence'],
  reference: {
    sources: [{ label: 'Department of English and Foreign Languages page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    emails: ['defl@uswat.edu.pk'],
    openPoints: [
      'The page gives no phone number or address. Duration, eligibility, fees, seats and curriculum are not on the page.',
      'The first two objectives run together in the page’s text; they are split the way the sentence reads.',
      'The vision speaks of a future centre for several foreign languages; the page lists only BS English and MPhil (Linguistics) as programmes today.',
      'The BS English programme page on the old site holds only a name and links, so its study plan, outcomes and careers are illustrative.',
      'Laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department. The four core values are the page’s own.',
    ],
  },
  team: [
    { id: 'syed-hanif-rasool', name: 'Dr. Syed Hanif Rasool', title: 'Associate Professor and Chairman', role: 'head', roleLabel: 'Chairman' },
    { id: 'syed-shujaat-ali', name: 'Dr. Syed Shujaat Ali', title: 'Associate Professor', role: 'member' },
    { id: 'imdad-ullah-khan', name: 'Dr. Imdad Ullah Khan', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Applied Linguistics, University of Auckland, New Zealand'] },
    { id: 'zakirullah', name: 'Mr. Zakirullah', title: 'Lecturer', role: 'member', qualifications: ['MPhil in English Literature'] },
    { id: 'sadiq-hussain', name: 'Mr. Sadiq Hussain', title: 'Lecturer', role: 'member' },
  ],
}

export const bsEnglish: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS English',
  shortName: 'English',
  curriculumLede:
    'This study plan is illustrative until the department confirms its approved scheme of studies. Elective courses are chosen from the tracks below.',
  tagline: 'Literature, language and the habit of thinking for yourself.',
  summary: 'English literature and linguistics, with strong writing, speaking and research skills.',
  ...pictures(BS, SLUG, 'BS English. Department of English and Foreign Languages, University of Swat.', 'Illustration for BS English'),
  about: [
    'BS English produces graduates with strong written, oral and analytical skills in English. Students study literature in its main genres and the English language from linguistic and applied-linguistic perspectives.',
    'Students become proficient users of English, compare literary texts, learn the methods of research in their field, and finish with a research project.',
  ],
  whyStudy: [
    { icon: 'book', title: 'Read widely', text: 'Poetry, drama, fiction and non-fiction from many periods.' },
    { icon: 'brain', title: 'Understand language', text: 'Linguistics and applied linguistics explain how language works.' },
    { icon: 'users', title: 'Speak and write well', text: 'Skills that matter in every career.' },
    { icon: 'cap', title: 'Lifelong learning', text: 'The programme aims to motivate students to keep learning.' },
  ],
  outcomes: [
    'Become proficient users of English in written and oral forms.',
    'Comprehend, appreciate and evaluate different genres of literature.',
    'Understand and analyze the English language from linguistic and applied-linguistic perspectives.',
    'Compare and analyze literary texts.',
    'Understand and practice research in the field of study.',
  ],
  years: [
    year(1, ['Introduction to Literature', 'Introduction to Linguistics', 'Functional English', 'Islamic Studies', 'Computer Skills'], ['Introduction to Poetry', 'Phonetics and Phonology', 'Expository Writing', 'Pakistan Studies', 'Introduction to Sociology']),
    year(2, ['Introduction to Drama', 'Morphology and Syntax', 'Introduction to Fiction', 'Literary Criticism I', 'Research Methods'], ['Shakespeare', 'Semantics and Pragmatics', 'Romantic and Victorian Poetry', 'Literary Criticism II', 'Academic Writing']),
    year(3, ['Modern Poetry', 'Sociolinguistics', 'The Novel', 'Postcolonial Literature', 'Language Teaching Methods'], ['Modern Drama', 'Discourse Analysis', 'Pakistani Literature in English', 'Translation Studies', 'Scientific Writing']),
    year(4, ['Applied Linguistics', 'Elective I', 'Elective II', 'Research Project I'], ['Comparative Literature', 'Elective III', 'Seminar', 'Research Project II']),
  ],
  tracks: [
    { icon: 'book', title: 'Literature', text: 'Poetry, drama, fiction and criticism.' },
    { icon: 'brain', title: 'Linguistics and applied linguistics', text: 'How language works and how it is learned.' },
    { icon: 'globe', title: 'Comparative and postcolonial studies', text: 'Texts across languages and histories.' },
    { icon: 'users', title: 'Language teaching', text: 'Methods for the English classroom.' },
  ],
  skills: [
    { group: 'Language', items: ['Academic writing', 'Public speaking', 'Close reading', 'Editing'] },
    { group: 'Research', items: ['Literature review', 'Textual analysis', 'Corpus tools', 'Referencing'] },
    { group: 'Professional', items: ['Presenting', 'Teamwork', 'Critical thinking', 'Time management'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'book', title: 'Writer or editor', text: 'Publishing, media and communication.' },
    { icon: 'briefcase', title: 'Communication professional', text: 'Corporate communication and public relations.' },
    { icon: 'flask', title: 'Researcher', text: 'MPhil and PhD, then research posts.' },
    { icon: 'briefcase', title: 'Public service', text: 'Competitive examinations and administrative posts.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'The department has not published an entry requirement. The merit criteria are announced with each intake on the admissions page.' },
    ...scienceFaq('English', 4),
  ],
}
