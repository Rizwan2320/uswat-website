import { officeBanner, officeHero } from '../../../offices/art'
import type { DepartmentProfile, DisciplineProfile } from '../../types'
import { year } from '../core'
import { pictures } from '../sciences/core'

/* Department of Law and Shari'a, laid out like the DCST department page (the owner's blueprint, 2026-11-24).
   FROM THE UNIVERSITY'S PAGE, saved copy on the owner's Drive (read 2026-11-27; the copy dates from 2026-11-06): the introduction (the third of its kind in
   the country; a five-year degree; a proposed Journal of Law and Sharia), the vision, the mission, the six objectives, the one degree and the six named staff.
   EVERYTHING ELSE (highlights, laboratories, research areas, careers, student life, questions and the study plan) is illustrative text for the template
   that nobody in the department has checked: `status: 'draft'`. Replace it, then set `reviewed`. */

const PAGE = 'https://uswat.edu.pk/department-of-law-sharia/'
export const SLUG = 'law-sharia'
export const LLB = 'ba-llb-law-and-shariah'

export const lawSharia: DepartmentProfile = {
  slug: SLUG,
  status: 'draft',
  shortName: 'Law and Sharia',
  fullName: 'Department of Law and Shari’a',
  tagline: 'Common law and Islamic law, taught together over five years.',
  intro: 'The university’s flagship department, with the five-year BA LL.B in Law and Shari’a.',
  hero: officeHero(SLUG),
  banner: officeBanner(SLUG, 'Department of Law and Shari’a. University of Swat.'),
  tile: officeHero(SLUG, 'Illustration for the Department of Law and Shari’a'),
  levelText: 'BA LL.B',
  durationText: '5 years',
  durationNote: 'Ten semesters',
  programmesLede: 'The department offers the five-year BA LL.B (Law and Shari’a).',
  about: [
    'The Department of Law and Shari’a is, on its own page, the third of its kind in the country and the flagship department of the university. It aims to give students religious knowledge and the science of modern law.',
    'After the degree, students should have a thorough and correct understanding of the Quran, Hadith, Fiqh and the principles of Islamic jurisprudence, and be prepared to compete as law practitioners.',
    'Law and Shari’a is a five-year degree that aims at the highest standards in teaching and in research. The department’s research and that of other contributors is planned to appear in a proposed “Journal of Law and Sharia”.',
  ],
  vision: 'To make the faculty of law and sharia a distinctive centre of excellence that provides legal education and produces graduates with a full grasp of sharia and common law principles.',
  mission: 'To produce law graduates who are able to meet the challenges of today and tomorrow.',
  highlights: [
    { icon: 'shield', title: 'Two legal traditions', text: 'Common law and Islamic law are studied side by side.' },
    { icon: 'book', title: 'A five-year degree', text: 'The BA LL.B runs over five years.' },
    { icon: 'cap', title: 'A diploma in Arabic', text: 'Students receive a Diploma of Arabic Language for Study of Sharia (DASS) for the time spent on Arabic.' },
    { icon: 'search', title: 'A proposed journal', text: 'A “Journal of Law and Sharia” is planned for the department’s research.' },
    { icon: 'users', title: 'Bar and bench', text: 'The curriculum is meant to produce graduates who are an asset to both.' },
    { icon: 'trophy', title: 'Ethics and values', text: 'Ethical, moral and religious values are a stated objective.' },
  ],
  disciplines: [LLB],
  labs: [
    { title: 'Moot court room', text: 'Students argue mock cases before a bench of teachers.', art: officeHero(SLUG), tools: ['Bench and dock', 'Case files', 'Recording equipment'] },
    { title: 'Law library', text: 'Statutes, law reports and Islamic jurisprudence texts.', art: officeHero(LLB), tools: ['Law reports', 'Statute books', 'Fiqh references'] },
    { title: 'Legal clinic', text: 'Supervised practice in drafting and advising.', art: officeHero(SLUG), tools: ['Drafting templates', 'Client interview forms', 'Case registers'] },
    { title: 'Arabic language room', text: 'Study for the Diploma of Arabic Language for Study of Sharia.', art: officeHero(LLB), tools: ['Audio devices', 'Texts', 'Writing boards'] },
  ],
  research: [
    { icon: 'shield', title: 'Islamic law and jurisprudence', text: 'Sources, principles and their use today.', tags: ['Fiqh', 'Jurisprudence', 'Sharia'] },
    { icon: 'book', title: 'Common law', text: 'Constitutional, criminal and civil law in Pakistan.', tags: ['Constitution', 'Criminal law', 'Civil law'] },
    { icon: 'users', title: 'Legal ethics', text: 'The duties of the lawyer, the judge and the court.', tags: ['Ethics', 'Courts', 'Profession'] },
    { icon: 'globe', title: 'Comparative law', text: 'How the two traditions treat the same question.', tags: ['Comparison', 'Reform', 'Case law'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Advocate', text: 'Practice before the courts after the bar requirements.' },
    { icon: 'shield', title: 'Judiciary and prosecution', text: 'Posts on the bench and in prosecution services.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Law colleges and universities.' },
    { icon: 'book', title: 'Legal researcher', text: 'Research bodies and think tanks.' },
    { icon: 'users', title: 'Legal adviser', text: 'Government departments and companies.' },
    { icon: 'globe', title: 'Public policy', text: 'Law reform and policy work.' },
  ],
  studentLife: [
    { icon: 'trophy', title: 'Moot court contests', text: 'Yearly contests between classes.' },
    { icon: 'users', title: 'Law society', text: 'Talks by judges, advocates and scholars.' },
    { icon: 'globe', title: 'Court visits', text: 'Visits to courts and legal institutions.' },
    { icon: 'book', title: 'Debating', text: 'Debates on law reform and Islamic jurisprudence.' },
  ],
  faq: [
    { q: 'Which degree does the department offer?', a: 'The five-year BA LL.B (Law and Shari’a).' },
    { q: 'What do I need to apply?', a: 'The page states no eligibility rule. Admission rules are published with each intake on the admissions pages.' },
    { q: 'Who leads the department?', a: 'The page names Mr. Amjad Hilal, Associate Professor, as Chairman.' },
    { q: 'What is the DASS?', a: 'The Diploma of Arabic Language for Study of Sharia, awarded to students for the time spent studying Arabic.' },
    { q: 'Is the curriculum approved?', a: 'The page links the curriculum for Law and Shariah as approved by the Board of Studies and the Board of Faculty.' },
  ],
  peopleTitle: 'Chairman and faculty',
  peopleLede: 'The six staff named on the department’s page, with the titles and qualifications it gives.',
  alumni: ['inheritance-cases-in-a-district-court', 'bail-and-the-rights-of-the-accused', 'a-moot-on-contract-and-fiqh'],
  reference: {
    sources: [{ label: 'Department of Law and Shari’a page, University of Swat', url: PAGE }],
    verifiedAt: '2026-11-06',
    openPoints: [
      'The page gives no eligibility rule, department mailbox, phone number, fees or intake dates; only personal e-mail addresses of the staff, which are not shown here.',
      'The page speaks of the “faculty of law and sharia” in the vision and of the department elsewhere; which is meant is not explained.',
      'The page links a curriculum approved by the Board of Studies and Board of Faculty; its courses are not reproduced here. The study plan on the programme page is illustrative.',
      'The page says the department’s journal is “proposed”; whether it has appeared is not stated.',
      'Highlights, laboratories, research areas, careers and student life on this page are illustrative text for the template, not statements by the department.',
    ],
  },
  team: [
    { id: 'amjad-hilal', name: 'Mr. Amjad Hilal', title: 'Associate Professor', role: 'head', roleLabel: 'Chairman' },
    {
      id: 'lutfullah-saqib',
      name: 'Dr. Lutfullah Saqib',
      title: 'Professor',
      role: 'member',
      qualifications: ['Post Doctorate (Islamic Law)', 'PhD (Islamic Law and Jurisprudence)', 'LLM (ICL)', 'LLB (Hons)'],
    },
    { id: 'muhammad-islahuddin', name: 'Mr. Muhammad Islahuddin', title: 'Assistant Professor', role: 'member' },
    { id: 'qazi-ubaidullah', name: 'Mr. Qazi Ubaidullah', title: 'Assistant Professor', role: 'member' },
    { id: 'nazish-inayat', name: 'Ms. Nazish Inayat', title: 'Lecturer', role: 'member' },
    { id: 'kalsoom-bibi', name: 'Ms. Kalsoom Bibi', title: 'Lecturer', role: 'member' },
  ],
}

export const baLlb: DisciplineProfile = {
  slug: LLB,
  department: SLUG,
  status: 'draft',
  name: 'BA LL.B (Law and Shari’a)',
  shortName: 'Law and Shari’a',
  badge: 'BA LL.B',
  level: 'BA LL.B',
  duration: '5 years',
  curriculumLede:
    'This study plan is illustrative: the department links its real curriculum, approved by the Board of Studies and the Board of Faculty, on the university’s site. Elective courses are chosen from the tracks below.',
  tagline: 'Practise law with a grounding in both common law and Sharia.',
  summary: 'A five-year degree in common law and Islamic law, with Arabic for the study of Sharia and a research thesis.',
  ...pictures(LLB, SLUG, 'BA LL.B (Law and Shari’a). Department of Law and Shari’a, University of Swat.', 'Illustration for the BA LL.B (Law and Shari’a)'),
  about: [
    'The BA LL.B is a five-year degree that joins the science of modern law with a thorough understanding of the Quran, Hadith, Fiqh and the principles of Islamic jurisprudence.',
    'Students who spend time on the Arabic language are awarded the Diploma of Arabic Language for Study of Sharia (DASS). The department updates its curriculum regularly so graduates are an asset to both bar and bench.',
  ],
  whyStudy: [
    { icon: 'shield', title: 'Two traditions', text: 'Common law and Islamic law are both analysed.' },
    { icon: 'cap', title: 'A diploma on the way', text: 'The DASS rewards the time given to Arabic.' },
    { icon: 'users', title: 'Ethics', text: 'Ethical, moral and religious values are an objective.' },
    { icon: 'briefcase', title: 'Bar or bench', text: 'The curriculum aims at both.' },
  ],
  outcomes: [
    'Explain the main principles of common law and Islamic law and how they meet in Pakistan.',
    'Analyse a legal problem using both traditions.',
    'Draft pleadings, contracts and legal opinions.',
    'Argue a case orally in a moot court.',
    'Read Arabic texts used in the study of Sharia.',
    'Decide ambiguous situations with ethical, moral and religious judgement.',
  ],
  years: [
    year(1, ['Introduction to Law', 'Arabic I', 'Quran Studies I', 'Functional English', 'Pakistan Studies'], ['Legal Method', 'Arabic II', 'Hadith I', 'Expository Writing', 'Introduction to Political Science']),
    year(2, ['Constitutional Law', 'Law of Contract', 'Fiqh I', 'Islamic Jurisprudence I', 'Arabic III'], ['Law of Tort', 'Criminal Law I', 'Fiqh II', 'Islamic Jurisprudence II', 'Quran Studies II']),
    year(3, ['Criminal Law II', 'Property Law', 'Family Law', 'Law of Evidence', 'Islamic Law of Inheritance'], ['Civil Procedure', 'Criminal Procedure', 'Company Law', 'Hadith II', 'Legal Writing']),
    year(4, ['Administrative Law', 'Labour Law', 'Public International Law', 'Islamic Criminal Law', 'Moot Court I'], ['Jurisprudence', 'Tax Law', 'Comparative Law', 'Islamic Law of Contract', 'Moot Court II']),
    year(5, ['Professional Ethics', 'Elective I', 'Elective II', 'Internship'], ['Elective III', 'Legal Aid Clinic', 'Seminar', 'Research Thesis']),
  ],
  tracks: [
    { icon: 'shield', title: 'Common law', text: 'Constitutional, criminal and civil law.' },
    { icon: 'book', title: 'Islamic law', text: 'Fiqh, jurisprudence and Hadith.' },
    { icon: 'globe', title: 'Comparative and international law', text: 'Law across systems.' },
    { icon: 'briefcase', title: 'Commercial law', text: 'Contract, company and tax law.' },
  ],
  skills: [
    { group: 'Legal', items: ['Drafting', 'Legal research', 'Case analysis', 'Oral advocacy'] },
    { group: 'Textual', items: ['Reading Arabic', 'Citing sources', 'Statute reading'] },
    { group: 'Professional', items: ['Client interviewing', 'Negotiation', 'Ethics', 'Teamwork'] },
  ],
  careers: [
    { icon: 'briefcase', title: 'Advocate', text: 'Practice before the courts after the bar requirements.' },
    { icon: 'shield', title: 'Judiciary and prosecution', text: 'Posts on the bench and in prosecution.' },
    { icon: 'cap', title: 'Teacher or lecturer', text: 'Law colleges and universities.' },
    { icon: 'users', title: 'Legal adviser', text: 'Government departments and companies.' },
    { icon: 'book', title: 'Legal researcher', text: 'Research bodies and think tanks.' },
  ],
  faq: [
    { q: 'What do I need to apply?', a: 'The page states no eligibility rule; the admissions pages publish the rules with each intake.' },
    { q: 'How long is the programme?', a: 'The BA LL.B is a five-year degree, in ten semesters. This plan is a draft; the department confirms the approved curriculum for each intake.' },
    { q: 'Is there a thesis or clinic?', a: 'Yes. The plan includes moot courts, a legal-aid clinic, an internship and a research thesis in the last year.' },
  ],
}
