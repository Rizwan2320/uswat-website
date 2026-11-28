import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures, scienceFaq } from '../sciences/core'

/* Department of Islamic and Arabic Studies, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the introduction (launched in late 2017;
   BS Islamic Studies, MPhil Islamic Studies, MPhil Arabic Studies, PhD Islamic Studies), the vision, the mission, the six aims, the four degrees and the
   seven named staff with their qualifications.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-islamic-and-arabic-studies/'
export const SLUG = 'islamic-and-arabic-studies'
export const BS = 'bs-islamic-studies-2'

export const islamicStudies: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Islamic and Arabic Studies',
  tagline: 'The Quran and Sunnah, applied to the questions of today.',
  intro: 'Launched in late 2017, with the BS in Islamic Studies and the MPhil and PhD in Islamic and Arabic Studies.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Islamic and Arabic Studies. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Islamic and Arabic Studies'),
  levelText: 'BS to PhD',
  programmesLede: 'The page lists the BS in Islamic Studies, the MPhil in Islamic Studies, the MPhil in Arabic Studies and the PhD in Islamic Studies. The BS has a page of its own here.',
  about: [
    'The Department of Islamic and Arabic Studies was launched in late 2017 to give graduates the knowledge, skills and disposition of the Quran and Sunnah. It aims to offer an intellectual and aspirational environment in which scholars link and apply that knowledge to academic and social life.',
    'The page says that, given the global nature of the world and the many challenges of the time, the need for Islamic knowledge is paramount. The department offers the BS in Islamic Studies, the MPhil in Islamic Studies, the MPhil in Arabic Studies and the PhD in Islamic Studies, and says these give people of the area the chance to do scholarly work in the field.',
  ],
  vision: 'To inculcate the knowledge of Islam with relevance to the contemporary world, particularly in terms of quality and religious harmony.',
  mission:
    'To inculcate Islamic values and religious harmony among graduates through intellectual interaction, research, dialogue and intra-faith modernity, in relevance to the demands of the modern world.',
  highlights: [
    { icon: 'book', title: 'Quran and Sunnah', text: 'Interpretation of the Holy Quran and the sayings of the Prophet (SAW) is an aim.' },
    { icon: 'globe', title: 'Arabic as a language of study', text: 'Students develop thinking and creative ability in Arabic, the language of the Quran and Sunnah.' },
    { icon: 'users', title: 'Religious harmony', text: 'Dialogue and intra-faith modernity feature in the mission.' },
    { icon: 'cap', title: 'BS to PhD', text: 'Four degrees are listed, up to the PhD in Islamic Studies.' },
    { icon: 'search', title: 'Modern social sciences', text: 'Graduates learn to study modern social sciences in the light of Islamic teachings.' },
    { icon: 'spark', title: 'Seven named staff', text: 'All seven hold a PhD in Islamic Studies or Arabic literature; see the people section.' },
  ],
  disciplines: [BS],
  labs: [
    { title: 'Reading room', text: 'Tafsir, Hadith and Seerah texts for study and research.', art: officeHero(SLUG), tools: ['Reference books', 'Manuscript copies', 'Study carrels'] },
    { title: 'Arabic language room', text: 'Listening, speaking and writing practice in Arabic.', art: officeHero(BS), tools: ['Audio devices', 'Flashcards', 'Writing boards'] },
    { title: 'Research room', text: 'Searching sources and writing papers with a supervisor.', art: officeHero(SLUG), tools: ['Reference manager', 'Digital library', 'Citation guides'] },
    { title: 'Seminar room', text: 'Talks and discussions with visiting scholars.', art: officeHero(BS), tools: ['Projector', 'Microphones', 'Seating for a seminar'] },
  ],
  research: [
    { icon: 'book', title: 'Quran and Hadith studies', text: 'Interpretation and the study of the sayings of the Prophet (SAW).', tags: ['Tafsir', 'Hadith', 'Quran'] },
    { icon: 'globe', title: 'Seerah', text: 'The life of the Prophet (SAW) and its lessons.', tags: ['Seerah', 'History', 'Biography'] },
    { icon: 'search', title: 'Arabic language and literature', text: 'Classical and modern Arabic writing.', tags: ['Arabic', 'Literature', 'Linguistics'] },
    { icon: 'users', title: 'Islam and society', text: 'Religious harmony and the questions of modern societies.', tags: ['Harmony', 'Society', 'Ethics'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'book', title: 'Scholar or researcher', text: 'Research institutes and postgraduate study.' },
    { icon: 'users', title: 'Religious guidance', text: 'Educational and community guidance roles.' },
    { icon: 'briefcase', title: 'Public service', text: 'Government posts that ask for a degree in Islamic Studies.' },
    { icon: 'globe', title: 'Translation and writing', text: 'Arabic, Urdu and English translation and editing.' },
    { icon: 'spark', title: 'Media and publishing', text: 'Religious programmes and publishing houses.' },
  ],
  studentLife: [
    { icon: 'book', title: 'Quran and Seerah circles', text: 'Student-led study circles.' },
    { icon: 'users', title: 'Seminars', text: 'Talks by scholars and graduates.' },
    { icon: 'trophy', title: 'Recitation and speech contests', text: 'Competitions in recitation, Naat and speech.' },
    { icon: 'globe', title: 'Dialogue days', text: 'Discussion days on harmony and modern questions.' },
  ],
  faq: [
    { q: 'Which degrees does the department list?', a: 'The BS in Islamic Studies, the MPhil in Islamic Studies, the MPhil in Arabic Studies and the PhD in Islamic Studies.' },
    { q: 'What do I need to apply?', a: 'The page states no eligibility rule. Admission rules are published with each intake on the admissions pages.' },
    { q: 'Who leads the department?', a: 'The page names Dr. Muhammad Mushtaq Ahmad, Associate Professor, as Chairman.' },
    { q: 'When did the department start?', a: 'The page says it was launched in late 2017.' },
    { q: 'Is there a scheme of studies?', a: 'The page links schemes of studies updated for Fall 2025 for all four degrees.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The seven staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['stories-of-the-prophets-in-a-school-text', 'arabic-loanwords-in-a-pashto-sermon', 'harmony-in-the-friday-address'],
  reference: {
    sources: [{ label: 'Department of Islamic and Arabic Studies page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page gives no eligibility rule, department mailbox, phone number, fees or intake dates; only personal e-mail addresses of the staff, which are not shown here.',
      'The introduction speaks in the future tense (“will provide”, “will help”) although the department has run since 2017.',
      'The page links schemes of studies “Updated Fall 2025” for the four degrees; the courses are not reproduced here. The study plan on the programme page is illustrative.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'muhammad-mushtaq-ahmad', name: 'Dr. Muhammad Mushtaq Ahmad', title: 'Associate Professor', role: 'head', roleLabel: 'Chairman', qualifications: ['PhD in Islamic Studies'] },
    { id: 'yahya-khan', name: 'Dr. Yahya Khan', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Arabic Literature'] },
    { id: 'javed-khan', name: 'Dr. Javed Khan', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Islamic Studies'] },
    { id: 'muhammad-noman', name: 'Dr. Muhammad Noman', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Islamic Studies'] },
    { id: 'shafiqa-bushra', name: 'Dr. Shafiqa Bushra', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Arabic Literature'] },
    { id: 'zia-ud-din', name: 'Dr. Zia Ud Din', title: 'Assistant Professor', role: 'member', qualifications: ['PhD in Islamic Studies (Seerat)'] },
    { id: 'fazle-haq', name: 'Dr. Fazle Haq', title: 'Lecturer', role: 'member', qualifications: ['PhD in Islamic Studies (Seerat)'] },
  ],
}

export const bsIslamicStudies: DisciplineProfile = {
  slug: BS,
  department: SLUG,
  status: 'draft',
  name: 'BS Islamic Studies',
  shortName: 'Islamic Studies',
  curriculumLede:
    'This study plan is illustrative: the department links its real scheme of studies, updated for Fall 2025, on the university’s site. Elective courses are chosen from the tracks below.',
  tagline: 'Know the sources, and apply them to today’s questions.',
  summary: 'The Quran, Hadith, Seerah, Arabic and Islamic thought over four years, with a research project.',
  ...pictures(BS, SLUG, 'BS Islamic Studies. Department of Islamic and Arabic Studies, University of Swat.', 'Illustration for BS Islamic Studies'),
  about: [
    'The BS in Islamic Studies is the department’s undergraduate degree. It aims to enable students to understand the real message of Islam and to interpret the Holy Quran and the sayings of the Prophet (SAW).',
    'Students also build their ability in Arabic, the language of the Quran and Sunnah, and learn to study modern social sciences in the light of Islamic teachings.',
  ],
  whyStudy: [
    { icon: 'book', title: 'Go to the sources', text: 'Quran, Hadith and Seerah are at the centre.' },
    { icon: 'globe', title: 'Learn Arabic', text: 'Arabic is studied as the language of the Quran and Sunnah.' },
    { icon: 'users', title: 'Harmony and dialogue', text: 'The mission stresses religious harmony.' },
    { icon: 'cap', title: 'Room to go further', text: 'The department also lists MPhil and PhD degrees.' },
  ],
  outcomes: [
    'Understand and explain the message of Islam from its primary sources.',
    'Interpret the Holy Quran and the sayings of the Prophet (SAW).',
    'Read and use Arabic in the study of Islamic texts.',
    'Analyse questions of modern social science in the light of Islamic teachings.',
    'Carry out and report a small research study.',
    'Hold a respectful, harmony-minded view of other traditions.',
  ],
  years: [
    year(1, ['Introduction to Islamic Studies', 'Arabic I', 'Functional English', 'Pakistan Studies', 'Computer Skills'], ['Ulum al-Quran', 'Arabic II', 'Expository Writing', 'Introduction to Sociology', 'Islamic History']),
    year(2, ['Tafsir I', 'Hadith I', 'Arabic Grammar', 'Research Methods', 'Fiqh I'], ['Tafsir II', 'Hadith II', 'Arabic Composition', 'Fiqh II', 'Seerah I']),
    year(3, ['Usul al-Fiqh', 'Seerah II', 'Islamic Economics', 'Comparative Religion', 'Arabic Literature'], ['Islamic Law and Society', 'Islamic Philosophy', 'Contemporary Issues', 'Elective I', 'Scientific Writing']),
    year(4, ['Elective II', 'Elective III', 'Dawah and Dialogue', 'Research Project I'], ['Elective IV', 'Seminar', 'Internship', 'Research Project II']),
  ],
  tracks: [
    { icon: 'book', title: 'Quran and Hadith', text: 'Interpretation and the sayings of the Prophet (SAW).' },
    { icon: 'globe', title: 'Seerah', text: 'The life of the Prophet (SAW).' },
    { icon: 'search', title: 'Arabic language', text: 'Grammar, composition and literature.' },
    { icon: 'users', title: 'Islam and society', text: 'Contemporary questions and harmony.' },
  ],
  skills: [
    { group: 'Textual', items: ['Reading Arabic', 'Citing sources', 'Close reading', 'Translation'] },
    { group: 'Research', items: ['Literature search', 'Argument writing', 'Interviewing', 'Report writing'] },
    { group: 'Professional', items: ['Public speaking', 'Teaching', 'Dialogue', 'Teamwork'] },
  ],
  careers: [
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Schools, colleges and universities.' },
    { icon: 'book', title: 'Scholar or researcher', text: 'Research institutes and postgraduate study.' },
    { icon: 'users', title: 'Religious guidance', text: 'Educational and community roles.' },
    { icon: 'briefcase', title: 'Public service', text: 'Government posts.' },
    { icon: 'globe', title: 'Translator or writer', text: 'Arabic, Urdu and English.' },
  ],
  faq: [{ q: 'What do I need to apply?', a: 'The page states no eligibility rule; the admissions pages publish the rules with each intake.' }, ...scienceFaq('Islamic Studies', 4)],
}
