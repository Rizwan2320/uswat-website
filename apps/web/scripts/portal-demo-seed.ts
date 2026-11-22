/**
 * Prints the SQL (a JSON array of statements, or plain text with --sql) that fills the three demonstration accounts of a
 * portal demo database with a complete, FICTIONAL set of records: names, designations, pictures, an approved profile,
 * courses, claimed and pending works, delegations, notices and review history. Nothing here is real; every title and course
 * is invented for the demonstration, and the portal's "Sample portal for demonstration" banner says so on every page.
 * It prints; it connects to nothing. Apply the output yourself to the DEMO database only (never to a CMS or live database).
 *   npx tsx scripts/portal-demo-seed.ts [--sql] <rizwanId> <bilalId> <sanaId>
 */
import { normaliseDoi, titleKey } from '../src/modules/portal/publications/rules'

const [flag, ...rest] = process.argv.slice(2)
const ids = flag === '--sql' ? rest : [flag, ...rest]
const [R, B, S] = ids as [string, string, string]
if (!R || !B || !S || ids.length !== 3) {
  console.error('usage: tsx scripts/portal-demo-seed.ts [--sql] <rizwanId> <bilalId> <sanaId>')
  process.exit(2)
}
const q = (v: string | number | null): string =>
  v === null ? 'null' : typeof v === 'number' ? String(v) : `'${v.replace(/'/g, "''")}'`
const j = (v: unknown): string => `${q(JSON.stringify(v))}::jsonb`
const DEPT = 'Department of Computer Science'

const rizwanEdit = {
  bio: {
    en: 'Software engineer building web platforms for higher education. Works on the University of Swat website and faculty portal prototype: accessible public pages, a content management system and secure sign-in with passkeys. Interested in public-sector software that stays usable on slow connections and in two languages.',
    ur: 'سافٹ ویئر انجینئر جو اعلیٰ تعلیم کے لیے ویب پلیٹ فارم بناتے ہیں۔ جامعہ سوات کی ویب سائٹ اور فیکلٹی پورٹل کے نمونے پر کام کرتے ہیں: قابلِ رسائی عوامی صفحات، مواد کا نظم، اور پاس کی کے ساتھ محفوظ سائن اِن۔ دلچسپی کا میدان: ایسا سرکاری شعبے کا سافٹ ویئر جو سست انٹرنیٹ پر اور دو زبانوں میں بھی آسانی سے استعمال ہو۔',
  },
  researchInterests: [
    'Web accessibility',
    'Passkeys and secure sign-in',
    'Content management systems',
    'English and Urdu interfaces',
    'Software testing',
    'Open data',
  ],
  officeLocation: 'Software Lab, Department of Computer Science',
  officeHours: 'Monday and Wednesday, 10:00 to 12:00',
  orcid: '0000-0002-1825-0097',
  scholarUrl: 'https://scholar.google.com/',
  cvLink: 'https://example.org/cv/rizwan-khan',
  visibility: { email: 'public', photo: 'public' },
}
const sanaEdit = {
  bio: {
    en: 'Lecturer teaching programming fundamentals and databases. Interested in how first-year students learn to read and write code.',
    ur: 'لیکچرر جو پروگرامنگ کی بنیادیں اور ڈیٹا بیس پڑھاتی ہیں۔ پہلے سال کے طلبہ کوڈ پڑھنا اور لکھنا کیسے سیکھتے ہیں، اس میں دلچسپی رکھتی ہیں۔',
  },
  researchInterests: ['Computing education', 'Databases', 'Programming fundamentals'],
  officeLocation: 'Room 14, Department of Computer Science',
  officeHours: 'Tuesday and Thursday, 11:00 to 13:00',
  orcid: '',
  scholarUrl: '',
  cvLink: '',
  visibility: { email: 'internal', photo: 'public' },
}
const bilalEdit = {
  bio: {
    en: 'Associate professor and department reviewer. Teaches software engineering and supervises final-year projects.',
    ur: 'ایسوسی ایٹ پروفیسر اور شعبے کے جائزہ کار۔ سافٹ ویئر انجینئرنگ پڑھاتے ہیں اور آخری سال کے منصوبوں کی نگرانی کرتے ہیں۔',
  },
  researchInterests: ['Software engineering', 'Project supervision'],
  officeLocation: 'Room 2, Department of Computer Science',
  officeHours: 'Daily, 09:00 to 10:00',
  orcid: '',
  scholarUrl: '',
  cvLink: '',
  visibility: { email: 'public', photo: 'public' },
}

type W = {
  title: string
  year: number
  venue: string
  doi: string
  authors: string[]
  status: 'claimed' | 'pending' | 'rejected' | 'duplicate'
  ago: number
}
const RK = 'Rizwan Khan'
const works: W[] = [
  {
    title: 'Accessible Public Websites for Universities on Slow Connections',
    year: 2026,
    venue: 'Proceedings of the Demonstration Workshop on Digital Public Services',
    doi: '10.5555/demo.2026.001',
    authors: [RK, 'Bilal Ahmad'],
    status: 'claimed',
    ago: 20,
  },
  {
    title: 'Passkey Sign-In for Faculty Portals: A Usability Study',
    year: 2026,
    venue: 'Journal of Demonstration Computing',
    doi: '10.5555/demo.2026.002',
    authors: [RK, 'Sana Iqbal'],
    status: 'claimed',
    ago: 18,
  },
  {
    title: 'A Bilingual English and Urdu Content Model for University Websites',
    year: 2025,
    venue: 'Demonstration Conference on Language Technology',
    doi: '10.5555/demo.2025.003',
    authors: [RK],
    status: 'claimed',
    ago: 40,
  },
  {
    title: 'Review Workflows for Faculty Self-Service Profiles',
    year: 2025,
    venue: 'Demonstration Symposium on Academic Information Systems',
    doi: '10.5555/demo.2025.004',
    authors: [RK, 'Bilal Ahmad'],
    status: 'claimed',
    ago: 38,
  },
  {
    title: 'Testing Accessibility Claims with a Checklist-Driven Approach',
    year: 2024,
    venue: 'Demonstration Workshop on Software Quality',
    doi: '10.5555/demo.2024.005',
    authors: [RK],
    status: 'claimed',
    ago: 90,
  },
  {
    title: 'Search over Mixed English and Urdu Academic Pages',
    year: 2024,
    venue: 'Demonstration Workshop on Information Retrieval',
    doi: '10.5555/demo.2024.006',
    authors: [RK, 'Sana Iqbal'],
    status: 'pending',
    ago: 1,
  },
  {
    title: 'Notification Digests without Email: An Append-Only Log',
    year: 2026,
    venue: 'Demonstration Workshop on Digital Public Services',
    doi: '10.5555/demo.2026.007',
    authors: [RK],
    status: 'pending',
    ago: 1,
  },
  {
    title: 'Moving a University Website without Breaking Old Links',
    year: 2025,
    venue: 'Demonstration Symposium on Web Engineering',
    doi: '',
    authors: [RK, 'Bilal Ahmad'],
    status: 'pending',
    ago: 1,
  },
  {
    title: 'Low-Cost Soil Moisture Sensing for Small Farms',
    year: 2019,
    venue: 'Journal of Demonstration Instruments',
    doi: '10.5555/demo.2019.008',
    authors: ['R. Khan', 'A. Other'],
    status: 'rejected',
    ago: 5,
  },
  {
    title: 'Accessible Public Websites for Universities on Slow Connections (preprint)',
    year: 2026,
    venue: 'Demonstration Preprint Server',
    doi: '',
    authors: [RK, 'Bilal Ahmad'],
    status: 'duplicate',
    ago: 4,
  },
]
const courses: Array<[string, string, string, number, string]> = [
  ['CS-301', 'Web Engineering', 'Fall', 2026, 'BS Computer Science'],
  ['CS-210', 'Software Engineering', 'Fall', 2026, 'BS Software Engineering'],
  ['CS-415', 'Information Security', 'Fall', 2026, 'BS Computer Science'],
  ['CS-301', 'Web Engineering', 'Spring', 2026, 'BS Computer Science'],
  ['CS-122', 'Programming Fundamentals', 'Spring', 2026, 'BS Software Engineering'],
  ['CS-250', 'Database Systems', 'Fall', 2025, 'BS Computer Science'],
  ['CS-499', 'Final Year Project', 'Fall', 2025, 'BS Software Engineering'],
]
const sanaCourses: Array<[string, string, string, number, string]> = [
  ['CS-122', 'Programming Fundamentals', 'Fall', 2026, 'BS Computer Science'],
  ['CS-250', 'Database Systems', 'Fall', 2026, 'BS Software Engineering'],
]

const out: string[] = ['set local search_path to identity']
const sql = (s: string) => out.push(s)

// Each profile text is written once, into a temporary table that lasts for the transaction, and referenced by key below.
const rizwanBefore = { ...rizwanEdit, officeHours: '' }
sql('create temporary table "_e" ("k" text primary key, "v" jsonb not null) on commit drop')
sql(`insert into "_e" ("k","v") values ('R', ${j(rizwanEdit)}), ('R0', ${j(rizwanBefore)}), ('B', ${j(bilalEdit)}), ('S', ${j(sanaEdit)})`)
const E = (k: string): string => `(select "v" from "_e" where "k" = '${k}')`

sql(
  `update "user" set "name" = 'Rizwan Khan', "email" = 'rizwan.khan@example.invalid' where "id" = ${q(R)}`,
)
sql(
  `update "user" set "name" = 'Dr. Bilal Ahmad', "email" = 'bilal.ahmad@example.invalid' where "id" = ${q(B)}`,
)
sql(
  `update "user" set "name" = 'Sana Iqbal', "email" = 'sana.iqbal@example.invalid' where "id" = ${q(S)}`,
)
sql(
  `update "account_department" set "department" = ${q(DEPT)} where "userId" in (${q(R)}, ${q(B)}, ${q(S)})`,
)
sql(`insert into "head_role" ("userId") values (${q(B)}) on conflict do nothing`)
for (const [id, ur, en, enUr, photo] of [
  [R, 'رضوان خان', 'Software Engineer', 'سافٹ ویئر انجینئر', 'rizwan'],
  [B, 'ڈاکٹر بلال احمد', 'Associate Professor', 'ایسوسی ایٹ پروفیسر', 'bilal'],
  [S, 'ثنا اقبال', 'Lecturer', 'لیکچرر', 'sana'],
] as const) {
  sql(
    `insert into "account_fixed" ("userId","nameUr","designationEn","designationUr","photo") values (${q(id)}, ${q(ur)}, ${q(en)}, ${q(enUr)}, ${q(`/portal-avatars/${photo}.svg`)}) on conflict ("userId") do update set "nameUr" = excluded."nameUr", "designationEn" = excluded."designationEn", "designationUr" = excluded."designationUr", "photo" = excluded."photo"`,
  )
}

// Profiles. Rizwan: approved and published (his draft equals what is published). Bilal: approved. Sana: submitted, waiting for review.
sql(
  `insert into "profile_draft" ("userId","edit","status","updatedAt") values (${q(R)}, ${E('R')}, 'draft', now() - interval '2 days') on conflict ("userId") do nothing`,
)
sql(
  `insert into "profile_published" ("userId","edit","approvedBy","approvedAt") values (${q(R)}, ${E('R')}, ${q(B)}, now() - interval '2 days') on conflict ("userId") do nothing`,
)
sql(
  `insert into "profile_draft" ("userId","edit","status","updatedAt") values (${q(B)}, ${E('B')}, 'draft', now() - interval '30 days') on conflict ("userId") do nothing`,
)
sql(
  `insert into "profile_published" ("userId","edit","approvedBy","approvedAt") values (${q(B)}, ${E('B')}, ${q(B)}, now() - interval '30 days') on conflict ("userId") do nothing`,
)
sql(
  `insert into "profile_draft" ("userId","edit","status","updatedAt") values (${q(S)}, ${E('S')}, 'submitted', now() - interval '3 hours') on conflict ("userId") do nothing`,
)
sql(
  `insert into "profile_review" ("userId","reviewerId","decision","note","before","after","at") values (${q(R)}, ${q(B)}, 'changes-requested', 'Please add your office hours so students know when to find you.', null, ${E('R0')}, now() - interval '5 days')`,
)
sql(
  `insert into "profile_review" ("userId","reviewerId","decision","note","before","after","at") values (${q(R)}, ${q(B)}, 'approved', null, ${E('R0')}, ${E('R')}, now() - interval '2 days')`,
)

// Works
for (const w of works) {
  const doiKey = w.doi ? normaliseDoi(w.doi) : null
  sql(
    `insert into "publication_candidate" ("userId","doiKey","titleKey","title","year","venue","authors","status","sample","createdAt","decidedAt") values (${q(R)}, ${q(doiKey)}, ${q(titleKey(w.title, w.year))}, ${q(w.title)}, ${w.year}, ${q(w.venue)}, ${j(w.authors)}, 'pending', true, now() - interval '${w.ago + 1} days', null) on conflict do nothing`,
  )
}
for (const w of works.filter((x) => x.status !== 'pending')) {
  const key = titleKey(w.title, w.year)
  const dup =
    w.status === 'duplicate'
      ? `, "duplicateOf" = (select "id" from "publication_candidate" where "userId" = ${q(R)} and "titleKey" = ${q(titleKey(works[0]!.title, works[0]!.year))})`
      : ''
  sql(
    `update "publication_candidate" set "status" = '${w.status}'${dup}, "decidedAt" = now() - interval '${w.ago} days' where "userId" = ${q(R)} and "titleKey" = ${q(key)}`,
  )
}
// Courses
for (const [uid, list] of [
  [R, courses],
  [S, sanaCourses],
] as const) {
  for (const [code, title, season, year, programme] of list) {
    sql(
      `insert into "course_taught" ("userId","code","title","season","year","programme","source") values (${q(uid)}, ${q(code)}, ${q(title)}, ${q(season)}, ${year}, ${q(programme)}, 'manual') on conflict do nothing`,
    )
  }
}

// Delegations: Rizwan gives Sana his profile, works and courses; Sana gives Rizwan her courses.
sql(
  `insert into "delegation" ("grantorId","delegateId","sections","createdAt","expiresAt") values (${q(R)}, ${q(S)}, array['profile','publications','courses'], now() - interval '3 days', now() + interval '27 days')`,
)
sql(
  `insert into "delegation" ("grantorId","delegateId","sections","createdAt","expiresAt") values (${q(S)}, ${q(R)}, array['courses'], now() - interval '1 day', now() + interval '44 days')`,
)
sql(
  `insert into "delegation_audit" ("at","actorId","subjectId","delegationId","section","action") select now() - interval '2 days', ${q(S)}, ${q(R)}, d."id", 'courses', 'addCourse' from "delegation" d where d."grantorId" = ${q(R)} and d."delegateId" = ${q(S)}`,
)
sql(
  `insert into "delegation_audit" ("at","actorId","subjectId","delegationId","section","action") select now() - interval '2 days', ${q(S)}, ${q(R)}, d."id", 'publications', 'claimWork' from "delegation" d where d."grantorId" = ${q(R)} and d."delegateId" = ${q(S)}`,
)
sql(
  `insert into "delegation_audit" ("at","actorId","subjectId","delegationId","section","action") select now() - interval '1 day', ${q(S)}, ${q(R)}, d."id", 'profile', 'saveProfile' from "delegation" d where d."grantorId" = ${q(R)} and d."delegateId" = ${q(S)}`,
)

// Notices: waiting items, one earlier digest and one security notice for Rizwan; a review waiting for Bilal.
sql(
  `insert into "notification_pref" ("userId","cadence") values (${q(R)}, 'daily') on conflict do nothing`,
)
for (const [kind, n, ago] of [
  ['profile-approved', 1, '2 days'],
  ['works-found', 3, '20 hours'],
  ['delegation-received', 1, '1 day'],
  ['delegate-activity', 3, '1 day'],
] as const) {
  sql(
    `insert into "notification" ("userId","kind","n","at") values (${q(R)}, ${q(kind)}, ${n}, now() - interval '${ago}')`,
  )
}
sql(
  `insert into "notice_log" ("userId","class","cadence","at","lines") values (${q(R)}, 'digest', 'daily', now() - interval '30 hours', jsonb_build_array(jsonb_build_object('kind','profile-returned','count',1,'firstAt',(extract(epoch from now() - interval '5 days')*1000)::bigint,'lastAt',(extract(epoch from now() - interval '5 days')*1000)::bigint), jsonb_build_object('kind','account-confirmed','count',1,'firstAt',(extract(epoch from now() - interval '6 days')*1000)::bigint,'lastAt',(extract(epoch from now() - interval '6 days')*1000)::bigint)))`,
)
sql(
  `insert into "notice_log" ("userId","class","at","lines") values (${q(R)}, 'security', now() - interval '6 days', jsonb_build_array(jsonb_build_object('kind','passkey-added','count',1,'firstAt',(extract(epoch from now() - interval '6 days')*1000)::bigint,'lastAt',(extract(epoch from now() - interval '6 days')*1000)::bigint)))`,
)
sql(
  `insert into "notification" ("userId","kind","n","at") values (${q(B)}, 'review-waiting', 1, now() - interval '3 hours')`,
)

if (flag === '--sql')
  console.log(
    out
      .slice(1)
      .map((s) => s + ';')
      .join('\n'),
  )
else console.log(JSON.stringify(out))
